import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./Header.scss";

function Header() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isAdminOrTeacher = user?.role === "admin" || user?.role === "teacher";
  const homePath = isAdminOrTeacher ? "/admin" : "/";
  const practicePath = isAdminOrTeacher ? "/admin/view-list-exam" : "/view-exam";
  const profilePath = isAdminOrTeacher ? "/admin" : "/history-exam";

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="header">
      <div>
        <Link to={homePath} className="header__logo">
          <img className="header__logo--image" src="/favicon.svg" alt="Learn Hub" />
          <p className="header__logo--name">Learn Hub</p>
        </Link>
      </div>

      <div className="header__tab">
        <ul>
          <li className="header__tab--item">
            <NavLink
              to={homePath}
              end
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Trang chủ
            </NavLink>
          </li>
          <li className="header__tab--item">
            <NavLink
              to="/courses"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Khóa học
            </NavLink>
          </li>
          <li className="header__tab--item">
            <NavLink
              to={practicePath}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Luyện đề
            </NavLink>
          </li>
          <li className="header__tab--item">
            <NavLink
              to="/view-post"
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Thảo luận
            </NavLink>
          </li>
          <li className="header__tab--item">
            <NavLink
              to={profilePath}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              Trang cá nhân
            </NavLink>
          </li>
        </ul>
      </div>

      <div className="logout__btn">
        <button type="button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>
    </header>
  );
}

export default Header;
