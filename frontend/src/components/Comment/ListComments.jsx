import { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";

function parseCommentImages(imageUrl) {
  if (!imageUrl) {
    return [];
  }

  if (Array.isArray(imageUrl)) {
    return imageUrl;
  }

  if (typeof imageUrl !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(imageUrl);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [imageUrl];
  }
}

function ListComments({ post_id: postId, refreshTrigger }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!postId) {
      return undefined;
    }

    let isMounted = true;

    const fetchComments = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/comment/get-comments/${postId}`,
        );
        const data = Array.isArray(response.data.comments) ? response.data.comments : [];

        if (isMounted) {
          setComments(data);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchComments();

    return () => {
      isMounted = false;
    };
  }, [postId, refreshTrigger]);

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const date = new Date(time);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
            const author = comment.user_name || "Người dùng";
            const time = formatTime(comment.created_at || comment.updated_at);

            return (
              <article
                key={comment.comment_id || comment.id || index}
                className="comment-card"
              >
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
                    {images.map((url, imageIndex) => (
                      <img
                        key={imageIndex}
                        src={encodeURI(`http://localhost:3000/${url}`)}
                        alt={`Comment ${imageIndex}`}
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
