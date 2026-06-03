import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import "./SessionBar.scss";

function SessionBar({ title, subtitle }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    // <header className="session-bar">
    //   <div>
    //     <p className="session-bar__eyebrow">
    //       {user?.role === "admin" ? "Quản trị viên" : "Học viên"}
    //     </p>
    //     <h1>{title}</h1>
    //     <p className="session-bar__subtitle">{subtitle}</p>
    //   </div>

    //   <div className="session-bar__actions">
    //     <div className="session-bar__identity">
    //       <strong>{user?.name || "Tài khoản"}</strong>
    //       <span>{user?.email}</span>
    //     </div>
    //     <button className="session-bar__button" type="button" onClick={handleLogout}>
    //       Đăng xuất
    //     </button>
    //   </div>
    // </header>
    <></>
  );
}

export default SessionBar;
