import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import PostSearch from "./PostSearch";
import "./styles.css";

function ViewPost({ refresh }) {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/discussion/get-posts");
        if (isMounted) {
          setPosts(Array.isArray(response.data.posts) ? response.data.posts : []);
        }
      } catch (error) {
        console.error("Error fetching discussions:", error);
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [refresh]);

  return (
    <div className="discussion-page-container">
      <button
        type="button"
        onClick={() => navigate("/discuss")}
        className="create-new-post"
      >
        Tạo bài đăng mới.
      </button>

      <div className="search-header-row">
        <h3>Danh sách bài đăng</h3>
        <PostSearch onSelect={(post) => navigate(`/view-post/${encodeURIComponent(post.post_id)}`)} />
      </div>

      {posts.length === 0 ? (
        <p>Không có bài đăng nào.</p>
      ) : (
        <div>
          {posts.map((post) => (
            <div key={post.post_id} className="discussion-form-card">
              <Link to={`/view-post/${encodeURIComponent(post.post_id)}`}>
                <h5>{post.title}</h5>
              </Link>
              <h6 className="created-time">{new Date(post.created_at).toLocaleString("vi-VN")}</h6>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ViewPost;
