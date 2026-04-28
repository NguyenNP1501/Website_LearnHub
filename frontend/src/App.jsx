import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home/Home'; 
import CoursePortal from './components/CousePortal/CoursePortal';
import CourseDetail from './components/CourseDetail/CourseDetail';
import UploadLesson from './components/UploadLesson/UploadLesson';
import CreateCourse from './components/CreateCourese/CreateCourse'; 
import LearningLesson from './components/LearningLesson/LearningLesson';
import Discussion from './components/Discussion/Discussion';
import PracticeExam from './components/PracticeExam';
import CreateTest from './components/CreateTest';
import Profile from './components/Profile/Profle';
import Register from './components/Register/Register';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
function App() {
  return (
    <BrowserRouter>
      <Header /> 
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<CoursePortal />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/upload/:courseId" element={<UploadLesson />} />
        <Route path="/create-course" element={<CreateCourse />} />
        <Route path="/lesson/:lessonId" element={<LearningLesson />} />
        <Route path="/discuss" element={<Discussion />} />
        <Route path="/practice" element={<PracticeExam />} />
        <Route path="/create-test" element={<CreateTest />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/register" element={<Register />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
