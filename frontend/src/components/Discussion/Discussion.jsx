import axios from "axios";
import { useForm } from "react-hook-form";
import "./styles.css";
import { getStoredToken } from "../../utils/authStorage";

function Discussion() {


  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const token = getStoredToken();
  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("content", data.content);
      formData.append("folderType", "Post");

      if (data.imageUrl && data.imageUrl.length > 0) {
        Array.from(data.imageUrl).forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await axios.post("http://localhost:3000/api/discussion", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      reset();

      if (response.status === 201) {
        alert("Bài đăng đã được tạo thành công.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      alert(`Server error: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="discussion-page-container">
      <form className="register-discussion" onSubmit={handleSubmit(onSubmit)}>
        <label className="discussion-title">Tiêu đề</label>
        <input
          className="discussion-input"
          type="text"
          {...register("title", { required: "Tiêu đề là bắt buộc" })}
          placeholder="Nhập tiêu đề..."
        />
        {errors.title && <p style={{ color: "red" }}>{errors.title.message}</p>}

        <br />

        <label className="discussion-title" htmlFor="content">
          Nội dung
        </label>
        <textarea
          className="discussion-textarea"
          {...register("content", { required: "Nội dung là bắt buộc" })}
          placeholder="Nhập nội dung..."
        />
        {errors.content && <p style={{ color: "red" }}>{errors.content.message}</p>}

        <br />

        <label htmlFor="imageUrl" className="discussion-title">
          Chọn ảnh
        </label>
        <input
          id="imageUrl"
          type="file"
          accept="image/*"
          multiple
          {...register("imageUrl")}
        />

        <br />
        <button type="submit" className="discussion-submit">
          Đăng bài
        </button>
      </form>
    </div>
  );
}

export default Discussion;
