import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Image as ImageIcon, Film, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../../App.css';
import '../../../assets/styles/UploadLesson.css';
import { getStoredToken, clearStoredSession } from "../../../utils/authStorage";

const API_BASE = 'http://localhost:3000/api';

export default function EditLesson() {
  const navigate = useNavigate();
  const { lessonId } = useParams();

  const [preview, setPreview] = useState(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [existingChapters, setExistingChapters] = useState([]);
  const [isNewChapter, setIsNewChapter] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      chapter: '',
      content: '',
      status: 'Active',
      videoFile: null,
      thumbnailFile: null
    }
  });

  const chapter = watch('chapter');
  const videoFile = watch('videoFile');
  const content = watch('content');

  const token = getStoredToken();
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  // ==================== 1. TẢI DỮ LIỆU BÀI GIẢNG ====================
  useEffect(() => {
    if (!token) {
      alert("Phiên làm việc hết hạn, vui lòng đăng nhập lại!");
      clearStoredSession();
      return navigate('/login');
    }

    (async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_BASE}/admin/lessons/${lessonId}`, authConfig);

        if (response.data?.success || response.data?.data) {
          const lessonData = response.data.data || response.data;

          setValue('title', lessonData.title || '');
          setValue('chapter', lessonData.chapter || '');
          setValue('content', lessonData.content || '');
          setValue('status', lessonData.status || 'Active');
          setPreview(lessonData.img_url || null);
          setExistingVideoUrl(lessonData.video_url || '');
          setCourseId(lessonData.course_id);
        }
      } catch (error) {
        if (error.response && [401, 403].includes(error.response.status)) {
          alert("Tài khoản không đủ thẩm quyền hoặc Phiên đăng nhập hết hạn!");
          clearStoredSession();
          navigate('/login');
        } else {
          alert("Không thể tải thông tin bài giảng này! Vui lòng kiểm tra lại kết nối mạng hoặc API.");
        }
      } finally { setIsLoading(false); }
    })();
  }, [lessonId, token, navigate]);

  // ==================== 2. TẢI DANH SÁCH CHƯƠNG ====================
  useEffect(() => {
    if (!token || !courseId) return;

    axios.get(`${API_BASE}/client/courses/${courseId}`, authConfig)
      .then(res => {
        const courseData = res.data.data || res.data;
        const fetchedChapters = courseData?.chapters || [];

        const chapterNames = [...new Set(fetchedChapters.map(ch => ch.chapter_name || ch.title).filter(Boolean))];
        setExistingChapters(chapterNames);

        if (chapter && !chapterNames.includes(chapter)) {
          setIsNewChapter(true);
        }
      })
      .catch(() => {});
  }, [courseId, token, chapter]);

  const handleChapterSelectChange = (e) => {
    const value = e.target.value;
    if (value === '__NEW__') {
      setIsNewChapter(true);
      setValue('chapter', '');
    } else {
      setIsNewChapter(false);
      setValue('chapter', value);
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;
    setValue(fieldName, file);
    if (fieldName === 'thumbnailFile') setPreview(URL.createObjectURL(file));
  };

  // ==================== 3. SUBMIT ====================
  const onSubmitForm = async (data) => {
    if (!data.title?.trim()) return alert("Vui lòng nhập tiêu đề bài học!");
    if (!data.chapter?.trim()) return alert("Vui lòng nhập hoặc chọn chương học!");

    if (!token) {
      alert("Phiên làm việc hết hạn, vui lòng đăng nhập lại!");
      clearStoredSession();
      return navigate('/login');
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('title', data.title.trim());
      submitData.append('chapter', data.chapter.trim());
      submitData.append('content', data.content);
      submitData.append('status', data.status || "Active");
      submitData.append("folderType", "khoahoc");

      if (courseId) submitData.append('course_id', Number(courseId));
      if (data.videoFile) submitData.append('videoFile', data.videoFile);
      if (data.thumbnailFile) submitData.append('thumbnailFile', data.thumbnailFile);

      const response = await axios.put(`${API_BASE}/admin/lessons/${lessonId}`, submitData, {
        headers: { ...authConfig.headers, 'Content-Type': 'multipart/form-data' }
      });

      if (response.data?.success) {
        alert('Cập nhật thông tin bài giảng thành công!');
        navigate(-1);
      } else {
        alert(response.data?.message || 'Có lỗi xảy ra khi lưu bài giảng.');
      }
    } catch (err) {
      if (err.response && [401, 403].includes(err.response.status)) {
        alert("Tài khoản không đủ thẩm quyền hoặc Phiên đăng nhập hết hạn!");
        clearStoredSession();
        navigate('/login');
      } else {
        alert(err.response?.data?.message || 'Cập nhật thất bại. Vui lòng kiểm tra lại hệ thống!');
      }
    } finally { setIsSubmitting(false); }
  };

  if (isLoading) return <div className="container-center text-center mt-10">Đang tải thông tin bài học...</div>;

  return (
    <div className="container-center">
      <div className="upload-card">
        <div className="upload-header-box">
          <button type="button" onClick={() => navigate(-1)} className="btn-circle-back">
            <ArrowLeft size={18} color="#334155" />
          </button>
          <div>
            <h1 className="upload-page-title">Chỉnh sửa bài giảng</h1>
            <p className="upload-page-subtitle">Cập nhật nội dung văn bản, video hoặc hình ảnh minh họa cho bài học</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="upload-grid">
          <div className="upload-left-form">
            <h3 className="upload-section-title">Thông tin cơ bản</h3>

            <div className="form-group">
              <label className="upload-label">Tiêu đề bài học <span className="required-star">*</span></label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập tên bài học cụ thể..."
                {...register('title')}
              />
            </div>

            <div className="form-group form-group-mb">
              <label className="upload-label">Thuộc Chương <span className="required-star">*</span></label>

              <select
                className={`form-control select-pointer ${isNewChapter ? 'form-select-mb' : ''}`}
                value={isNewChapter ? '__NEW__' : chapter}
                onChange={handleChapterSelectChange}
              >
                {existingChapters.map((chName, idx) => (
                  <option key={idx} value={chName}>{chName}</option>
                ))}
                <option value="__NEW__" className="option-new-chapter">+ Tạo chương mới...</option>
              </select>

              {isNewChapter && (
                <input
                  type="text"
                  required
                  autoComplete="off"
                  placeholder="Nhập tên chương mới..."
                  className="form-control"
                  {...register('chapter')}
                />
              )}
            </div>

            <div className="form-group upload-quill-group">
              <label className="upload-label">Nội dung chi tiết bài học</label>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={(value) => setValue('content', value)}
                className="upload-quill-editor"
                placeholder="Viết hướng dẫn hoặc tóm tắt bài giảng tại đây..."
              />
            </div>

            <div className="form-group">
              <label className="upload-label">Video bài giảng</label>
              <div className="upload-file-box select-pointer" onClick={() => document.getElementById('video-input').click()}>
                <input id="video-input" type="file" hidden accept="video/*" onChange={(e) => handleFileChange(e, 'videoFile')} />
                <div className="upload-file-info">
                  <Film size={20} color="#3b82f6" />
                  <span className={videoFile ? 'text-semibold text-green' : 'text-regular'}>
                    {videoFile ? `File mới chọn: ${videoFile.name}` : existingVideoUrl ? "Đã có video trên hệ thống (Nhấp để thay đổi)" : "Chọn video bài giảng (.mp4)"}
                  </span>
                </div>
                <button type="button" className="btn-blue upload-btn-choose">Chọn File</button>
              </div>
            </div>
          </div>

          <div className="upload-right-media">
            <div className="form-group">
              <label className="upload-label">Trạng thái hiển thị</label>
              <select className="form-control select-pointer" {...register('status')}>
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