import { useEffect, useState } from 'react';
import './Discussion.css';

export default function Discussion() {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});

  const loadPosts = async () => {
    try {
      const response = await fetch('/api/discussion');
      if (!response.ok) throw new Error('Không tải được dữ liệu');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error(error);
      setMessage('Lỗi khi tải bài đăng. Vui lòng thử lại.');
    }
  };

  const handleCommentChange = (postId, value) => {
    setComments((prev) => ({ ...prev, [postId]: value }));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const parseResponse = async (response) => {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!content.trim()) {
      setMessage('Vui lòng nhập nội dung.');
      return;
    }

    const titleFromContent = content.trim().split('\n')[0].slice(0, 100) || 'Bài đăng mới';

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/discussion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: titleFromContent,
          content: content.trim(),
          image_url: imageUrl.trim() || null,
        }),
      });

      const parsed = await parseResponse(response);
      if (!response.ok) {
        const message = parsed?.message || (typeof parsed === 'string' ? parsed : 'Lỗi khi đăng bài');
        throw new Error(message);
      }

      const newPost = parsed || {
        discussion_id: Date.now(),
        title: titleFromContent,
        content: content.trim(),
        image_url: imageUrl.trim() || null,
        created_at: new Date().toISOString(),
      };

      setPosts((prev) => [newPost, ...prev]);
      setContent('');
      setImageUrl('');
      setMessage('Đăng bài thành công!');
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Lỗi khi đăng bài.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="discussion-page-container">
      <div className="discussion-form-card">
        <h2 className="discussion-title">Tạo bài đăng mới</h2>
        <form className="discussion-form" onSubmit={handleSubmit}>
          <label className="discussion-label" htmlFor="content">
            Nội dung:
          </label>
          <textarea
            id="content"
            className="discussion-textarea"
            value={content}
            placeholder="Nhập nội dung..."
            onChange={(e) => setContent(e.target.value)}
          />

          <label className="discussion-label" htmlFor="imageUrl">
            Ảnh:
          </label>
          <input
            id="imageUrl"
            className="discussion-input"
            type="text"
            value={imageUrl}
            placeholder="Đường dẫn ảnh..."
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <button className="discussion-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Đang gửi...' : 'Đăng bài'}
          </button>

          {message && <p className="discussion-message">{message}</p>}
        </form>
      </div>

      <div className="discussion-list">
        <h3 className="discussion-section-title">Bài đăng gần đây</h3>
        {posts.length === 0 ? (
          <p className="discussion-empty">Chưa có bài đăng nào.</p>
        ) : (
          posts.map((post) => (
            <div key={post.discussion_id} className="discussion-post-card">
              <div className="discussion-post-header">
                <h4>{post.title}</h4>
                <span>{new Date(post.created_at || Date.now()).toLocaleString('vi-VN')}</span>
              </div>
              <p>{post.content}</p>
              {post.image_url && (
                <div className="discussion-post-image-wrapper">
                  <img className="discussion-post-image" src={post.image_url} alt={post.title} />
                </div>
              )}
              <div className="discussion-comment-section">
                <label className="discussion-comment-label">Bình luận</label>
                <input
                  className="discussion-comment-input"
                  type="text"
                  placeholder="Bình luận..."
                  value={comments[post.discussion_id] || ''}
                  onChange={(e) => handleCommentChange(post.discussion_id, e.target.value)}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
