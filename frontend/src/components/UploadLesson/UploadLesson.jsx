import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Image as ImageIcon, Film } from 'lucide-react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import '../../App.css';
import './UploadLesson.css'; 

export default function UploadLesson() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  
  const [searchParams] = useSearchParams();
  const defaultChapter = searchParams.get('chapterName') || 'Chương 1';

  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDataState, setFormDataState] = useState({
    title: '',
    chapter: defaultChapter, 
    content: '',
    videoFile: null,
    thumbnailFile: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormDataState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleContentChange = (value) => {
    setFormDataState(prev => ({ ...prev, content: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFormDataState(prev => ({ ...prev, [fieldName]: file }));
      if (fieldName === 'thumbnailFile') {
        setPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const submitData = new FormData();
    submitData.append('title', formDataState.title);
    submitData.append('chapter', formDataState.chapter);
    submitData.append('content', formDataState.content);
    submitData.append('course_id', courseId);
    
    if (formDataState.videoFile) submitData.append('video', formDataState.videoFile);
    if (formDataState.thumbnailFile) submitData.append('thumbnail', formDataState.thumbnailFile);

    try {
      await axios.post('http://localhost:3000/api/lessons', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Tải lên thành công!');
      navigate(`/course/${courseId}`); 
    } catch (error) {
      console.log("Lỗi:", error.message);
      alert('Lỗi! Bạn nhớ kiểm tra xem Backend đã bật chưa nhé.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-center">
      <div className="upload-card">
        
        {/* HEADER */}
        <div className="upload-header-box">
          <h2 className="upload-page-title">Upload bài giảng</h2>
          <p className="upload-page-subtitle">Tải lên video cho khóa học</p>
        </div>
        
        <form className="upload-grid" onSubmit={handleSubmit}>
          
          {/* CỘT TRÁI */}
          <div className="upload-form-left">
            <h3 className="upload-section-title">Thông tin bài giảng</h3>
            
            <div className="form-group">
              <input type="text" name="title" required placeholder="Tên bài giảng" onChange={handleInputChange} value={formDataState.title} className="form-control" />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="upload-label">Thuộc Chương</label>
              <input type="text" name="chapter" placeholder="VD: Chương 1..." onChange={handleInputChange} value={formDataState.chapter} className="form-control" />
            </div>

            <div className="form-group upload-quill-group">
              <label className="upload-label">Nội dung chi tiết bài học</label>
              <ReactQuill 
                theme="snow" 
                value={formDataState.content} 
                onChange={handleContentChange} 
                className="upload-quill-editor"
              />
            </div>

            <div className="form-group">
              <label className="upload-label">Upload Video <span className="required-star">*</span></label>
              <div className="upload-file-box">
                <div className="upload-file-info">
                  <Film size={20} color="#000" />
                  <span>{formDataState.videoFile?.name || "Kéo thả, chọn video"}</span>
                </div>
                <button type="button" className="btn-blue upload-btn-choose" onClick={() => document.getElementById('video-input').click()}>
                  Chọn video
                </button>
                <input id="video-input" type="file" required hidden accept="video/*" onChange={(e) => handleFileChange(e, 'videoFile')} />
              </div>
            </div>
          </div>

          {/* CỘT PHẢI */}
          <div className="upload-form-right">
            <label className="upload-label" style={{ fontWeight: 700 }}>Thumbnail (Ảnh bìa)</label>
            <div className="dropzone-area upload-thumb-dropzone" onClick={() => document.getElementById('thumb-input').click()}>
              <input id="thumb-input" type="file" hidden accept="image/*" onChange={(e) => handleFileChange(e, 'thumbnailFile')} />
              {preview ? (
                <img src={preview} className="preview-img dropzone-preview" alt="preview" />
              ) : (
                <div className="upload-thumb-placeholder">
                  <ImageIcon size={40} className="upload-thumb-icon" />
                  <p className="upload-thumb-text">Kéo thả hoặc chọn ảnh</p>
                </div>
              )}
            </div>
            
            <div className="upload-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-upload-cancel">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="btn-blue btn-upload-submit" style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                {isSubmitting ? 'Đang tải lên...' : 'Đăng bài'}
              </button>
            </div>
          </div>
          
        </form>
      </div>
    </div>
  );
}