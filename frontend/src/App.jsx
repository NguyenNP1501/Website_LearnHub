import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ExamList from './pages/admin/ExamList'
import EditExam from './pages/admin/EditExam'
import CreateExam from './pages/admin/CreateExam'
import ViewExam from './pages/admin/ViewExam'
import DoExam from "./pages/client/DoExam"
import SearchExam from './pages/client/SearchExam'
import ManageExported from './pages/admin/manage/ManageExported'
import ManageSaved from './pages/admin/manage/ManageSaved'
import ManageDeleted from './pages/admin/manage/ManageDeleted'
import ViewExamClient from './pages/client/ViewExamClient'
import HistoryExam from './pages/client/HistoryExam'
import ResultExam from './pages/client/ResultExam'
import LoginPage from './pages/auth/LoginPage'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'
import { AdminLayout, StudentLayout } from './layouts/AppLayout'
import { useAuth } from './context/AuthContext'

function AppRoutes() {
  const { user } = useAuth();
  const fallbackPath = user?.role === "admin" ? "/admin" : user?.role === "student" ? "/" : "/login";

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
        <Route element={<StudentLayout />}>
          <Route path="/" element={<ViewExamClient />} />
          <Route path="/search-exam" element={<SearchExam/>} />
          <Route path="/do-exam/:id" element={<DoExam />} />
          <Route path="/history-exam" element={<HistoryExam />} />
          <Route path="/result-exam/:id" element={<ResultExam/>} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<ExamList />} />
          <Route path="/admin/create" element={<CreateExam />} />
          <Route path="/admin/edit/:id" element={<EditExam />} />
          <Route path="/admin/view/:id" element={<ViewExam />} />
          <Route path="/admin/exported" element={<ManageExported />} />
          <Route path="/admin/saved" element={<ManageSaved/>} />
          <Route path="/admin/deleted" element={<ManageDeleted />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to={fallbackPath} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App;
