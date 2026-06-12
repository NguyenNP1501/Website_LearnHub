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
import CoursePortal from './pages/client/KhoaHoc/CoursePortal'
import ClientCourseDetail from './pages/client/KhoaHoc/CourseDetail'
import LearningLesson from './pages/client/KhoaHoc/LearningLesson'

import AdminCoursePortal from './pages/admin/KhoaHoc/AdminCoursePortal'
import CreateCourse from './pages/admin/KhoaHoc/CreateCourse'
import EditCourse from './pages/admin/KhoaHoc/EditCourse'
import AdminCourseDetail from './pages/admin/KhoaHoc/AdminCourseDetail'
import UploadLesson from './pages/admin/KhoaHoc/UploadLesson'
import EditLesson from './pages/admin/KhoaHoc/EditLesson'

// ============ 🌟 DÙNG CHUNG MỘT COMPONENT PROFILE NÀY ============
import Profile from './pages/profile/Profile'; 

import Register from './pages/auth/Register'

const AUTH_PAGES = new Set(["/login", "/register", "/forgot-password", "/forgot", "/reset-password"]);

function AppRoutes() {
  const { user } = useAuth();

  const isAdminOrTeacher = user?.role === "admin" || user?.role === "teacher";
  
  const fallbackPath = isAdminOrTeacher ? "/admin" : user?.role === "student" ? "/" : "/login";
  const legacyPracticePath = isAdminOrTeacher ? "/admin/create" : "/search-exam";

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
          
          <Route 
            path="/courses" 
            element={isAdminOrTeacher ? <Navigate to="/admin/courses" replace /> : <CoursePortal />} 
          />
          
          <Route path="/course/:courseId" element={<ClientCourseDetail />} />
          <Route path="/lesson/:lessonId" element={<LearningLesson />} />
          
          {/* 🌟 ĐÃ SỬA: Hết lỗi vòng lặp vô tận, tự động đẩy Admin qua đúng path riêng của Admin Layout */}
          <Route 
            path="/profile" 
            element={isAdminOrTeacher ? <Navigate to="/admin/profile" replace /> : <Profile />} 
          />
          
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
          <Route path="/admin/edit-lesson/:lessonId" element={<EditLesson />} />

          {/* 🌟 ĐÃ SỬA: Gọi chung cấu phần component Profile vào đây, hiển thị mượt mà trong khung Admin */}
          <Route path="/admin/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* Bẫy đường dẫn sai - Điều hướng về trang mặc định phù hợp từng Role */}
      <Route path="*" element={<Navigate to={fallbackPath} replace />} />
    </Routes>
  );
}

function AppShell() {
  const { pathname } = useLocation();
  const normalizedPathname = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const showHeader = !AUTH_PAGES.has(normalizedPathname);

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