import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header/index';
import Home from './components/Home/Home'; 
import CoursePortal from './components/CousePortal/CoursePortal';
import CourseDetail from './components/CourseDetail/CourseDetail';
import UploadLesson from './components/UploadLesson/UploadLesson';
import CreateCourse from './components/CreateCourese/CreateCourse'; 
import LearningLesson from './components/LearningLesson/LearningLesson';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;