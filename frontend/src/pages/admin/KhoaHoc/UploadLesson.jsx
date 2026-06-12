import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Image as ImageIcon, Film, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../../App.css';
import '../../../assets/styles/UploadLesson.css';
import { getStoredToken, clearStoredSession } from "../../../utils/authStorage";

const API_BASE = 'http://localhost:3000/api';

export default function UploadLesson() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const urlChapter = searchParams.get('chapterName') || '';

  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingChapters, setExistingChapters] = useState([]);
  const [isNewChapter, setIsNewChapter] = useState(false);

  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: '',
      chapter: urlChapter,
      chapterSelect: urlChapter || '',
      content: '',
      videoFile: null,
      thumbnailFile: null
    }
  });

  const chapter = watch('chapter');
  const videoFile = watch('videoFile');
  const content = watch('content');

  const token = getStoredToken();
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) {
      alert("Lỗi bảo mật: Phiên đăng nhập đã hết hạn hoặc bạn không có quyền!");
      clearStoredSession();
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => {
    if (!token || !courseId) return;

    axios.get(`${API_BASE}/client/courses/${courseId}`, authConfig)
      .then(res => {
        const courseData = res.data.data || res.data;
        const fetchedChapters = courseData?.chapters || [];

        const chapterNames = [...new Set(fetchedChapters.map(ch => ch.chapter_name || ch.title).filter(Boolean))];
        setExistingChapters(chapterNames);

        if (urlChapter) {
          setValue('chapter', urlChapter);
          setIsNewChapter(!chapterNames.includes(urlChapter));
        } else if (chapterNames.length > 0) {
          const lastChapter = chapterNames[chapterNames.length - 1];
          setValue('chapter', lastChapter);
          setValue('chapterSelect', lastChapter);
          setIsNewChapter(false);
        } else {
          setValue('chapter', '');
          setIsNewChapter(true);
        }
      })
      .catch(() => {
        setValue('chapter', urlChapter || '');
        setIsNewChapter(true);
      });
  }, [courseId, token, urlChapter]);

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
    if (file) {
      setValue(fieldName, file);
      if (fieldName === 'thumbnailFile') setPreview(URL.createObjectURL(file));
    }
  };

  const onSubmitForm = async (data) => {
    if (!token) {
      clearStoredSession();
      return navigate('/login');
    }
    if (!data.chapter?.trim()) return alert("Vui lòng điền hoặc chọn tên Chương học!");
    if (!data.videoFile) return alert("Vui lòng chọn tệp Video bài giảng trước khi đăng!");

    setIsSubmitting(true);
    const submitData = new FormData();
    submitData.append('title', data.title);
    submitData.append('chapter', data.chapter.trim());
    submitData.append('content', data.content);
    submitData.append('course_id', Number(courseId));
    submitData.append("folderType", "khoahoc");

    if (data.videoFile) submitData.append('videoFile', data.videoFile);
    if (data.thumbnailFile) submitData.append('thumbnailFile', data.thumbnailFile);

    try {
      await axios.post(`${API_BASE}/admin/lessons/create`, submitData, {
        headers: { ...authConfig.headers, 'Content-Type': 'multipart/form-data' }
      });
      alert('Tải lên bài giảng thành công!');
      navigate(`/admin/course/${courseId}`);
    } catch (error) {
      if (error.response && [401, 403].includes(error.response.status)) {
        alert("Tài khoản không đủ thẩm quyền hoặc Phiên đăng nhập hết hạn!");
        clearStoredSession();
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Lỗi! Tạo bài giảng thất bại, vui lòng kiểm tra lại hệ thống.');
      }
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="container-center">
      <div className="upload-card">
        <div className="upload-header-box">
          <button type="button" onClick={() => navigate(-1)} className="btn-circle-back">
            <ArrowLeft size={18} color="#334155" />
          </button>
          <div>
            <h2 className="upload-page-title">Upload bài giảng</h2>
            <p className="upload-page-subtitle">Tải lên video cho khóa học</p>
          </div>
        </div>

        <form className="upload-grid" onSubmit={handleSubmit(onSubmitForm)}>
          <div className="upload-form-left">
            <h3 className="upload-section-title">Thông tin bài giảng</h3>

            <div className="form-group">
              <label className="upload-label">Tên bài giảng <span className="required-star">*</span></label>
              <input
                type="text"
                required
                placeholder="Nhập tên bài giảng..."
                className="form-control"
                {...register('title')}
              />
            </div>

            <div className="form-group form-group-mb">
              <label className="upload-label">Thuộc Chương <span className="required-star">*</span></label>

              <select
                className={`form-control ${isNewChapter ? 'form-select-mb' : ''}`}
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
                  placeholder={existingChapters.length === 0 ? "Nhập tên chương đầu tiên (VD: Chương 1: Mở đầu)..." : "Nhập tên chương mới..."}
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
                placeholder="Viết tóm tắt nội dung học..."
              />
            </div>

            <div className="form-group">
              <label className="upload-label">Upload Video <span className="required-star">*</span></label>
              <div className="upload-file-box">
                <div className="upload-file-info">
                  <Film size={20} color="#3b82f6" />
                  <span className={videoFile ? "text-semibold" : "text-regular"}>
                    {videoFile?.name || "Kéo thả hoặc click chọn file video bài giảng"}
                  </span>
                </div>
                <button type="button" className="btn-blue upload-btn-choose" onClick={() => document.getElementById('video-input').click()}>Chọn video</button>
                <input id="video-input" type="file" required hidden accept="video/*" onChange={(e) => handleFileChange(e, 'videoFile')} />
              </div>
            </div>
          </div>

          <div className="upload-form-right">
            <label className="upload-label upload-label-bold">Thumbnail bài giảng (Ảnh bìa)</label>
            <div className="dropzone-area upload-thumb-dropzone" onClick={() => document.getElementById('thumb-input').click()}>
              <input id="thumb-input" type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnailFile')} />
              {preview ? (
                <img src={preview} className="preview-img dropzone-preview" alt="preview" />
              ) : (
                <div className="upload-thumb-placeholder">
                  <ImageIcon size={40} className="upload-thumb-icon" />
                  <p className="upload-thumb-text">Kéo thả hoặc click chọn ảnh minh họa bài học</p>
                </div>
              )}
            </div>

            <div className="upload-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-upload-cancel">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="btn-blue btn-upload-submit">
                {isSubmitting ? 'Đang tải lên...' : 'Đăng bài học'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}