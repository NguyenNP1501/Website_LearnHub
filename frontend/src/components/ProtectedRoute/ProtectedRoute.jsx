import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, isReady, user } = useAuth();
  const location = useLocation();

  if (!isReady) {
    return <div className="loading-state">Đang kiểm tra phiên đăng nhập...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    const fallbackPath = user?.role === "admin" ? "/admin" : "/";
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
