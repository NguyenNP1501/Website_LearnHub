import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home/Home'; 
import CoursePortal from './components/CousePortal/CoursePortal';
import CourseDetail from './components/CourseDetail/CourseDetail';
import UploadLesson from './components/UploadLesson/UploadLesson';
import CreateCourse from './components/CreateCourese/CreateCourse'; 
import LearningLesson from './components/LearningLesson/LearningLesson';

// 1. IMPORT THÊM 3 TRANG MỚI VÀO ĐÂY
import Discussion from './components/Discussion/Discussion';
import PracticeExam from './components/PracticeExam';
import CreateTest from './components/CreateTest';

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

        {/* 2. KHAI BÁO ĐƯỜNG DẪN CHO 3 TRANG MỚI */}
        <Route path="/discuss" element={<Discussion />} />
        <Route path="/practice" element={<PracticeExam />} />
        <Route path="/create-test" element={<CreateTest />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;