import "./Discussion.css";
import { useState } from 'react';

function Discussion() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "Bộ giáo dục thông tin về kỳ thi THPT 2026",
      author: "Teacher A",
      excerpt: "Bộ giáo dục đã thông báo về lịch thi, nội dung ôn tập và các mốc thời gian quan trọng.",
      comments: [
        { id: 1, author: "Student X", text: "Cảm ơn thầy đã chia sẻ!" },
        { id: 2, author: "Student Y", text: "Lịch thi có thay đổi không?" }
      ]
    },
    {
      id: 2,
      title: "Lộ trình luyện đề hiệu quả",
      author: "Teacher B",
      excerpt: "Chia sẻ kinh nghiệm luyện đề THPT với phương pháp tối ưu thời gian và tăng cường phản xạ.",
      comments: [
        { id: 1, author: "Student Z", text: "Rất hữu ích, cảm ơn!" }
      ]
    },
  ]);

  const addComment = (postId, commentText) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, comments: [...post.comments, { id: Date.now(), author: "Bạn", text: commentText }] }
        : post
    ));
  };

  return (
    <div className="discussion-page">
      <div className="discussion-header">
        <h1>Tạo bài đăng mới</h1>
      </div>

      <div className="discussion-form-card">
        <div className="discussion-form-row">
          <label>Tiêu đề:</label>
          <input type="text" className="discussion-input" placeholder="Nhập tiêu đề..." />
        </div>
        <div className="discussion-form-row">
          <label>Nội dung:</label>
          <textarea className="discussion-textarea" placeholder="Nhập nội dung..."></textarea>
        </div>
        <div className="discussion-form-row">
          <label>Ảnh:</label>
          <input type="text" className="discussion-input" placeholder="Đường dẫn ảnh..." />
        </div>
        <button className="btn-submit">Đăng bài</button>
      </div>

      <div className="discussion-posts">
        {posts.map((post) => (
          <article key={post.id} className="discussion-card">
            <h3>{post.title}</h3>
            <div className="discussion-meta">Tác giả: {post.author}</div>
            <p className="discussion-body">{post.excerpt}</p>
            <hr className="divider" />
            <div className="comment-block">
              <label>Bình luận</label>
              <div className="comments-list">
                {post.comments.map(comment => (
                  <div key={comment.id} className="comment">
                    <strong>{comment.author}:</strong> {comment.text}
                  </div>
                ))}
              </div>
              <input type="text" className="comment-input" placeholder="Bình luận..." onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  addComment(post.id, e.target.value.trim());
                  e.target.value = '';
                }
              }} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Discussion;
