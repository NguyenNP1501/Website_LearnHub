import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const getDefaultPathByRole = (role) => (role === "admin" ? "/admin" : "/");

function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, isBootstrapping, user } = useAuth();
  const location = useLocation();

  if (isBootstrapping) {
    return <div className="auth-guard">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getDefaultPathByRole(user?.role)} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
