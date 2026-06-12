// File: src/pages/client/CoursePortal.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CourseCard from '../../../components/CourseCard/CourseCard';
import '../../../App.css';
import '../../../assets/styles/PortalLayout.css';

export default function CoursePortal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Lấy grade_id và subject_id dạng số từ URL thay vì chuỗi tiếng Việt cứng
  const selectedGradeId = searchParams.get('grade_id') || '1'; // Mặc định là Lớp 1 (ID: 1)
  const selectedSubjectId = searchParams.get('subject_id') || '0'; // Mặc định '0' nghĩa là "Tất cả"

  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);       // State lưu danh sách khối lớp động
  const [subjects, setSubjects] = useState([]);   // State lưu danh sách môn học động
  const [isLoading, setIsLoading] = useState(true);

  // ==================== 1. TẢI DANH MỤC KHỐI LỚP & MÔN HỌC (CHẠY 1 LẦN) ====================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Gọi đồng thời 2 API lấy cấu hình danh mục công khai
        const [resGrades, resSubjects] = await Promise.all([
          axios.get('http://localhost:3000/api/client/grades'),
          axios.get('http://localhost:3000/api/client/subjects')
        ]);

        // Xử lý bóc tách mảng danh sách Khối lớp dữ liệu dự phòng
        const gradesData = resGrades.data.success ? resGrades.data.data : (resGrades.data || []);
        if (Array.isArray(gradesData)) {
          setGrades(gradesData);
        }
        
        // Kiểm tra mảng an toàn (Iterable check) trước khi Spread toán tử tránh gây sập trang
        const subjectsData = resSubjects.data.success ? resSubjects.data.data : (resSubjects.data || []);
        if (Array.isArray(subjectsData)) {
          setSubjects([
            { subject_id: 0, subject_name: 'Tất cả' },
            ...subjectsData
          ]);
        } else {
          setSubjects([{ subject_id: 0, subject_name: 'Tất cả' }]);
        }
      } catch (error) {
        console.error("Lỗi tải danh mục hệ thống:", error);
        // Fallback phòng hờ trường hợp API backend gặp sự cố
        setGrades([
          { grade_id: 1, grade_name: 'Lớp 1' }, 
          { grade_id: 2, grade_name: 'Lớp 2' }
        ]);
        setSubjects([
          { subject_id: 0, subject_name: 'Tất cả' }, 
          { subject_id: 1, subject_name: 'Toán Học' }
        ]);
      }
    };

    fetchCategories();
  }, []);

  // ==================== 2. TẢI DANH SÁCH KHÓA HỌC THEO BỘ LỌC ID ====================
  useEffect(() => {
    setIsLoading(true);
    setCourses([]); // Xóa sạch danh sách cũ để tránh hiện tượng nháy/trộn dữ liệu khi chuyển tab lọc

    // ĐÃ SỬA: Tự động tối ưu build URL động, loại bỏ bộ lọc môn học nếu đang chọn "Tất cả" (ID bằng 0)
    let apiUrl = `http://localhost:3000/api/client/courses?grade_id=${selectedGradeId}`;
    
    if (selectedSubjectId && String(selectedSubjectId) !== '0') {
      apiUrl += `&subject_id=${selectedSubjectId}`;
    }

    axios.get(apiUrl)
      .then(response => {
        // Dự phòng cấu trúc bọc data khác nhau từ Backend
        const courseData = response.data.success ? response.data.data : (response.data.data || response.data);
        setCourses(Array.isArray(courseData) ? courseData : []);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Lỗi tải danh sách khóa học:", error);
        setCourses([]);
        setIsLoading(false);
      });
  }, [selectedGradeId, selectedSubjectId]);

  // Tìm tên khối lớp hiện tại để hiển thị lên tiêu đề UI bài viết
  const currentGradeName = grades.find(g => String(g.grade_id) === String(selectedGradeId))?.grade_name || `Khối lớp ${selectedGradeId}`;
  
  // Tìm tên môn học hiện tại để hiển thị thông báo trống (nếu có)
  const currentSubjectName = subjects.find(s => String(s.subject_id) === String(selectedSubjectId))?.subject_name || '';

  if (isLoading && grades.length === 0) return <div className="container-center text-center mt-10">Đang tải cấu hình hệ thống...</div>;

  return (
    <div className="portal-container">
      
      {/* SIDEBAR LỌC THEO KHỐI LỚP ĐỘNG */}
      <div className="portal-sidebar">
        <h2 className="sidebar-title">Danh mục</h2>
        {grades.map(g => (
          <div
            key={g.grade_id}
            // Khi chuyển lớp, tự động đẩy subject_id về '0' (Tất cả) để tránh lỗi không có dữ liệu chéo
            onClick={() => navigate(`/courses?grade_id=${g.grade_id}&subject_id=0`)}
            className={`sidebar-item ${String(selectedGradeId) === String(g.grade_id) ? 'active' : ''}`}
          >
            {g.grade_name}
          </div>
        ))}
      </div>

      {/* NỘI DUNG CHÍNH */}
      <div className="portal-content">
        <div className="portal-header">
          <h1 className="portal-title">Cổng khóa học {currentGradeName.toLowerCase()}</h1>
        </div>

        {/* THANH NGANG LỌC MÔN HỌC ĐỘNG */}
        <div className="modern-filter-wrapper">
          <div className="modern-filter-track">
            {subjects.map(sub => (
              <button
                key={sub.subject_id}
                // Đồng bộ cập nhật cả grade_id hiện tại và subject_id mới lên URL thanh địa chỉ
                onClick={() => navigate(`/courses?grade_id=${selectedGradeId}&subject_id=${sub.subject_id}`)}
                className={`filter-chip-btn ${String(selectedSubjectId) === String(sub.subject_id) ? 'active' : ''}`}
              >
                {sub.subject_name}
              </button>
            ))}
          </div>
        </div>

        {/* LƯỚI KHÓA HỌC */}
        <div className="course-grid">
          {isLoading ? (
            <div className="text-center w-full py-10" style={{ gridColumn: '1/-1', color: '#64748b', fontSize: '15px' }}>
              Đang làm mới danh sách khóa học...
            </div>
          ) : courses.length > 0 ? (
            courses.map(course => (
              <CourseCard key={course.course_id || course.id} course={course} />
            ))
          ) : (
            /* TRẠNG THÁI TRỐNG (EMPTY STATE) KHỚP THEO BỘ LỌC */
            <div className="empty-state" style={{ gridColumn: '1/-1' }}>
              <img src="https://cdn-icons-png.flaticon.com/512/7486/7486831.png" alt="empty" className="empty-icon" />
              <p className="empty-title">
                Chưa có khóa học nào cho {currentGradeName} 
                {Number(selectedSubjectId) !== 0 ? ` - Môn ${currentSubjectName}` : ''}.
              </p>
              <p className="empty-desc">Vui lòng chờ thầy cô cập nhật thêm dữ liệu học tập nhé!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}