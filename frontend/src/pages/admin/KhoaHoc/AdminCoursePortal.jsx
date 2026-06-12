import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Plus, LogIn, Pencil, Edit3 } from 'lucide-react'; // Thêm Edit3 icon
import CourseCard from '../../../components/CourseCard/CourseCard'; 
import '../../../App.css';
import '../../../assets/styles/PortalLayout.css';

export default function AdminCoursePortal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const gradeParam = searchParams.get('grade');
  const selectedGradeId = gradeParam ? Number(gradeParam) : '';
  const [selectedSubjectId, setSelectedSubjectId] = useState('all');
  
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitLoading, setIsInitLoading] = useState(true); 
  const [errorMsg, setErrorMsg] = useState('');            

  // 1. ĐỌC THÔNG TIN XÁC THỰC (LOCALSTORAGE)
  const { token, currentId } = (() => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("remake-2.auth"));
      return { token: auth?.token || "", currentId: auth?.user?.id || auth?.user?.user_id || auth?.user?.teacher_id || null };
    } catch { return { token: "", currentId: null }; }
  })();

  // 2. API: LẤY DANH MỤC KHỐI LỚP & MÔN HỌC
  const fetchCategories = useCallback(async () => {
    if (!token) {
      setErrorMsg("Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại!");
      return setIsInitLoading(false);
    }
    try {
      setIsInitLoading(true); setErrorMsg(''); 
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [resGrades, resSubjects] = await Promise.all([
        axios.get('http://localhost:3000/api/admin/grades', config),
        axios.get('http://localhost:3000/api/admin/subjects', config)
      ]);
      
      if (resGrades.data.success) {
        setGrades(resGrades.data.data);
        if (!gradeParam && resGrades.data.data.length > 0) navigate(`/admin/courses?grade=${resGrades.data.data[0].grade_id}`);
      }
      if (resSubjects.data.success) setSubjects(resSubjects.data.data);
    } catch (error) {
      console.error("Lỗi lấy danh mục từ Server:", error);
      const status = error.response?.status;
      setErrorMsg(status === 401 ? "Phiên đăng nhập Admin/Teacher đã hết hạn hoặc Token không hợp lệ. Vui lòng đăng nhập lại!" :
                  status === 403 ? "Từ chối truy cập! Tài khoản của bạn không có quyền quản trị." :
                  "Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra lại trạng thái hoạt động của Server!");
    } finally { setIsInitLoading(false); }
  }, [token, gradeParam, navigate]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ==========================================
  // [BỔ SUNG] CHỨC NĂNG THAO TÁC KHỐI LỚP (GRADES)
  // ==========================================
  const handleCreateGrade = async () => {
    const name = window.prompt("Nhập tên khối lớp mới muốn tạo (VD: Khối lớp 10):");
    if (!name || !name.trim()) return;

    try {
      const res = await axios.post(
        'http://localhost:3000/api/admin/grades',
        { grade_name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Thêm khối lớp mới thành công!");
        fetchCategories(); // Tải lại danh mục
      }
    } catch (err) {
      console.error("Lỗi khi thêm khối lớp:", err);
      alert(err.response?.data?.message || "Thêm khối lớp thất bại.");
    }
  };

  const handleUpdateGrade = async (e, g) => {
    e.stopPropagation(); // Ngăn kích hoạt onClick chuyển lớp của thẻ cha
    
    const currentName = g.grade_name;
    const newName = window.prompt("Nhập tên mới cho khối lớp này:", currentName);
    if (!newName || !newName.trim() || newName.trim() === currentName) return;

    try {
      const res = await axios.put(
        `http://localhost:3000/api/admin/grades/${g.grade_id}`,
        { grade_name: newName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Cập nhật tên khối lớp thành công!");
        // Cập nhật state local ngay lập tức
        setGrades(prev =>
          prev.map(item => item.grade_id === g.grade_id ? { ...item, grade_name: newName.trim() } : item)
        );
      }
    } catch (err) {
      console.error("Lỗi khi sửa khối lớp:", err);
      alert(err.response?.data?.message || "Sửa khối lớp thất bại.");
    }
  };

  // 3. API: LẤY DANH SÁCH KHÓA HỌC THEO BỘ LỌC
  const fetchCourses = useCallback(() => {
    if (!selectedGradeId) return; 
    setIsLoading(true);
    const params = { grade_id: selectedGradeId, ...(selectedSubjectId !== 'all' && { subject_id: selectedSubjectId }) };

    axios.get(`http://localhost:3000/api/client/courses`, { params, headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(res => setCourses(res.data.data || res.data))
      .catch(err => { console.error("Lỗi lấy khóa học:", err.message); setCourses([]); })
      .finally(() => setIsLoading(false));
  }, [selectedGradeId, selectedSubjectId, token]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // 4. API: CÁC THAO TÁC XÓA, THÊM, SỬA DANH MỤC MÔN HỌC
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa khóa học này không?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/admin/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCourses(); alert("Đã xóa khóa học thành công!");
    } catch (err) { console.error(err); alert("Xóa khóa học thất bại. Vui lòng thử lại!"); }
  };

  const handleAddSubject = async () => {
    const name = window.prompt("Nhập vào tên môn học mới bạn muốn thêm:");
    if (!name?.trim()) return;
    try {
      const res = await axios.post('http://localhost:3000/api/admin/subjects', { subject_name: name.trim() }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) { alert("Thêm môn học mới thành công!"); fetchCategories(); }
    } catch (err) { alert(err.response?.data?.message || "Không thể thêm môn học mới!"); }
  };

  const handleEditSubject = async (id, currentName) => {
    const name = window.prompt(`Chỉnh sửa tên môn học từ "${currentName}" thành:`, currentName);
    if (!name?.trim() || name.trim() === currentName) return;
    try {
      const res = await axios.put(`http://localhost:3000/api/admin/subjects/${id}`, { subject_name: name.trim() }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) { alert("Cập nhật thông tin môn học thành công!"); fetchCategories(); }
    } catch (err) { alert(err.response?.data?.message || "Cập nhật môn học thất bại!"); }
  };

  const currentGradeName = grades.find(g => g.grade_id === selectedGradeId)?.grade_name || 'Đang tải...';
  const currentSubjectName = subjects.find(s => s.subject_id === selectedSubjectId)?.subject_name || '';

  // 5. GIAO DIỆN PHỤ KHỞI TẠO (ERROR & LOADING)
  if (errorMsg) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '75vh', gap: '16px', fontFamily: 'sans-serif' }}>
      <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center', padding: '0 20px', lineHeight: '1.5' }}>{errorMsg}</div>
      <button onClick={() => { sessionStorage.removeItem("remake-2.auth"); navigate('/login'); }} className="btn-blue" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', border: 'none', fontWeight: '500' }}>
        <LogIn size={18} /> Đi tới Đăng nhập
      </button>
    </div>
  );

  if (isInitLoading) return <div className="container-center text-center mt-10">Đang tải cấu trúc dữ liệu...</div>;

  // 6. GIAO DIỆN CHÍNH PORTAL
  return (
    <div className="portal-container">
      {/* SIDEBAR QUẢN LÝ LỚP HỌC */}
      <div className="portal-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 className="sidebar-title" style={{ margin: 0 }}>Quản lý lớp</h2>
          {/* Nút thêm khối lớp */}
          <button 
            onClick={handleCreateGrade}
            style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '5px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <Plus size={14} /> Thêm
          </button>
        </div>

        {grades.length > 0 ? grades.map(g => (
          <div 
            key={g.grade_id} 
            onClick={() => { navigate(`/admin/courses?grade=${g.grade_id}`); setSelectedSubjectId('all'); }} 
            className={`sidebar-item ${selectedGradeId === g.grade_id ? 'active' : ''}`}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {g.grade_name}
            </span>
            {/* Nút sửa tên khối lớp tương ứng */}
            <button
              onClick={(e) => handleUpdateGrade(e, g)}
              style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Sửa tên lớp"
            >
              <Edit3 
                size={13} 
                style={{ color: selectedGradeId === g.grade_id ? '#ffffff' : '#64748b', transition: 'opacity 0.2s' }} 
              />
            </button>
          </div>
        )) : <div style={{ padding: '15px', color: '#9ca3af', fontSize: '0.9rem' }}>Chưa có dữ liệu lớp</div>}
      </div>

      {/* PHẦN HIỂN THỊ NỘI DUNG CHÍNH */}
      <div className="portal-content">
        <div className="portal-header">
          <h1 className="portal-title">Quản lý khóa học {grades.length > 0 ? currentGradeName.toLowerCase() : ''}</h1>
          <button className="btn-blue btn-add-course" onClick={() => navigate('/admin/create-course')}><Plus size={18} /> Thêm khóa học</button>
        </div>

        <div className="modern-filter-wrapper">
          <div className="modern-filter-track" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedSubjectId('all')} className={`filter-chip-btn ${selectedSubjectId === 'all' ? 'active' : ''}`}>Tất cả</button>
            {subjects.map(sub => (
              <div key={sub.subject_id} onClick={(e) => !e.target.closest('.sub-action-btn') && setSelectedSubjectId(sub.subject_id)} className={`filter-chip-btn ${selectedSubjectId === sub.subject_id ? 'active' : ''}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', paddingRight: '12px', cursor: 'pointer' }}>
                <span>{sub.subject_name}</span>
                <span className="sub-action-btn" onClick={() => handleEditSubject(sub.subject_id, sub.subject_name)} style={{ display: 'inline-flex', alignItems: 'center', color: selectedSubjectId === sub.subject_id ? '#fff' : '#6b7280', opacity: 0.7, cursor: 'pointer' }} title="Sửa tên môn"><Pencil size={12} /></span>
              </div>
            ))}
            <button onClick={handleAddSubject} className="filter-chip-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', border: '1px dashed #3b82f6', color: '#3b82f6', background: 'transparent', fontWeight: 'bold' }} title="Tạo mới môn học"><Plus size={14} /> Thêm môn</button>
          </div>
        </div>

        <div className="course-grid">
          {isLoading ? <div className="text-center w-full py-10 text-gray-500">Đang cập nhật khóa học...</div> : courses.length > 0 ? courses.map(course => (
            <CourseCard key={course.course_id || course.id} course={course} isAdmin={true} canEdit={course.teacher_id == currentId} onEdit={(id) => navigate(`/admin/edit-course/${id}`)} onDelete={(id) => handleDelete(id)} />
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
