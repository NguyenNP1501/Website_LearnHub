import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Edit, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import '../../../App.css';
import '../../../assets/styles/CreateCourse.css';
import { getStoredToken, clearStoredSession } from "../../../utils/authStorage";

const API_BASE = 'http://localhost:3000/api';

export default function EditCourse() {
  const params = useParams();
  const courseId = params.id;
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) {
      alert("Phiên đăng nhập đã hết hạn hoặc bạn không có quyền. Vui lòng đăng nhập lại!");
      clearStoredSession();
      return navigate('/login');
    }

    const fetchAllInitialData = async () => {
      try {
        setIsLoading(true);

        const [resGrades, resSubjects, resCourse] = await Promise.all([
          axios.get(`${API_BASE}/admin/grades`, authConfig),
          axios.get(`${API_BASE}/admin/subjects`, authConfig),
          axios.get(`${API_BASE}/client/courses/${courseId}`, authConfig)
        ]);

        const gData = resGrades.data.success ? resGrades.data.data : resGrades.data;
        const sData = resSubjects.data.success ? resSubjects.data.data : resSubjects.data;

        if (Array.isArray(gData)) setGrades(gData);
        if (Array.isArray(sData)) setSubjects(sData);

        const rawCourse = resCourse.data.info || resCourse.data.data || resCourse.data;
        const info = Array.isArray(rawCourse) ? rawCourse[0] : rawCourse;

        if (info) {
          setValue('course_name', info.course_name || info.title || '');
          setValue('subject_id', info.subject_id !== undefined && info.subject_id !== null ? String(info.subject_id) : '');
          setValue('grade_id', info.grade_id !== undefined && info.grade_id !== null ? String(info.grade_id) : '');
          setValue('description', info.description || '');

          if (info.img_url || info.thumbnail) {
            const rawImg = info.img_url || info.thumbnail;
            setPreview(rawImg.startsWith('http') ? rawImg : `http://localhost:3000${rawImg.startsWith('/') ? '' : '/'}${rawImg}`);
          }
        } else {
          throw new Error("Không tìm thấy thông tin khóa học hợp lệ trong cơ sở dữ liệu");
        }
      } catch (error) {
        if (error.response && [401, 403].includes(error.response.status)) {
          alert("Tài khoản không có quyền hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại Admin!");
          clearStoredSession();
          navigate('/login');
        } else {
          alert("Không tìm thấy dữ liệu khóa học hoặc cấu hình hệ thống bị gián đoạn!");
          navigate(-1);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchAllInitialData();
    } else {
      alert("Đường dẫn chỉnh sửa không hợp lệ!");
      navigate(-1);
    }
  }, [courseId, token, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setValue('thumbnailFile', file);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => { if (preview && thumbnailFile) URL.revokeObjectURL(preview); };
  }, [preview, thumbnailFile]);

  const onSubmitForm = async (data) => {
    if (!data.course_name.trim()) return alert("Vui lòng nhập tên khóa học!");

    setIsSubmitting(true);
    const submitData = new FormData();
    submitData.append('course_name', data.course_name.trim());
    submitData.append('subject_id', Number(data.subject_id));
    submitData.append('grade_id', Number(data.grade_id));
    submitData.append('description', data.description || '');
    submitData.append("folderType", "khoahoc");

    if (data.thumbnailFile) {
      submitData.append('thumbnailFile', data.thumbnailFile);
    }

    try {
      await axios.put(`${API_BASE}/admin/courses/update/${courseId}`, submitData, {
        headers: { ...authConfig.headers, 'Content-Type': 'multipart/form-data' }
      });
      alert('Cập nhật khóa học thành công!');
      navigate(`/admin/courses?grade=${data.grade_id}`);
    } catch (error) {
      alert(error.response?.data?.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại hệ thống Backend!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="container-center text-center mt-10">Đang tải cấu hình khóa học...</div>;

  return (
    <div className="container-center">
      <div className="upload-card create-course-wrapper">
        <div className="create-course-header">
          <button type="button" onClick={() => navigate(-1)} className="btn-circle-back">
            <ArrowLeft size={18} color="#334155" />
          </button>
          <h2 className="create-course-title"><Edit size={24} /> Chỉnh Sửa Khóa Học</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="create-course-form">
          <div>
            <div className="form-group form-group-mb">
              <label className="form-label">Tên khóa học <span className="required-star">*</span></label>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Nhập tên khóa học..."
                {...register('course_name')}
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Môn học</label>
                <select required className="form-control select-pointer" {...register('subject_id')}>
                  <option value="" disabled hidden>-- Chọn môn học --</option>
                  {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Khối Lớp</label>
                <select required className="form-control select-pointer" {...register('grade_id')}>
                  <option value="" disabled hidden>-- Chọn khối lớp --</option>
                  {grades.map(g => <option key={g.grade_id} value={g.grade_id}>{g.grade_name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả khóa học</label>
              <textarea
                rows="5"
                className="form-control form-textarea"
                placeholder="Tóm tắt ngắn gọn nội dung khóa học..."
                {...register('description')}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Ảnh bìa khóa học (Thumbnail)</label>
            <div className="dropzone-area custom-dropzone dropzone-clickable" onClick={() => document.getElementById('course-thumb').click()}>
              <input id="course-thumb" type="file" hidden accept="image/*" onChange={handleFileChange} />
              {preview ? (
                <img src={preview} className="preview-img dropzone-preview" alt="preview" />
              ) : (
                <div className="dropzone-placeholder">
                  <ImageIcon size={40} className="dropzone-icon" />
                  <p className="dropzone-text">Kéo thả hoặc click chọn ảnh minh họa mới</p>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">Hủy</button>
              <button type="submit" disabled={isSubmitting} className={`btn-blue btn-submit ${isSubmitting ? 'btn-submitting' : ''}`}>
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}