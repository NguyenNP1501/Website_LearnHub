import { Outlet } from "react-router-dom";
import SessionBar from "../components/SessionBar/SessionBar";
import "./AppLayout.scss";

export function StudentLayout() {
  return (
    <div className="app-layout">
      <SessionBar
        title="Phòng luyện đề"
        subtitle="Đăng nhập để tìm đề, làm bài và xem lại lịch sử nộp bài của bạn."
      />
      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <div className="app-layout">
      <SessionBar
        title="Khu vực quản trị đề thi"
        subtitle="Đăng nhập với vai trò quản trị để tạo, sửa và xuất bản ngân hàng đề."
      />
      <main className="app-layout__content">
        <Outlet />
      </main>
    </div>
  );
}
