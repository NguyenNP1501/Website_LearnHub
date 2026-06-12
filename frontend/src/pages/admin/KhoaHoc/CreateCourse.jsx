import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import '../../../App.css';
import '../../../assets/styles/CreateCourse.css';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formDataState, setFormDataState] = useState({
    course_name: '', subject_id: '', grade_id: '', description: '', thumbnailFile: null
  });

  // ==================== 1. ĐỌC DỮ LIỆU ĐĂNG NHẬP (LOCALSTORAGE) ====================
  const { token, currentId } = (() => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem("remake-2.auth"));
      const user = parsed?.user;
      return { token: parsed?.token || "", currentId: user ? (user.id || user.user_id || user.teacher_id) : null };
    } catch { return { token: "", currentId: null }; }
  })();

  // ==================== 2. TẢI ĐỒNG THỜI KHỐI LỚP & MÔN HỌC ====================
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [resGrades, resSubjects] = await Promise.all([
          axios.get('http://localhost:3000/api/admin/grades', config),
          axios.get('http://localhost:3000/api/admin/subjects', config)
        ]);

        if (resGrades.data.success && resGrades.data.data.length > 0) {
          setGrades(resGrades.data.data);
          setFormDataState(prev => ({ ...prev, grade_id: resGrades.data.data[0].grade_id }));
        }
        if (resSubjects.data.success && resSubjects.data.data.length > 0) {
          setSubjects(resSubjects.data.data);
          setFormDataState(prev => ({ ...prev, subject_id: resSubjects.data.data[0].subject_id }));
        }
      } catch (error) { console.error("Lỗi khi tải cấu trúc danh mục cho form tạo:", error); }
    })();
  }, [token]);

  // ==================== 3. HÀM XỬ LÝ BIẾN ĐỘNG INPUT ====================
  const handleChange = (e) => setFormDataState(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormDataState(prev => ({ ...prev, thumbnailFile: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // ==================== 4. XỬ LÝ SUBMIT FORM ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!currentId) { alert("Lỗi: Bạn cần đăng nhập đúng quyền Giáo viên/Admin để tạo khóa học!"); return setIsSubmitting(false); }
    if (!formDataState.grade_id || !formDataState.subject_id) { alert("Lỗi: Cấu trúc lớp học chưa tải xong, vui lòng đợi giây lát!"); return setIsSubmitting(false); }

    const submitData = new FormData();
    submitData.append('course_name', formDataState.course_name);
    submitData.append('subject_id', Number(formDataState.subject_id));
    submitData.append('grade_id', Number(formDataState.grade_id));
    submitData.append('description', formDataState.description || '');
    submitData.append('teacher_id', currentId);
    submitData.append("folderType", "khoahoc");
    if (formDataState.thumbnailFile) submitData.append('thumbnailFile', formDataState.thumbnailFile);

    try {
      const response = await axios.post('http://localhost:3000/api/admin/courses/create', submitData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        alert('Tạo khóa học thành công!');
        navigate(`/admin/courses?grade=${formDataState.grade_id}`);
      } else alert(response.data.message || 'Tạo thất bại từ Server!');
    } catch (error) {
      console.error("Lỗi chi tiết khi gửi form:", error.response?.data || error);
      alert(`Tạo thất bại! Chi tiết lỗi: ${error.response?.data?.message || error.message}`);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="container-center">
      <div className="upload-card create-course-wrapper">
        <div className="create-course-header">
          <button type="button" onClick={() => navigate(-1)} className="btn-circle-back"><ArrowLeft size={18} color="#334155" /></button>
          <h2 className="create-course-title"><BookOpen size={24} /> Tạo Khóa Học Mới</h2>
        </div>

        <form onSubmit={handleSubmit} className="create-course-form">
          <div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Tên khóa học <span className="required-star">*</span></label>
              <input type="text" name="course_name" required placeholder="VD: Toán nâng cao lớp 1..." value={formDataState.course_name} onChange={handleChange} className="form-control" />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Môn học</label>
                <select name="subject_id" value={formDataState.subject_id} onChange={handleChange} className="form-control">
                  {subjects.length > 0 ? subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>) : <option value="">Đang tải danh mục môn...</option>}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Khối Lớp</label>
                <select name="grade_id" value={formDataState.grade_id} onChange={handleChange} className="form-control">
                  {grades.length > 0 ? grades.map(g => <option key={g.grade_id} value={g.grade_id}>{g.grade_name}</option>) : <option value="">Đang tải danh mục lớp...</option>}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả khóa học</label>
              <textarea name="description" rows="5" placeholder="Nhập giới thiệu ngắn về khóa học này..." value={formDataState.description} onChange={handleChange} className="form-control form-textarea" />
            </div>
          </div>

          <div>
            <label className="form-label">Ảnh bìa (Thumbnail)</label>
            <div className="dropzone-area custom-dropzone" onClick={() => document.getElementById('course-thumb').click()}>
              <input id="course-thumb" type="file" hidden accept="image/*" onChange={handleFileChange} />
              {preview ? <img src={preview} className="preview-img dropzone-preview" alt="preview" /> : (
                <div className="dropzone-placeholder">
                  <ImageIcon size={40} style={{ marginBottom: '10px', color: '#000' }} />
                  <p style={{ fontSize: '14px', margin: 0 }}>Kéo thả hoặc click chọn ảnh</p>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="btn-blue btn-submit" style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Đang tạo...' : 'Tạo khóa học'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
