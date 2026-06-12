import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ChangePassword from "./components/Authentication/ChangePassword";
import SendToken from "./components/Authentication/SendToken";
import Discussion from "./components/Discussion/Discussion";
import PostDetail from "./components/Discussion/PostDetail";
import ViewPost from "./components/Discussion/ViewPost";
import Header from "./components/Header";
import Home from "./components/Home/Home";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { useAuth } from "./context/useAuth";
import { AdminLayout, StudentLayout } from "./layouts/AppLayout";
import CreateExam from "./pages/admin/CreateExam";
import EditExam from "./pages/admin/EditExam";
import ExamList from "./pages/admin/ExamList";
import ManageDeleted from "./pages/admin/manage/ManageDeleted";
import ManageExported from "./pages/admin/manage/ManageExported";
import ManageSaved from "./pages/admin/manage/ManageSaved";
import ViewExam from "./pages/admin/ViewExam";
import LoginPage from "./pages/auth/LoginPage";
import DoExam from "./pages/client/DoExam";
import HistoryExam from "./pages/client/HistoryExam";
import ResultExam from "./pages/client/ResultExam";
import SearchExam from "./pages/client/SearchExam";
import ViewExamClient from "./pages/client/ViewExamClient";

// ============ IMPORT COMPONENT CỦA COURSE ============
// Dành cho Học sinh (Client)
import CoursePortal from './pages/client/KhoaHoc/CoursePortal'
import ClientCourseDetail from './pages/client/KhoaHoc/CourseDetail'
import LearningLesson from './pages/client/KhoaHoc/LearningLesson'

// Dành cho Quản trị viên & Giáo viên (Admin)
import AdminCoursePortal from './pages/admin/KhoaHoc/AdminCoursePortal'
import CreateCourse from './pages/admin/KhoaHoc/CreateCourse'
import EditCourse from './pages/admin/KhoaHoc/EditCourse'
import AdminCourseDetail from './pages/admin/KhoaHoc/AdminCourseDetail'
import UploadLesson from './pages/admin/KhoaHoc/UploadLesson'
import EditLesson from './pages/admin/KhoaHoc/EditLesson' // 🌟 ĐÃ THÊM: Import component EditLesson

import Register from './pages/auth/Register'

const AUTH_PAGES = new Set(["/login", "/register", "/forgot-password", "/forgot", "/reset-password"]);

function AppRoutes() {
  const { user } = useAuth();

  // Kiểm tra nếu là admin HOẶC teacher thì hướng về trang quản trị /admin
  const isAdminOrTeacher = user?.role === "admin" || user?.role === "teacher";
  
  const fallbackPath = isAdminOrTeacher ? "/admin" : user?.role === "student" ? "/" : "/login";
  const legacyPracticePath = isAdminOrTeacher ? "/admin/create" : "/search-exam";
  const legacyProfilePath = isAdminOrTeacher ? "/admin" : "/history-exam";

  return (
    <Routes>
      {/* =========================================
          CÁC ROUTE KHÔNG CẦN ĐĂNG NHẬP (AUTH)
          ========================================= */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<SendToken />} />
      <Route path="/forgot" element={<Navigate to="/forgot-password" replace />} />
      <Route path="/reset-password" element={<ChangePassword />} />

      <Route
        path="/create-test"
        element={<Navigate to={legacyPracticePath} replace />}
      />
      <Route
        path="/profile"
        element={<Navigate to={legacyProfilePath} replace />}
      />

      {/* =========================================
          NHÓM ROUTE CHỈ DÀNH CHO HỌC SINH (STUDENT EXAMS)
          ========================================= */}
      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/view-exam" element={<ViewExamClient />} />
          <Route path="/do-exam/:id" element={<DoExam />} />
          <Route path="/history-exam" element={<HistoryExam />} />
          <Route path="/result-exam/:id" element={<ResultExam />} />
        </Route>
      </Route>

      {/* =========================================
          TRANG DÙNG CHUNG CHO CẢ BA ĐỐI TƯỢNG (STUDENT, TEACHER, ADMIN)
          ========================================= */}
      <Route element={<ProtectedRoute allowedRoles={["student", "admin", "teacher"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/" element={<Home />} />
          
          {/* 🌟 ĐÃ SỬA ĐỔI TẠI ĐÂY: Chuyển /courses vào nhóm dùng chung để tránh bị lỗi chặn màn hình.
              - Nếu là Giáo viên/Admin truy cập vào link này -> Tự động đẩy sang trang quản trị /admin/courses
              - Nếu là Học sinh -> Hiển thị trang danh sách khóa học CoursePortal bình thường */}
          <Route 
            path="/courses" 
            element={isAdminOrTeacher ? <Navigate to="/admin/courses" replace /> : <CoursePortal />} 
          />
          
          <Route path="/course/:courseId" element={<ClientCourseDetail />} />
          <Route path="/lesson/:lessonId" element={<LearningLesson />} />
          
          {/* Hệ thống Diễn đàn & Thảo luận */}
          <Route path="/posts" element={<ViewPost />} />
          <Route path="/view-post" element={<ViewPost />} />
          <Route path="/posts/:post_id" element={<PostDetail />} />
          <Route path="/view-post/:post_id" element={<PostDetail />} />
          <Route path="/discussion/new" element={<Discussion />} />
          <Route path="/discuss" element={<Discussion />} />
        </Route>
      </Route>

      {/* =========================================
          NHÓM ROUTE QUẢN TRỊ & BIÊN SOẠN (TEACHER, ADMIN)
          ========================================= */}
      <Route element={<ProtectedRoute allowedRoles={["admin", "teacher"]} />}>
        <Route element={<AdminLayout />}>
          {/* Quản lý Đề thi (Exam) */}
          <Route path="/admin" element={<Home />} />
          <Route path="/admin/view-list-exam" element={<ExamList />} />
          <Route path="/admin/create" element={<CreateExam />}/>
          <Route path="/admin/edit/:id" element={<EditExam />} />
          <Route path="/admin/view/:id" element={<ViewExam />} />
          <Route path="/admin/exported" element={<ManageExported />} />
          <Route path="/admin/saved" element={<ManageSaved />} />
          <Route path="/admin/deleted" element={<ManageDeleted />} />

          {/* Quản lý Khóa học & Bài giảng (Course) */}
          <Route path="/admin/courses" element={<AdminCoursePortal />} />
          <Route path="/admin/create-course" element={<CreateCourse />} />
          <Route path="/admin/edit-course/:id" element={<EditCourse />} />
          <Route path="/admin/course/:courseId" element={<AdminCourseDetail />} />
          <Route path="/admin/upload/:courseId" element={<UploadLesson />} />
          
          {/* 🌟 ĐÃ THÊM ĐƯỜNG DẪN: Trang chỉnh sửa chi tiết bài giảng */}
          <Route path="/admin/edit-lesson/:lessonId" element={<EditLesson />} />
        </Route>
      </Route>

      {/* Bẫy đường dẫn sai - Điều hướng về trang mặc định phù hợp từng Role */}
      <Route path="*" element={<Navigate to={fallbackPath} replace />} />
    </Routes>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const showHeader = !AUTH_PAGES.has(pathname);

  return (
    <div className={showHeader ? "app-shell app-shell--with-header" : "app-shell"}>
      {showHeader ? <Header /> : null}
      <AppRoutes />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
