import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import '../../../App.css';
import '../../../assets/styles/CreateCourse.css';

export default function EditCourse() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preview, setPreview] = useState(null);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [formDataState, setFormDataState] = useState({
    course_name: '', subject_id: '', grade_id: '', description: '', thumbnailFile: null
  });

  const getValidToken = () => {
    try {
      return JSON.parse(sessionStorage.getItem("remake-2.auth"))?.token || null;
    } catch { return null; }
  };

  useEffect(() => {
    const fetchAllInitialData = async () => {
      const currentToken = getValidToken();
      if (!currentToken) {
        alert("Phiên đăng nhập đã hết hạn hoặc bạn không có quyền. Vui lòng đăng nhập lại!");
        return navigate('/login');
      }

      try {
        const config = { headers: { Authorization: `Bearer ${currentToken}` } };
        // Gộp chung gọi song song cả 3 API để code ngắn và tối ưu tốc độ mạng
        const [resGrades, resSubjects, resCourse] = await Promise.all([
          axios.get('http://localhost:3000/api/admin/grades', config),
          axios.get('http://localhost:3000/api/admin/subjects', config),
          axios.get(`http://localhost:3000/api/client/courses/${id}`, config)
        ]);

        const gData = resGrades.data.success ? resGrades.data.data : resGrades.data;
        const sData = resSubjects.data.success ? resSubjects.data.data : resSubjects.data;
        if (Array.isArray(gData)) setGrades(gData);
        if (Array.isArray(sData)) setSubjects(sData);

        const rawCourse = resCourse.data.info || resCourse.data.data || resCourse.data;
        const info = Array.isArray(rawCourse) ? rawCourse[0] : rawCourse;

        if (info) {
          setFormDataState({
            course_name: info.course_name || info.title || '',
            subject_id: info.subject_id || '',
            grade_id: info.grade_id || '',
            description: info.description || '',
            thumbnailFile: null
          });
          if (info.img_url || info.thumbnail) setPreview(info.img_url || info.thumbnail);
        } else {
          throw new Error("Không tìm thấy thông tin khóa học hợp lệ trong DB");
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        if (error.response && [401, 403].includes(error.response.status)) {
          alert("Tài khoản của bạn không có quyền chỉnh sửa hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại tài khoản Admin!");
          navigate('/login');
        } else {
          alert("Không tìm thấy dữ liệu khóa học hoặc cấu hình hệ thống bị gián đoạn!");
          navigate(-1);
        }
      } finally { setIsLoading(false); }
    };

    if (id) fetchAllInitialData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormDataState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormDataState(prev => ({ ...prev, thumbnailFile: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const currentToken = getValidToken();

    const submitData = new FormData();
    submitData.append('course_name', formDataState.course_name);
    submitData.append('subject_id', Number(formDataState.subject_id));
    submitData.append('grade_id', Number(formDataState.grade_id));
    submitData.append('description', formDataState.description);
    submitData.append("folderType", "khoahoc");

    if (formDataState.videoFile) submitData.append('videoFile', formDataState.videoFile);
    if (formDataState.thumbnailFile) submitData.append('thumbnailFile', formDataState.thumbnailFile);

    try {
      await axios.put(`http://localhost:3000/api/admin/courses/update/${id}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${currentToken}` }
      });
      alert('Cập nhật khóa học thành công!');
      navigate(`/admin/courses?grade=${formDataState.grade_id}`);
    } catch (error) {
      console.error("Lỗi cập nhật:", error.message);
      alert('Cập nhật thất bại. Hãy kiểm tra lại quyền truy cập hoặc hệ thống Backend nhé!');
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="container-center text-center mt-10">Đang tải dữ liệu...</div>;

  return (
    <div className="container-center">
      <div className="upload-card create-course-wrapper">
        <div className="create-course-header">
          <button type="button" onClick={() => navigate(-1)} className="btn-circle-back">
            <ArrowLeft size={18} color="#334155" />
          </button>
          <h2 className="create-course-title"><Edit size={24} /> Chỉnh Sửa Khóa Học</h2>
        </div>

        <form onSubmit={handleSubmit} className="create-course-form">
          <div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Tên khóa học <span className="required-star">*</span></label>
              <input type="text" name="course_name" required value={formDataState.course_name} onChange={handleChange} className="form-control" />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Môn học</label>
                <select name="subject_id" required value={formDataState.subject_id} onChange={handleChange} className="form-control">
                  <option value="" disabled hidden>-- Chọn môn học --</option>
                  {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Khối Lớp</label>
                <select name="grade_id" required value={formDataState.grade_id} onChange={handleChange} className="form-control">
                  <option value="" disabled hidden>-- Chọn khối lớp --</option>
                  {grades.map(g => <option key={g.grade_id} value={g.grade_id}>{g.grade_name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả khóa học</label>
              <textarea name="description" rows="5" value={formDataState.description} onChange={handleChange} className="form-control form-textarea" />
            </div>
          </div>

          <div>
            <label className="form-label">Ảnh bìa (Thumbnail)</label>
            <div className="dropzone-area custom-dropzone" onClick={() => document.getElementById('course-thumb').click()}>
              <input id="course-thumb" type="file" hidden accept="image/*" onChange={handleFileChange} />
              {preview ? <img src={preview} className="preview-img dropzone-preview" alt="preview" /> : (
                <div className="dropzone-placeholder">
                  <ImageIcon size={40} style={{ marginBottom: '10px', color: '#000' }} />
                  <p style={{ fontSize: '14px', margin: 0 }}>Kéo thả hoặc click chọn ảnh mới</p>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="btn-blue btn-submit" style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
