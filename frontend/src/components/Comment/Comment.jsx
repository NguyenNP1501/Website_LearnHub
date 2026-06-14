import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import "./styles.css";
import ListComments from "./ListComments";
import { getStoredToken } from "../../utils/authStorage";

function Comment({ post_id: postId }) {
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
  } = useForm();
  const [refreshComment, setRefreshComment] = useState(0);
  const token = getStoredToken();

  const onSubmit = async (data) => {
    try {
      if (!data.content.trim()) {
        return;
      }

      const formData = new FormData();
      formData.append("post_id", postId);
      formData.append("content", data.content);
      formData.append("folderType", "Comment");

      if (data.imageUrl && data.imageUrl.length > 0) {
        Array.from(data.imageUrl).forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await axios.post("http://localhost:3000/api/comment", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          'Authorization': `Bearer ${token}`
        },
      });

      setRefreshComment((previous) => previous + 1);
      reset();

      if (response.status === 201) {
        console.log("Bình luận đã được tạo thành công.");
      }
    } catch (error) {
      console.error("Error:", error);
      console.log("Bình luận thất bại");
    }
  };

  return (
    <div className="comment-wrapper">
      <div className="comments-list">
        <ListComments post_id={postId} refreshTrigger={refreshComment} />
      </div>

      <form className="comment-input" onSubmit={handleSubmit(onSubmit)}>
        <textarea
          {...register("content", { required: "Vui lòng nhập nội dung bình luận" })}
          placeholder="Viết bình luận"
          onKeyDown={(event) => {
            if (event.isComposing || event.keyCode === 229) {
              return;
            }

            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              handleSubmit(onSubmit)();
            }
          }}
        />
        {errors.content && <p className="comment-error">{errors.content.message}</p>}

        <input
          id="imageUrl"
          type="file"
          accept="image/*"
          multiple
          {...register("imageUrl")}
        />
      </form>
    </div>
  );
}

export default Comment;