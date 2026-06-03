import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft } from "lucide-react";
import Comment from "../Comment/Comment";
import "./styles.css";

function PostDetail() {
  const { post_id: postId } = useParams();
  const [post, setPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/discussion/get-posts/${postId}`,
        );
        if (isMounted) {
          setPost(response.data.post);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  if (!post) {
    return <p className="text-center">Đang tải dữ liệu...</p>;
  }

  const images = post.img_url ? JSON.parse(post.img_url) : [];

  return (
    <div>
      <div className="detail-background-view-post">
        <div className="header-container">
          <button type="button" onClick={() => navigate("/view-post")} className="back">
            <ArrowLeft size={24} />
            <span>Quay lại</span>
          </button>
          <h6 className="time-in-post">{new Date(post.created_at).toLocaleString("vi-VN")}</h6>
        </div>

        <div className="container">
          <h2 className="title">{post.title}</h2>
          <p className="content">{post.content}</p>
        </div>

        <div className="image">
          {images.map((url, index) => (
            <img
              key={index}
              src={`http://localhost:3000/${url}`}
              alt={`Post ${index}`}
              style={{ width: "800px", height: "auto", borderRadius: "8px" }}
            />
          ))}
        </div>

        <br />

        <div>
          <button type="button">Thích</button>
        </div>
      </div>

      <div>
        <Comment post_id={post.post_id} />
      </div>
    </div>
  );
}

export default PostDetail;
