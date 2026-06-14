import { useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link } from "react-router-dom";
import "./styles.css";

function SendToken() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    setStatus("loading");
    setMessage("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/authentication/handle-token",
        { email: data.email },
      );

      if (response.status === 200) {
        setStatus("success");
        setMessage(
          "Yêu cầu đổi mật khẩu đã được gửi. Vui lòng kiểm tra email để lấy hướng dẫn.",
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("error");
      setMessage(
        error?.response?.data?.message ||
          "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--small">
        <div className="auth-card__header">
          <p className="auth-eyebrow">Quên mật khẩu</p>
          <h1>Gửi yêu cầu đặt lại mật khẩu</h1>
          <p className="auth-description">
            Nhập email đã đăng ký, chúng tôi sẽ gửi cho bạn liên kết để tạo mật khẩu mới.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <label className="auth-label">
            <span>Email của bạn</span>
            <input
              className="auth-input"
              type="email"
              placeholder="name@example.com"
              {...register("email", { required: "Email là bắt buộc" })}
            />
            {errors.email && (
              <span className="auth-error">{errors.email.message}</span>
            )}
          </label>

          <button
            className="auth-button"
            type="submit"
            disabled={status === "loading"}
          >
            {status === "loading" ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>

          {message && (
            <div
              className={`auth-alert auth-alert--${
                status === "success" ? "success" : "error"
              }`}
            >
              {message}
            </div>
          )}

          <div className="auth-footer">
            <Link to="/login">Quay lại đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SendToken;
