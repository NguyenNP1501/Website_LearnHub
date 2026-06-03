import "./App.css";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import ChangePassword from "./components/Authentication/ChangePassword";
import SendToken from "./components/Authentication/SendToken";
import CoursePortal from "./components/CousePortal/CoursePortal";
import CreateCourse from "./components/CreateCourese/CreateCourse";
import CourseDetail from "./components/CourseDetail/CourseDetail";
import Discussion from "./components/Discussion/Discussion";
import PostDetail from "./components/Discussion/PostDetail";
import ViewPost from "./components/Discussion/ViewPost";
import Header from "./components/Header";
import Home from "./components/Home/Home";
import LearningLesson from "./components/LearningLesson/LearningLesson";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import UploadLesson from "./components/UploadLesson/UploadLesson";
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

const AUTH_PAGES = new Set(["/login", "/forgot-password", "/forgot", "/reset-password"]);

function AppRoutes() {
  const { user } = useAuth();
  const fallbackPath =
    user?.role === "admin" ? "/admin" : user?.role === "student" ? "/" : "/login";
  const legacyPracticePath = user?.role === "admin" ? "/admin/create" : "/search-exam";
  const legacyProfilePath = user?.role === "admin" ? "/admin" : "/history-exam";

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
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

      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/" element={<ViewExamClient />} />
          <Route path="/search-exam" element={<SearchExam />} />
          <Route path="/do-exam/:id" element={<DoExam />} />
          <Route path="/history-exam" element={<HistoryExam />} />
          <Route path="/result-exam/:id" element={<ResultExam />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["student", "admin"]} />}>
        <Route path="/home" element={<Home />} />
        <Route path="/courses" element={<CoursePortal />} />
        <Route path="/courses/create" element={<CreateCourse />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/course/:courseId/upload" element={<UploadLesson />} />
        <Route path="/lesson/:lessonId" element={<LearningLesson />} />
        <Route path="/posts" element={<ViewPost />} />
        <Route path="/view-post" element={<ViewPost />} />
        <Route path="/posts/:post_id" element={<PostDetail />} />
        <Route path="/view-post/:post_id" element={<PostDetail />} />
        <Route path="/discussion/new" element={<Discussion />} />
        <Route path="/discuss" element={<Discussion />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<ExamList />} />
          <Route path="/admin/create" element={<CreateExam />} />
          <Route path="/admin/edit/:id" element={<EditExam />} />
          <Route path="/admin/view/:id" element={<ViewExam />} />
          <Route path="/admin/exported" element={<ManageExported />} />
          <Route path="/admin/saved" element={<ManageSaved />} />
          <Route path="/admin/deleted" element={<ManageDeleted />} />
        </Route>
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/upload/:courseId" element={<UploadLesson />} />
      </Route>

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

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
