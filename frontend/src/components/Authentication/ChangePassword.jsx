import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./styles.css";

function ChangePassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [tokenStatus, setTokenStatus] = useState(token ? "checking" : "invalid");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    let isMounted = true;

    const verifyToken = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/authentication/reset-password?token=${token}`,
        );

        if (isMounted) {
          setTokenStatus(response.data.valid ? "valid" : "invalid");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        if (isMounted) {
          setTokenStatus("invalid");
        }
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const onSubmit = async (data) => {
    setSubmitStatus("loading");
    setSubmitMessage("");

    try {
      const response = await axios.post(
        "http://localhost:3000/api/authentication/reset-password",
        {
          email: data.email,
          token,
          newPassword: data.newPassword,
        },
      );

      if (response.status === 200) {
        setSubmitStatus("success");
        setSubmitMessage("Mật khẩu của bạn đã được cập nhật. Vui lòng đăng nhập lại.");
        setTimeout(() => navigate("/login"), 1200);
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setSubmitStatus("error");
      setSubmitMessage(
        error?.response?.data?.message ||
          "Không thể đổi mật khẩu. Vui lòng thử lại sau.",
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--small">
        <div className="auth-card__header">
          <p className="auth-eyebrow">Đặt lại mật khẩu</p>
          <h1>Đổi mật khẩu mới</h1>
          <p className="auth-description">
            Sử dụng liên kết trong email để tạo mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        {tokenStatus === "checking" && (
          <div className="auth-alert auth-alert--info">
            Đang xác minh liên kết đổi mật khẩu...
          </div>
        )}

        {tokenStatus === "invalid" && (
          <div className="auth-alert auth-alert--error">
            Liên kết đổi mật khẩu không hợp lệ hoặc đã hết hạn.
          </div>
        )}

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: tokenStatus === "valid" ? "grid" : "none" }}
        >
          <label className="auth-label">
            <span>Email của bạn</span>
            <input
              className="auth-input"
              type="email"
              placeholder="name@example.com"
              autoComplete="email"
              defaultValue=""
              {...register("email", { required: "Email là bắt buộc" })}
            />
            {errors.email && (
              <span className="auth-error">{errors.email.message}</span>
            )}
          </label>

          <label className="auth-label">
            <span>Mật khẩu mới</span>
            <input
              className="auth-input"
              type="password"
              placeholder="Mật khẩu mới"
              autoComplete="new-password"
              defaultValue=""
              {...register("newPassword", {
                required: "Mật khẩu mới là bắt buộc",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
              })}
            />
            {errors.newPassword && (
              <span className="auth-error">{errors.newPassword.message}</span>
            )}
          </label>

          <label className="auth-label">
            <span>Xác nhận mật khẩu</span>
            <input
              className="auth-input"
              type="password"
              placeholder="Xác nhận mật khẩu"
              autoComplete="new-password"
              defaultValue=""
              {...register("confirmPassword", {
                required: "Vui lòng xác nhận mật khẩu",
                validate: (value) =>
                  value === getValues("newPassword") ||
                  "Mật khẩu xác nhận không khớp",
              })}
            />
            {errors.confirmPassword && (
              <span className="auth-error">{errors.confirmPassword.message}</span>
            )}
          </label>

          <button
            className="auth-button"
            type="submit"
            disabled={submitStatus === "loading"}
          >
            {submitStatus === "loading" ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </button>

          {submitMessage && (
            <div
              className={`auth-alert auth-alert--${
                submitStatus === "success" ? "success" : "error"
              }`}
            >
              {submitMessage}
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

export default ChangePassword;
