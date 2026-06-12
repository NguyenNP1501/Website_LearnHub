import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Image as ImageIcon, Film, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../../App.css';
import '../../../assets/styles/UploadLesson.css';

export default function UploadLesson() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const urlChapter = searchParams.get('chapterName') || '';

  // STATES DỮ LIỆU & UI
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingChapters, setExistingChapters] = useState([]); // Danh sách chương để chọn
  const [isNewChapter, setIsNewChapter] = useState(false);      // Trạng thái bật ô nhập chương mới
  const [formDataState, setFormDataState] = useState({
    title: '', 
    chapter: urlChapter, 
    content: '', 
    videoFile: null, 
    thumbnailFile: null
  });

  // ĐỌC TOKEN BẢO MẬT TỪ LOCALSTORAGE
  const getValidToken = () => {
    try { return JSON.parse(sessionStorage.getItem("remake-2.auth"))?.token || null; } catch { return null; }
  };

  const token = getValidToken();

  useEffect(() => {
    if (!token) {
      alert("Lỗi bảo mật: Phiên đăng nhập đã hết hạn hoặc bạn không có quyền. Vui lòng đăng nhập tài khoản Quản trị viên!");
      navigate('/login');
    }
  }, [token, navigate]);

  // TỰ ĐỘNG TẢI TẤT CẢ CÁC CHƯƠNG ĐỂ HIỂN THỊ LÊN MENU CHỌN
  useEffect(() => {
    if (!token || !courseId) return;

    axios.get(`http://localhost:3000/api/client/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const fetchedChapters = res.data.chapters || [];
      // Lọc trùng và lấy danh sách tên chương độc nhất
      const chapterNames = [...new Set(fetchedChapters.map(ch => ch.chapter_name || ch.title).filter(Boolean))];
      setExistingChapters(chapterNames);

      // Xử lý logic hiển thị mặc định thông minh
      if (urlChapter) {
        setFormDataState(prev => ({ ...prev, chapter: urlChapter }));
        setIsNewChapter(!chapterNames.includes(urlChapter));
      } else if (chapterNames.length > 0) {
        // Nếu click Upload chung: hiển thị menu chọn và lấy chương mới nhất làm mặc định
        const lastChapter = chapterNames[chapterNames.length - 1];
        setFormDataState(prev => ({ ...prev, chapter: lastChapter }));
        setIsNewChapter(false);
      } else {
        // Khóa học chưa có chương nào -> Bắt buộc tạo mới
        setFormDataState(prev => ({ ...prev, chapter: 'Chương 1' }));
        setIsNewChapter(true);
      }
    })
    .catch(err => {
      console.error("Lỗi lấy danh sách chương:", err);
      setFormDataState(prev => ({ ...prev, chapter: prev.chapter || 'Chương 1' }));
      setIsNewChapter(true);
    });
  }, [courseId, token, urlChapter]);

  // HANDLERS THAY ĐỔI DỮ LIỆU INPUT
  const handleInputChange = (e) => setFormDataState(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleContentChange = (value) => setFormDataState(prev => ({ ...prev, content: value }));
  
  // Xử lý riêng khi thay đổi trên Select Dropdown chương
  const handleChapterSelectChange = (e) => {
    const value = e.target.value;
    if (value === '__NEW__') {
      setIsNewChapter(true);
      setFormDataState(prev => ({ ...prev, chapter: '' })); // Reset để user tự gõ tên mới
    } else {
      setIsNewChapter(false);
      setFormDataState(prev => ({ ...prev, chapter: value }));
    }
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormDataState(prev => ({ ...prev, [fieldName]: file }));
      if (fieldName === 'thumbnailFile') setPreview(URL.createObjectURL(file));
    }
  };

  // XỬ LÝ GỬI BÀI GIẢNG LÊN BACKEND
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!token) {
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
      navigate('/login');
      return setIsSubmitting(false);
    }
    if (!formDataState.chapter.trim()) {
      alert("Vui lòng điền hoặc chọn tên Chương học!");
      return setIsSubmitting(false);
    }
    if (!formDataState.videoFile) {
      alert("Vui lòng chọn tệp Video bài giảng trước khi đăng!");
      return setIsSubmitting(false);
    }

    const submitData = new FormData();
    submitData.append('title', formDataState.title);
    submitData.append('chapter', formDataState.chapter.trim());
    submitData.append('content', formDataState.content);
    submitData.append('course_id', Number(courseId));
    submitData.append("folderType", "khoahoc");

    if (formDataState.videoFile) submitData.append('videoFile', formDataState.videoFile);
    if (formDataState.thumbnailFile) submitData.append('thumbnailFile', formDataState.thumbnailFile);

    try {
      await axios.post('http://localhost:3000/api/admin/lessons/create', submitData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` }
      });
      alert('Tải lên bài giảng thành công!');
      navigate(`/admin/course/${courseId}`);
    } catch (error) {
      console.error("Lỗi đăng bài học:", error);
      if (error.response && [401, 403].includes(error.response.status)) {
        alert("Tài khoản không đủ thẩm quyền hoặc Token hết hạn. Vui lòng đăng nhập lại tài khoản Admin!");
        navigate('/login');
      } else {
        alert(error.response?.data?.message || 'Lỗi! Tạo bài giảng thất bại, vui lòng kiểm tra kết nối Backend.');
      }
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="container-center">
      <div className="upload-card">
        <div className="upload-header-box" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button type="button" onClick={() => navigate(-1)} className="btn-circle-back" style={{ marginBottom: '10px' }}>
            <ArrowLeft size={18} color="#334155" />
          </button>
          <div>
            <h2 className="upload-page-title" style={{ margin: 0 }}>Upload bài giảng</h2>
            <p className="upload-page-subtitle" style={{ margin: 0 }}>Tải lên video cho khóa học</p>
          </div>
        </div>

        <form className="upload-grid" onSubmit={handleSubmit}>
          {/* CỘT TRÁI: THÔNG TIN BÀI HỌC */}
          <div className="upload-form-left">
            <h3 className="upload-section-title">Thông tin bài giảng</h3>

            <div className="form-group">
              <label className="upload-label">Tên bài giảng <span className="required-star">*</span></label>
              <input type="text" name="title" required placeholder="Nhập tên bài giảng..." onChange={handleInputChange} value={formDataState.title} className="form-control" />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="upload-label">Thuộc Chương <span className="required-star">*</span></label>
              
              {/* Nếu khóa học đã có sẵn chương, hiện danh sách thả xuống */}
              {existingChapters.length > 0 && (
                <select 
                  className="form-control" 
                  value={isNewChapter ? '__NEW__' : formDataState.chapter} 
                  onChange={handleChapterSelectChange}
                  style={{ marginBottom: isNewChapter ? '10px' : '0' }}
                >
                  {existingChapters.map((chName, idx) => (
                    <option key={idx} value={chName}>{chName}</option>
                  ))}
                  <option value="__NEW__" style={{ fontWeight: 'bold', color: '#2563eb' }}>+ Tạo chương mới...</option>
                </select>
              )}

              {/* Ô nhập text tự động xuất hiện khi chọn "Tạo chương mới" hoặc khi khóa học chưa có chương nào */}
              {(isNewChapter || existingChapters.length === 0) && (
                <input 
                  type="text" 
                  name="chapter" 
                  required
                  placeholder="Nhập tên chương mới (VD: Chương 2: Phép toán mới)..." 
                  onChange={handleInputChange} 
                  value={formDataState.chapter} 
                  className="form-control" 
                />
              )}
            </div>

            <div className="form-group upload-quill-group">
              <label className="upload-label">Nội dung chi tiết bài học</label>
              <ReactQuill theme="snow" value={formDataState.content} onChange={handleContentChange} className="upload-quill-editor" placeholder="Viết tóm tắt nội dung học hoặc các mốc thời gian quan trọng trong video..." />
            </div>

            <div className="form-group">
              <label className="upload-label">Upload Video <span className="required-star">*</span></label>
              <div className="upload-file-box">
                <div className="upload-file-info">
                  <Film size={20} color="#3b82f6" />
                  <span style={{ fontWeight: formDataState.videoFile ? '600' : '400' }}>{formDataState.videoFile?.name || "Kéo thả hoặc click chọn file video bài giảng"}</span>
                </div>
                <button type="button" className="btn-blue upload-btn-choose" onClick={() => document.getElementById('video-input').click()}>Chọn video</button>
                <input id="video-input" type="file" required hidden accept="video/*" onChange={(e) => handleFileChange(e, 'videoFile')} />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: THUMBNAIL & SUBMIT */}
          <div className="upload-form-right">
            <label className="upload-label" style={{ fontWeight: 700 }}>Thumbnail bài giảng (Ảnh bìa)</label>
            <div className="dropzone-area upload-thumb-dropzone" onClick={() => document.getElementById('thumb-input').click()}>
              <input id="thumb-input" type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnailFile')} />
              {preview ? <img src={preview} className="preview-img dropzone-preview" alt="preview" /> : (
                <div className="upload-thumb-placeholder">
                  <ImageIcon size={40} className="upload-thumb-icon" />
                  <p className="upload-thumb-text">Kéo thả hoặc click chọn ảnh minh họa bài học</p>
                </div>
              )}
            </div>

            <div className="upload-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-upload-cancel">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="btn-blue btn-upload-submit" style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Đang tải lên...' : 'Đăng bài học'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
