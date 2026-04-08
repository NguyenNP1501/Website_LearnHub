import { Link, NavLink } from 'react-router-dom';
import logo from "../../assets/logo.png";
import "./Header.scss";

function Header() {
  return (
    <header className="header">
      {/* LOGO */}
      <div>
        <Link to="/" className="header__logo">
          <img className="header__logo--image" src={logo} alt="Learn Hub" />
          <p className="header__logo--name">Learn Hub</p>
        </Link>
      </div>

      {/* TAB ĐIỀU HƯỚNG */}
      <div className="header__tab">
        <ul>
          <li className="header__tab--item">
            {/* THÊM CHỮ end Ở ĐÂY VÀ HÀM CLASSNAME */}
            <NavLink 
              to="/" 
              end
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Trang chủ
            </NavLink>
          </li>
          <li className="header__tab--item">
            <NavLink 
              to="/courses"
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Khoá học
            </NavLink>
          </li>
          <li className="header__tab--item">
            <NavLink 
              to="/create-test"
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Luyện đề
            </NavLink>
          </li>
          <li className="header__tab--item">
            <NavLink 
              to="/discuss"
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Thảo luận
            </NavLink>
          </li>
          <li className="header__tab--item">
            <NavLink 
              to="/profile"
              className={({ isActive }) => isActive ? "active" : ""}
            >
              Trang cá nhân
            </NavLink>
          </li>
        </ul>
      </div>

      {/* NÚT ĐĂNG XUẤT */}
      <div className="logout__btn">
        <button>Đăng xuất</button>
      </div>
    </header>
  );
}

export default Header;