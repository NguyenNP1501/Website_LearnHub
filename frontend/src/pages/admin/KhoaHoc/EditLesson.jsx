import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Image as ImageIcon, Film, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../../App.css';
import '../../../assets/styles/UploadLesson.css';

export default function EditLesson() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [preview, setPreview] = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseId, setCourseId] = useState(null);

  const [formDataState, setFormDataState] = useState({
    title: '', chapter: '', content: '', status: 'Active', videoFile: null, thumbnailFile: null
  });

  const getValidToken = () => {
    try { return JSON.parse(sessionStorage.getItem("remake-2.auth"))?.token || null; } catch { return null; }
  };

  // ==================== LẤY DỮ LIỆU CŨ CỦA BÀI GIẢNG ====================
  useEffect(() => {
    const token = getValidToken();
    if (!token) {
      alert("Phiên làm việc hết hạn, vui lòng đăng nhập lại!");
      return navigate('/login');
    }

    (async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`http://localhost:3000/api/admin/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data?.success) {
          const lessonData = response.data.data;
          setFormDataState({
            title: lessonData.title || '',
            chapter: lessonData.chapter || '',
            content: lessonData.content || '',
            status: lessonData.status || 'Active',
            videoFile: null,
            thumbnailFile: null
          });
          setPreview(lessonData.img_url || null);
          setExistingVideoUrl(lessonData.video_url || '');
          setCourseId(lessonData.course_id);
        }
      } catch (error) {
        console.error("Lỗi lấy thông tin chi tiết bài giảng:", error);
        alert("Không thể tải thông tin bài giảng này!");
      } finally { setIsLoading(false); }
    })();
  }, [lessonId, navigate]);

  // HANDLERS THAY ĐỔI DỮ LIỆU
  const handleInputChange = (e) => setFormDataState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleQuillChange = (value) => setFormDataState(prev => ({ ...prev, content: value }));

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormDataState(prev => ({ ...prev, [fieldName]: file }));
    if (fieldName === 'thumbnailFile') {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // ==================== GỬI DỮ LIỆU CẬP NHẬT LÊN BACKEND ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formDataState.title.trim()) return alert("Vui lòng nhập tiêu đề bài học!");

    setIsSubmitting(true);
    const currentToken = getValidToken();
    if (!currentToken) {
      alert("Phiên làm việc hết hạn, vui lòng đăng nhập lại!");
      navigate('/login');
      return setIsSubmitting(false);
    }

    try {
      const submitData = new FormData();
      submitData.append('title', formDataState.title);
      submitData.append('chapter', formDataState.chapter || "Chương 1");
      submitData.append('content', formDataState.content);
      submitData.append('status', formDataState.status || "Active");
      submitData.append("folderType", "khoahoc");
      if (courseId) submitData.append('course_id', Number(courseId));
      if (formDataState.videoFile) submitData.append('videoFile', formDataState.videoFile);
      if (formDataState.thumbnailFile) submitData.append('thumbnailFile', formDataState.thumbnailFile);

      const response = await axios.put(`http://localhost:3000/api/admin/lessons/${lessonId}`, submitData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${currentToken}` }
      });

      if (response.data?.success) {
        alert('Cập nhật thông tin bài giảng thành công!');
        navigate(-1);
      } else {
        alert(response.data?.message || 'Có lỗi xảy ra khi lưu bài giảng.');
      }
    } catch (err) {
      console.error("❌ Lỗi gửi dữ liệu cập nhật bài học:", err.response?.data || err.message);
      alert(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại hệ thống!');
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="container-center text-center mt-10">Đang tải thông tin bài học...</div>;

  return (
    <div className="container-center">
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '15px', background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
        <ArrowLeft size={18} /> Quay lại chi tiết khóa học
      </button>

      <div className="upload-card">
        <div className="upload-header-box">
          <h1 className="upload-page-title">Chỉnh sửa bài giảng</h1>
          <p className="upload-page-subtitle">Cập nhật nội dung văn bản, video hoặc hình ảnh minh họa cho bài học</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-grid">
          {/* CỘT TRÁI */}
          <div className="upload-left-form">
            <h3 className="upload-section-title">Thông tin cơ bản</h3>

            <div className="form-group">
              <label className="upload-label">Tiêu đề bài học <span className="required-star">*</span></label>
              <input type="text" name="title" value={formDataState.title} onChange={handleInputChange} className="form-control" placeholder="Nhập tên bài học cụ thể..." />
            </div>

            <div className="form-group">
              <label className="upload-label">Tên chương / Nhóm bài học</label>
              <input type="text" name="chapter" value={formDataState.chapter} onChange={handleInputChange} className="form-control" placeholder="Ví dụ: Chương I: Động từ bất quy tắc" />
            </div>

            <div className="form-group upload-quill-group">
              <label className="upload-label">Nội dung chi tiết bài học</label>
              <ReactQuill theme="snow" value={formDataState.content} onChange={handleQuillChange} className="upload-quill-editor" placeholder="Viết hướng dẫn hoặc tóm tắt bài giảng tại đây..." />
            </div>

            <div className="form-group">
              <label className="upload-label">Video bài giảng</label>
              <div className="upload-file-box" onClick={() => document.getElementById('video-input').click()} style={{ cursor: 'pointer' }}>
                <input id="video-input" type="file" hidden accept="video/*" onChange={(e) => handleFileChange(e, 'videoFile')} />
                <div className="upload-file-info">
                  <Film size={20} color="#3b82f6" />
                  <span style={{ fontWeight: formDataState.videoFile ? '600' : '400', color: formDataState.videoFile ? '#16a34a' : 'inherit' }}>
                    {formDataState.videoFile ? `File mới chọn: ${formDataState.videoFile.name}` : existingVideoUrl ? "Đã có video trên hệ thống (Nhấp để thay đổi)" : "Chọn video bài giảng (.mp4)"}
                  </span>
                </div>
                <button type="button" className="btn-blue upload-btn-choose">Chọn File</button>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="upload-right-media">
            <div className="form-group">
              <label className="upload-label">Trạng thái hiển thị</label>
              <select name="status" value={formDataState.status} onChange={handleInputChange} className="form-control" style={{ cursor: 'pointer' }}>
                <option value="Active">Hiển thị công khai (Active)</option>
                <option value="Inactive">Tạm ẩn bài học (Inactive)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="upload-label">Ảnh minh họa bài học (Thumbnail)</label>
              <div className="upload-thumb-dropzone" onClick={() => document.getElementById('thumb-input').click()}>
                <input id="thumb-input" type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnailFile')} />
                {preview ? <img src={preview} className="dropzone-preview" alt="preview thumbnail" /> : (
                  <div className="upload-thumb-placeholder">
                    <ImageIcon size={40} className="upload-thumb-icon" />
                    <p className="upload-thumb-text">Nhấp vào đây để thay đổi ảnh minh họa mới</p>
                  </div>
                )}
              </div>
            </div>

            <div className="upload-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-upload-cancel">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="btn-blue btn-upload-submit">
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
