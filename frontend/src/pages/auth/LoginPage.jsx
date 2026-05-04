import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

const DEFAULT_FORM = {
  email: "",
  password: "",
  role: "student",
};

const getNextPath = (userRole) => (userRole === "admin" ? "/admin" : "/");

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (isAuthenticated && user) {
    return <Navigate to={getNextPath(user.role)} replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const loggedInUser = await login(formData);
      const nextPath = location.state?.from?.pathname || getNextPath(loggedInUser.role);
      navigate(nextPath, { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Không thể đăng nhập.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-card__intro">
          <p className="login-card__eyebrow">LearnHub</p>
          <h1>Đăng nhập để tiếp tục</h1>
          <p>
            Chọn đúng vai trò của bạn để vào khu vực học viên hoặc quản trị đề thi.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="login-field">
            <span>Mật khẩu</span>
            <input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
            />
          </label>

          <label className="login-field">
            <span>Vai trò</span>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="student">Học viên</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </label>

          {error && <div className="login-error">{error}</div>}

          <button className="login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
