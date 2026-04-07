import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; 
import axios from 'axios';
import { Plus } from 'lucide-react';
import '../../App.css';
import '../CousePortal/CousePortal.css'; 

export default function CoursePortal() {
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const selectedGrade = searchParams.get('grade') || 'Lớp 1'; 

  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const sidebarGrades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6','Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];

  useEffect(() => {
    setIsLoading(true);
    
    axios.get(`http://localhost:3000/api/courses?grade=${selectedGrade}`)
      .then(response => {
        setCourses(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.log("Lỗi:", error.message);
        setCourses([]);
        setIsLoading(false);
      });
  }, [selectedGrade]);

  if (isLoading) return <div className="container-center text-center mt-10">Đang tải dữ liệu khóa học...</div>;

  return (
    <div className="portal-container">
      
      {/* CỘT TRÁI: SIDEBAR */}
      <div className="portal-sidebar">
        <h2 className="sidebar-title">Danh mục</h2>
        {sidebarGrades.map(grade => (
          <div 
            key={grade} 
            onClick={() => navigate(`/courses?grade=${grade}`)}
            className={`sidebar-item ${selectedGrade === grade ? 'active' : ''}`}
          >
            {grade}
          </div>
        ))}
      </div>

      {/* CỘT PHẢI: NỘI DUNG */}
      <div className="portal-content">
        
        <div className="portal-header">
          <h1 className="portal-title">
            Cổng khóa học {selectedGrade.toLowerCase()}
          </h1>
          <button 
            className="btn-blue btn-add-course" 
            onClick={() => navigate('/create-course')} 
          >
            <Plus size={18} /> Thêm khóa học
          </button>
        </div>
        
        <div className="course-grid">
          {courses.map(course => (
            <div key={course.id} className="course-card">
              
              <div 
                className="thumbnail" 
                style={{ 
                  backgroundColor: course.color,
                  backgroundImage: course.img_url ? `url(http://localhost:3000${course.img_url})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              ></div>

              <h3 className="course-title">{course.title}</h3>
              
              {/* ĐÃ XÓA THANH TIẾN ĐỘ Ở ĐÂY */}

              <button 
                className="btn-blue" 
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => navigate(`/course/${course.id}`)}
              >
                Vào học ngay
              </button>
            </div>
          ))}
          
          {courses.length === 0 && (
             <div className="empty-state">
               <img src="https://cdn-icons-png.flaticon.com/512/7486/7486831.png" alt="empty" className="empty-icon" />
               <p className="empty-title">Chưa có khóa học nào cho {selectedGrade}.</p>
               <p className="empty-desc">Hãy bấm "Thêm khóa học" để tạo mới nhé!</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}