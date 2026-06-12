import { useEffect, useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Plus, LogIn, Pencil } from 'lucide-react';
import CourseCard from '../../../components/CourseCard/CourseCard';
import '../../../App.css';
import '../../../assets/styles/PortalLayout.css';
import { getStoredToken, getStoredSession, clearStoredSession } from "../../../utils/authStorage";
import SidebarGrade from '../../../components/SidebarGrade/SidebarGrade';

const API_BASE = 'http://localhost:3000/api';

export default function AdminCoursePortal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedGradeId = searchParams.get('grade') ? Number(searchParams.get('grade')) : '';

  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitLoading, setIsInitLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, watch, setValue } = useForm({
    defaultValues: {
      selectedSubjectId: 'all'
    }
  });

  const selectedSubjectId = watch('selectedSubjectId');

  const token = getStoredToken();
  const currentId = getStoredSession()?.user?.id ?? null;
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const fetchCategories = useCallback(async () => {
    if (!token) {
      setErrorMsg("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!");
      return setIsInitLoading(false);
    }
    try {
      setIsInitLoading(true); 
      setErrorMsg('');
      const [resGrades, resSubjects] = await Promise.all([
        axios.get(`${API_BASE}/admin/grades`, authConfig),
        axios.get(`${API_BASE}/admin/subjects`, authConfig)
      ]);

      if (resGrades.data.success) {
        setGrades(resGrades.data.data);
        if (!searchParams.get('grade') && resGrades.data.data.length > 0) {
          navigate(`/admin/courses?grade=${resGrades.data.data[0].grade_id}`);
        }
      }
      if (resSubjects.data.success) setSubjects(resSubjects.data.data);
    } catch (error) {
      const status = error.response?.status;
      setErrorMsg(status === 401 ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!" :
                  status === 403 ? "Từ chối truy cập! Bạn không có quyền quản trị." :
                  "Không thể kết nối đến máy chủ Backend!");
    } finally { setIsInitLoading(false); }
  }, [token, navigate, searchParams]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleCreateGrade = async () => {
    const name = window.prompt("Nhập tên khối lớp mới muốn tạo (VD: Khối lớp 10):")?.trim();
    if (!name) return;
    try {
      if ((await axios.post(`${API_BASE}/admin/grades`, { grade_name: name }, authConfig)).data.success) {
        alert("Thêm khối lớp mới thành công!"); 
        fetchCategories();
      }
    } catch (err) { 
      alert(err.response?.data?.message || "Thêm khối lớp thất bại."); 
    }
  };

  const handleUpdateGrade = async (e, g) => {
    const newName = window.prompt("Nhập tên mới cho khối lớp này:", g.grade_name)?.trim();
    if (!newName || newName === g.grade_name) return;
    try {
      if ((await axios.put(`${API_BASE}/admin/grades/${g.grade_id}`, { grade_name: newName }, authConfig)).data.success) {
        alert("Cập nhật tên khối lớp thành công!");
        setGrades(prev => prev.map(item => item.grade_id === g.grade_id ? { ...item, grade_name: newName } : item));
      }
    } catch (err) { 
      alert(err.response?.data?.message || "Sửa khối lớp thất bại."); 
    }
  };

  const fetchCourses = useCallback(async () => {
    if (selectedGradeId === '') return;
    try {
      setIsLoading(true);
      const params = { 
        grade_id: selectedGradeId, 
        ...(selectedSubjectId !== 'all' && { subject_id: selectedSubjectId }) 
      };
      const res = await axios.get(`${API_BASE}/client/courses`, { ...authConfig, params });
      setCourses(res.data.data || res.data);
    } catch { 
      setCourses([]); 
    } finally { 
      setIsLoading(false); 
    }
  }, [selectedGradeId, selectedSubjectId, token]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này không?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/courses/${id}`, authConfig);
      fetchCourses(); 
      alert("Đã xóa khóa học thành công!");
    } catch { 
      alert("Xóa khóa học thất bại. Vui lòng thử lại!"); 
    }
  };

  const handleAddSubject = async () => {
    const name = window.prompt("Nhập vào tên môn học mới bạn muốn thêm:")?.trim();
    if (!name) return;
    try {
      if ((await axios.post(`${API_BASE}/admin/subjects`, { subject_name: name }, authConfig)).data.success) {
        alert("Thêm môn học mới thành công!"); 
        fetchCategories();
      }
    } catch (err) { 
      alert(err.response?.data?.message || "Không thể thêm môn học!"); 
    }
  };

  const handleEditSubject = async (id, currentName) => {
    const name = window.prompt(`Chỉnh sửa tên môn học từ "${currentName}" thành:`, currentName)?.trim();
    if (!name || name === currentName) return;
    try {
      if ((await axios.put(`${API_BASE}/admin/subjects/${id}`, { subject_name: name }, authConfig)).data.success) {
        alert("Cập nhật thông tin môn học thành công!"); 
        fetchCategories();
      }
    } catch (err) { 
      alert(err.response?.data?.message || "Cập nhật môn học thất bại!"); 
    }
  };

  const currentGradeName = grades.find(g => g.grade_id === selectedGradeId)?.grade_name || 'Đang tải...';
  const currentSubjectName = subjects.find(s => s.subject_id === selectedSubjectId)?.subject_name || '';

  if (errorMsg) return (
    <div className="portal-error-wrapper">
      <div className="portal-error-text">{errorMsg}</div>
      <button 
        onClick={() => { clearStoredSession(); navigate('/login'); }} 
        className="btn-blue btn-login-redirect"
      >
        <LogIn size={18} /> Đi tới Đăng nhập
      </button>
    </div>
  );

  if (isInitLoading) return <div className="container-center text-center mt-10">Đang tải cấu trúc dữ liệu...</div>;

  return (
    <div className="portal-container">
      
      {/* SIDEBAR */}
      <SidebarGrade 
        grades={grades}
        activeGradeId={selectedGradeId}
        isAdmin={true} 
        onAddGrade={handleCreateGrade}
        onEditGrade={handleUpdateGrade}
        onGradeClick={(gradeId) => {
          navigate(`/admin/courses?grade=${gradeId}`); 
          setValue('selectedSubjectId', 'all'); // Reset bộ lọc môn học khi chuyển khối lớp
        }}
      />

      <div className="portal-content">
        <div className="portal-header">
          <h1 className="portal-title">Quản lý khóa học {grades.length > 0 ? currentGradeName.toLowerCase() : ''}</h1>
          <button className="btn-blue btn-add-course" onClick={() => navigate('/admin/create-course')}>
            <Plus size={18} /> Thêm khóa học
          </button>
        </div>

        <div className="modern-filter-wrapper">
          <div className="modern-filter-track">
            <button 
              onClick={() => setValue('selectedSubjectId', 'all')} 
              className={`filter-chip-btn ${selectedSubjectId === 'all' ? 'active' : ''}`}
            >
              Tất cả
            </button>
            {subjects.map(sub => (
              <div 
                key={sub.subject_id} 
                onClick={(e) => !e.target.closest('.sub-action-btn') && setValue('selectedSubjectId', sub.subject_id)} 
                className={`filter-chip-btn filter-chip-interactive ${selectedSubjectId === sub.subject_id ? 'active' : ''}`}
              >
                <span>{sub.subject_name}</span>
                <span className="sub-action-btn" onClick={() => handleEditSubject(sub.subject_id, sub.subject_name)} title="Sửa tên môn">
                  <Pencil size={12} />
                </span>
              </div>
            ))}
            <button onClick={handleAddSubject} className="filter-chip-btn btn-add-subject" title="Tạo mới môn học">
              <Plus size={14} /> Thêm môn
            </button>
          </div>
        </div>

        <div className="course-grid">
          {isLoading ? (
            <div className="text-center w-full py-10 text-gray-500">Đang cập nhật khóa học...</div>
          ) : courses.length > 0 ? courses.map(course => (
            <CourseCard 
              key={course.course_id || course.id} 
              course={course} 
              isAdmin={true} 
              canEdit={course.teacher_id == currentId} 
              onEdit={(id) => navigate(`/admin/edit-course/${id}`)} 
              onDelete={(id) => handleDelete(id)} 
            />
          )) : (
            <div className="empty-state">
              <p className="empty-title">Chưa có khóa học nào cho {grades.length > 0 ? currentGradeName : 'khối lớp này'} {selectedSubjectId !== 'all' ? `- Môn ${currentSubjectName}` : ''}.</p>
              <p className="empty-desc">Hãy bấm "Thêm khóa học" để tạo mới nhé!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}