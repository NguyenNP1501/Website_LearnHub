import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, BookOpen, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import '../../../App.css';
import '../../../assets/styles/CreateCourse.css';
import { getStoredToken, getStoredSession, clearStoredSession } from "../../../utils/authStorage";

const API_BASE = 'http://localhost:3000/api/admin';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      course_name: '',
      subject_id: '',
      grade_id: '',
      description: '',
      thumbnailFile: null
    }
  });

  const thumbnailFile = watch('thumbnailFile');

  const token = getStoredToken();
  const currentUser = getStoredSession()?.user || null;
  const currentId = currentUser?.teacher_id ?? currentUser?.id ?? currentUser?.user_id ?? null;
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) {
      alert("Phiên làm việc hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!");
      clearStoredSession();
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      axios.get(`${API_BASE}/grades`, authConfig),
      axios.get(`${API_BASE}/subjects`, authConfig)
    ])
      .then(([resGrades, resSubjects]) => {
        const gradeData = resGrades.data.data || [];
        const subjectData = resSubjects.data.data || [];

        setGrades(gradeData);
        setSubjects(subjectData);

        if (gradeData.length > 0) setValue('grade_id', gradeData[0].grade_id);
        if (subjectData.length > 0) setValue('subject_id', subjectData[0].subject_id);
      })
      .catch(() => {});
  }, [token, setValue]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('thumbnailFile', file);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const onSubmitForm = async (data) => {
    if (!currentId) return alert("Lỗi: Bạn cần đăng nhập đúng quyền Giáo viên/Admin!");
    if (!data.grade_id || !data.subject_id) return alert("Lỗi: Cấu trúc lớp học chưa tải xong!");

    setIsSubmitting(true);
    const submitData = new FormData();
    submitData.append('course_name', data.course_name);
    submitData.append('subject_id', Number(data.subject_id));
    submitData.append('grade_id', Number(data.grade_id));
    submitData.append('description', data.description || '');
    submitData.append('teacher_id', currentId);
    submitData.append("folderType", "khoahoc");
    if (data.thumbnailFile) submitData.append('thumbnailFile', data.thumbnailFile);

    try {
      const res = await axios.post(`${API_BASE}/courses/create`, submitData, {
        headers: { ...authConfig.headers, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        alert('Tạo khóa học thành công!');
        navigate(`/admin/courses?grade=${data.grade_id}`);
      } else alert(res.data.message || 'Tạo thất bại từ Server!');
    } catch (error) {
      alert(`Tạo thất bại! Chi tiết lỗi: ${error.response?.data?.message || error.message}`);
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="container-center">
      <div className="upload-card create-course-wrapper">
        <div className="create-course-header">
          <button type="button" onClick={() => navigate(-1)} className="btn-circle-back">
            <ArrowLeft size={18} color="#334155" />
          </button>
          <h2 className="create-course-title"><BookOpen size={24} /> Tạo Khóa Học Mới</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="create-course-form">
          <div>
            <div className="form-group form-group-mb">
              <label className="form-label">Tên khóa học <span className="required-star">*</span></label>
              <input
                type="text"
                placeholder="VD: Toán nâng cao lớp 1..."
                className="form-control"
                {...register('course_name', { required: true })}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Môn học</label>
                <select className="form-control" {...register('subject_id')}>
                  {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                  {subjects.length === 0 && <option value="">Đang tải danh mục môn...</option>}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Khối Lớp</label>
                <select className="form-control" {...register('grade_id')}>
                  {grades.map(g => <option key={g.grade_id} value={g.grade_id}>{g.grade_name}</option>)}
                  {grades.length === 0 && <option value="">Đang tải danh mục lớp...</option>}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả khóa học</label>
              <textarea
                rows="5"
                placeholder="Nhập giới thiệu ngắn về khóa học này..."
                className="form-control form-textarea"
                {...register('description')}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Ảnh bìa (Thumbnail)</label>
            <div className="dropzone-area custom-dropzone" onClick={() => document.getElementById('course-thumb').click()}>
              <input
                id="course-thumb"
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
              {preview ? (
                <img src={preview} className="preview-img dropzone-preview" alt="preview" />
              ) : (
                <div className="dropzone-placeholder">
                  <ImageIcon size={40} className="dropzone-icon" />
                  <p className="dropzone-text">Kéo thả hoặc click chọn ảnh</p>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="btn-blue btn-submit">
                {isSubmitting ? 'Đang tạo...' : 'Tạo khóa học'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}