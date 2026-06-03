import { useEffect, useState } from "react";
import axios from "axios";
import './styles.css';

function parseCommentImages(img_url) {
    if (!img_url) return [];
    if (Array.isArray(img_url)) return img_url;
    if (typeof img_url !== 'string') return [];

    try {
        const parsed = JSON.parse(img_url);
        return Array.isArray(parsed) ? parsed : [parsed];
    }
    catch {
        return [img_url];
    }
}

function ListComments({post_id, refreshTrigger}) {
    const [comments, setComments] = useState([]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/api/comment/get-comments/${post_id}`);
            const data = Array.isArray(response.data.comments) ? response.data.comments : [];
            console.debug('Fetched comments:', data);
            setComments(data);
        }
        catch (err) {
            console.error('Error fetching comments:', err);
        }
    }

    useEffect(() => {
        if (!post_id) return;
        fetchComments();
    }, [post_id, refreshTrigger]);

    const formatTime = (time) => {
        if (!time) return '';
        const date = new Date(time);
        return date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    }

    return (
        <section className="comment-section">
            <div className="comment-section-head">
                <div>
                    <h3 className="comment-section-title">Bình luận</h3>
                    <p className="comment-section-count">{comments.length} bình luận</p>
                </div>
            </div>
            {comments.length === 0 ? (
                <p className="comment-empty">Không có bình luận nào.</p>
            ) : (
                <div className="comment-list">
                    {comments.map((comment, index) => {
                        const images = parseCommentImages(comment.img_url);
                        const author = comment.user_name ||  'Người dùng';
                        const time = formatTime(comment.created_at || comment.updated_at);
                        return (
                            <article key={comment.comment_id || comment.id || index} className="comment-card">
                                <div className="comment-card-top">
                                    <div className="comment-avatar">{author.charAt(0).toUpperCase()}</div>
                                    <div className="comment-meta">
                                        <span className="comment-author-name">{author}</span>
                                        {time && <span className="comment-time">{time}</span>}
                                    </div>
                                </div>
                                <div className="comment-card-body">
                                    <p>{comment.content}</p>
                                </div>
                                {images.length > 0 && (
                                    <div className="comment-images">
                                        {images.map((url, i) => (
                                            <img
                                                key={i}
                                                src={encodeURI(`http://localhost:3000/${url}`)}
                                                alt={`Comment ${i}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default ListComments;