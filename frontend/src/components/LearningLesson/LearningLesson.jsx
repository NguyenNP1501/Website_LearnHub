import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';
import '../../App.css';
import './LearningLesson.css';

export default function LearningLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy thông tin bài giảng
    axios.get(`http://localhost:3000/api/lessons/${lessonId}`)
      .then(response => {
        setLesson(response.data);
        setIsLoading(false);
      })
      .catch(error => {
        console.log("Lỗi:", error);
        setIsLoading(false);
      });
  }, [lessonId]);

  if (isLoading) return <div className="container-center text-center mt-10">Đang tải bài giảng...</div>;
  if (!lesson) return <div className="container-center text-center mt-10">Không tìm thấy bài giảng này!</div>;

  return (
    <div className="learning-container">
      
      {/* Nút quay lại và Tiêu đề */}
      <div className="learning-header">
        <button onClick={() => navigate(-1)} className="btn-back-circle">
          <ArrowLeft size={20} color="#334155" />
        </button>
        <div>
          <h1 className="learning-title">{lesson.title}</h1>
          <p className="learning-chapter">Chương: {lesson.chapter}</p>
        </div>
      </div>

      {/* Trình phát Video */}
      <div className="video-wrapper">
        {lesson.video_url ? (
          <video 
            controls 
            autoPlay 
            className="video-player"
            src={`http://localhost:3000${lesson.video_url}`}
          >
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        ) : (
          <div className="video-fallback">
            Bài giảng này chưa có video.
          </div>
        )}
      </div>

      {/* Nội dung / Mô tả bài học */}
      <div className="content-wrapper">
        <h3 className="content-heading">
          Nội dung bài học
        </h3>
        
        {/* Phần hiển thị nội dung Rich Text (Quill) */}
        <div 
          className="rich-text-content" 
          dangerouslySetInnerHTML={{ __html: lesson.content || "Chưa có mô tả cho bài học này." }}
        />
      </div>

    </div>
  );
}