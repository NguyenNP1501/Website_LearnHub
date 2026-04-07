import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import '../../App.css';
import '../CreateCourese/CreateCoures.css';

export default function CreateCourse() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preview, setPreview] = useState(null);
  
  const [formDataState, setFormDataState] = useState({
    course_name: '',
    subject: 'Toán học',
    grade_class: 'Lớp 1',
    description: '',
    thumbnailFile: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormDataState(prev => ({ ...prev, [name]: value }));
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

    const submitData = new FormData();
    submitData.append('course_name', formDataState.course_name);
    submitData.append('subject', formDataState.subject);
    submitData.append('grade_class', formDataState.grade_class);
    submitData.append('description', formDataState.description);
    if (formDataState.thumbnailFile) {
      submitData.append('thumbnail', formDataState.thumbnailFile);
    }

    try {
      await axios.post('http://localhost:3000/api/courses', submitData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Tạo khóa học thành công!');
      navigate(`/courses?grade=${formDataState.grade_class}`); 
    } catch (error) {
      console.log("Lỗi:", error.message);
      alert('Tạo thất bại. Hãy kiểm tra lại Backend nhé!');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-center">
      <div className="upload-card create-course-wrapper">
        
        {/* HEADER */}
        <div className="create-course-header">
          <button onClick={() => navigate(-1)} className="btn-circle-back">
            <ArrowLeft size={18} color="#334155" />
          </button>
          <div>
            <h2 className="create-course-title">
              <BookOpen size={24} /> Tạo Khóa Học Mới
            </h2>
          </div>
        </div>
        
        {/* FORM */}
        <form onSubmit={handleSubmit} className="create-course-form">
          
          {/* CỘT TRÁI: Nhập text */}
          <div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label">Tên khóa học <span className="required-star">*</span></label>
              <input 
                type="text" 
                name="course_name" 
                required 
                placeholder="VD: Toán nâng cao lớp 1..." 
                value={formDataState.course_name} 
                onChange={handleChange} 
                className="form-control"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Môn học</label>
                <select name="subject" value={formDataState.subject} onChange={handleChange} className="form-control">
                  <option value="Toán học">Toán học</option>
                  <option value="Tiếng Việt">Tiếng Việt</option>
                  <option value="Tiếng Anh">Tiếng Anh</option>
                  <option value="Khoa học">Khoa học</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Khối Lớp</label>
                <select name="grade_class" value={formDataState.grade_class} onChange={handleChange} className="form-control">
                  {['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'].map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mô tả khóa học</label>
              <textarea 
                name="description" 
                rows="5" 
                placeholder="Nhập giới thiệu ngắn về khóa học này..." 
                value={formDataState.description} 
                onChange={handleChange} 
                className="form-control form-textarea"
              ></textarea>
            </div>
          </div>

          {/* CỘT PHẢI: Upload Ảnh */}
          <div>
            <label className="form-label">Ảnh bìa (Thumbnail)</label>
            <div className="dropzone-area custom-dropzone" onClick={() => document.getElementById('course-thumb').click()}>
              <input id="course-thumb" type="file" hidden accept="image/*" onChange={handleFileChange} />
              {preview ? (
                <img src={preview} className="preview-img dropzone-preview" alt="preview" />
              ) : (
                <div className="dropzone-placeholder">
                  <ImageIcon size={40} style={{ marginBottom: '10px', color: '#000' }} />
                  <p style={{ fontSize: '14px', margin: 0 }}>Kéo thả hoặc click chọn ảnh</p>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" onClick={() => navigate(-1)} className="btn-outline">
                Hủy
              </button>
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