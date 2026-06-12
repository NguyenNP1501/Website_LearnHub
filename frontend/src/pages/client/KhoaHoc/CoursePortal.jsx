import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import CourseCard from '../../../components/CourseCard/CourseCard';
import SidebarGrade from '../../../components/SidebarGrade/SidebarGrade';
import '../../../App.css';
import '../../../assets/styles/PortalLayout.css';

const API_BASE = 'http://localhost:3000/api';

export default function CoursePortal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const selectedGradeId = searchParams.get('grade_id') || '1';
  const selectedSubjectId = searchParams.get('subject_id') || '0';

  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { register, watch, setValue } = useForm({
    defaultValues: {
      gradeId: selectedGradeId,
      subjectId: selectedSubjectId
    }
  });

  const watchedGradeId = watch('gradeId');
  const watchedSubjectId = watch('subjectId');

  // Đồng bộ form khi URL thay đổi
  useEffect(() => {
    setValue('gradeId', selectedGradeId);
    setValue('subjectId', selectedSubjectId);
  }, [selectedGradeId, selectedSubjectId, setValue]);

  // ==================== 1. TẢI DANH MỤC KHỐI LỚP & MÔN HỌC ====================
  useEffect(() => {
    let isMounted = true;

    const fetchCategories = async () => {
      try {
        const [resGrades, resSubjects] = await Promise.all([
          axios.get(`${API_BASE}/client/grades`),
          axios.get(`${API_BASE}/client/subjects`)
        ]);

        if (!isMounted) return;

        const gradesData = resGrades.data?.success ? resGrades.data.data : (resGrades.data || []);
        if (Array.isArray(gradesData)) setGrades(gradesData);

        const subjectsData = resSubjects.data?.success ? resSubjects.data.data : (resSubjects.data || []);
        if (Array.isArray(subjectsData)) {
          setSubjects([{ subject_id: 0, subject_name: 'Tất cả' }, ...subjectsData]);
        } else {
          setSubjects([{ subject_id: 0, subject_name: 'Tất cả' }]);
        }
      } catch {
        if (!isMounted) return;

        setGrades([
          { grade_id: 1, grade_name: 'Lớp 1' },
          { grade_id: 2, grade_name: 'Lớp 2' }
        ]);
        setSubjects([
          { subject_id: 0, subject_name: 'Tất cả' },
          { subject_id: 1, subject_name: 'Toán Học' }
        ]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchCategories();
    return () => { isMounted = false; };
  }, []);

  // ==================== 2. TẢI DANH SÁCH KHÓA HỌC THEO BỘ LỌC ====================
  useEffect(() => {
    let isCurrentRequest = true;
    setIsLoading(true);
    setCourses([]);

    let apiUrl = `${API_BASE}/client/courses?grade_id=${selectedGradeId}`;
    if (selectedSubjectId && String(selectedSubjectId) !== '0') {
      apiUrl += `&subject_id=${selectedSubjectId}`;
    }

    axios.get(apiUrl)
      .then(response => {
        if (!isCurrentRequest) return;
        const courseData = response.data?.success ? response.data.data : (response.data?.data || response.data);
        setCourses(Array.isArray(courseData) ? courseData : []);
      })
      .catch(() => {
        if (isCurrentRequest) setCourses([]);
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => { isCurrentRequest = false; };
  }, [selectedGradeId, selectedSubjectId]);

  const currentGradeName = grades.find(g => String(g.grade_id) === String(selectedGradeId))?.grade_name || `Khối lớp ${selectedGradeId}`;
  const currentSubjectName = subjects.find(s => String(s.subject_id) === String(selectedSubjectId))?.subject_name || '';

  if (isLoading && grades.length === 0) {
    return <div className="container-center text-center mt-10">Đang tải cấu hình hệ thống...</div>;
  }

  return (
    <div className="portal-container">

      {/* 2. THAY THẾ DIV SIDEBAR CŨ BẰNG COMPONENT DÙNG CHUNG */}
      <SidebarGrade 
        grades={grades}
        activeGradeId={selectedGradeId}
        isAdmin={false}
        onGradeClick={(gradeId) => {
          setValue('gradeId', String(gradeId));
          setValue('subjectId', '0'); // Reset môn học về "Tất cả" khi đổi khối lớp
          navigate(`/courses?grade_id=${gradeId}&subject_id=0`);
        }}
      />

      {/* NỘI DUNG CHÍNH */}
      <div className="portal-content">
        <div className="portal-header">
          <h1 className="portal-title">Cổng khóa học {currentGradeName.toLowerCase()}</h1>
        </div>

        {/* THANH LỌC MÔN HỌC — dùng hidden input của useForm để track giá trị */}
        <input type="hidden" {...register('gradeId')} />
        <input type="hidden" {...register('subjectId')} />

        <div className="modern-filter-wrapper">
          <div className="modern-filter-track">
            {subjects.map(sub => (
              <button
                key={sub.subject_id}
                onClick={() => {
                  setValue('subjectId', String(sub.subject_id));
                  navigate(`/courses?grade_id=${selectedGradeId}&subject_id=${sub.subject_id}`);
                }}
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