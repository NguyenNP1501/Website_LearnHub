import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./LoginPage.scss";

const getDefaultPathByRole = (role) => (role === "admin" ? "/admin" : "/");

function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to={getDefaultPathByRole(user?.role)} replace />;
  }

  const handleChange = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const session = await login(formData);
      navigate(getDefaultPathByRole(session.user.role), { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Không thể đăng nhập. Hãy thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page__hero">
        <div className="login-page__copy">
          <p className="login-page__eyebrow">REMAKE 2</p>
          <h1>Đăng nhập để tiếp tục vào hệ thống luyện đề</h1>
          <p>
            Cùng một màn hình đăng nhập cho học viên và quản trị. Chọn đúng vai trò
            để vào đúng khu vực làm việc.
          </p>
        </div>

        <div className="login-page__credentials">
          <h2>Tài khoản mẫu</h2>
          <div className="login-page__credential-card">
            <strong>Quản trị</strong>
            <span>admin@elearning.local</span>
            <span>admin123</span>
          </div>
          <div className="login-page__credential-card">
            <strong>Học viên</strong>
            <span>student@elearning.local</span>
            <span>student123</span>
          </div>
        </div>
      </div>

      <section className="login-card">
        <div className="login-card__header">
          <h2>Đăng nhập</h2>
          <p>Nhập email, mật khẩu và chọn đúng vai trò tài khoản.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__roles">
            <button
              className={formData.role === "student" ? "is-active" : ""}
              type="button"
              onClick={() => handleChange("role", "student")}
            >
              Học viên
            </button>
            <button
              className={formData.role === "admin" ? "is-active" : ""}
              type="button"
              onClick={() => handleChange("role", "admin")}
            >
              Giáo viên
            </button>
          </div>

          <label>
            <span>Email</span>
            <input
              type="email"
              value={formData.email}
              onChange={(event) => handleChange("email", event.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>

          <label>
            <span>Mật khẩu</span>
            <input
              type="password"
              value={formData.password}
              onChange={(event) => handleChange("password", event.target.value)}
              placeholder="Nhập mật khẩu"
              required
            />
          </label>

          {error && <div className="login-form__error">{error}</div>}

          <button className="login-form__submit" type="submit" disabled={submitting}>
            {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <div className="login-parent">
            <div className="login-form__register"
              className={formData.role == "admin" ? "hide" : ""}>
              <Link to="/register">Đăng ký</Link>
            </div>
            <div className="login-fogot">
              <Link to="/forgot-password">Quên mật khẩu</Link>
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}

export default LoginPage;
