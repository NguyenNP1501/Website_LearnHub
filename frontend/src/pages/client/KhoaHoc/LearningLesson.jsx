// File: src/pages/client/LearningLesson.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

import '../../../App.css';
import '../../../assets/styles/LearningLesson.css'; 

export default function LearningLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const lastSavedTime = useRef(0);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const maxSavedTimeRef = useRef(0); // Phòng thủ tiến độ lớn nhất từ DB

  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  // 1. UTILS: LẤY TOKEN AUTH
  const getAuthToken = () => {
    try {
      return JSON.parse(sessionStorage.getItem("remake-2.auth"))?.token || null;
    } catch { return null; }
  };

  const prevLessonTarget = lesson?.prev_lesson_id || lesson?.prev_id || lesson?.previous_lesson_id;
  const nextLessonTarget = lesson?.next_lesson_id || lesson?.next_id || lesson?.next_lesson_id;

  // 2. API: TẢI CHI TIẾT BÀI GIẢNG VÀ KHỞI TẠO REFS
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return navigate('/login');
    
    setIsLoading(true);
    setIsSwitching(false); 
    
    axios.get(`http://localhost:3000/api/client/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const data = res.data.data || res.data;
        setLesson(data);
        maxSavedTimeRef.current = data?.watch_time || data?.last_watch_time || data?.progress_time || 0; 
      })
      .catch(err => console.error("❌ Lỗi tải chi tiết bài giảng:", err))
      .finally(() => setIsLoading(false));
  }, [lessonId, navigate]);

  // Reset sạch các Ref thời gian khi nhảy bài mới tránh chạy đè luồng cũ
  useEffect(() => {
    currentTimeRef.current = 0;
    durationRef.current = 0;
    lastSavedTime.current = 0;
    maxSavedTimeRef.current = 0;
  }, [lessonId]);

  // Tự động pause video nếu học viên chuyển sang tab khác (Chống học giả dụng)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
        console.log("⏸️ Tự động dừng phát video do tab trình duyệt không còn Active.");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // 3. CORE LOGIC: HÀM ĐỒNG BỘ TIẾN ĐỘ LÊN SERVER
  const saveProgress = async (currentTime, duration, isForce = false) => {
    if (!duration || document.hidden) return;
    if (maxSavedTimeRef.current >= duration - 5 && currentTime < duration - 5) return;
    if (currentTime < maxSavedTimeRef.current && !isForce) return;
    if (!isForce && Math.abs(currentTime - lastSavedTime.current) < 15) return;
    
    const token = getAuthToken();
    if (!token) return;

    try {
      const timeToSave = Math.max(currentTime, maxSavedTimeRef.current);
      console.log(`[Đồng bộ] Lưu mốc: ${Math.floor(timeToSave)}s / ${Math.floor(duration)}s`);
      
      await axios.post(`http://localhost:3000/api/client/lessons/${lessonId}/progress`, {
        watch_time: Math.floor(timeToSave),
        duration: Math.floor(duration)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      lastSavedTime.current = currentTime;
      if (timeToSave > maxSavedTimeRef.current) maxSavedTimeRef.current = timeToSave;
    } catch (err) {
      console.error("Lỗi tự động đồng bộ tiến độ video:", err);
    }
  };

  // 4. HANDLERS ĐIỀU HƯỚNG VÀ VIDEO EVENTS
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const duration = videoRef.current.duration;
    const savedTime = maxSavedTimeRef.current;
    durationRef.current = duration; 

    if (savedTime > 0) {
      if (savedTime >= duration - 5) {
        videoRef.current.currentTime = 0;
        lastSavedTime.current = currentTimeRef.current = 0;
        console.log("🔄 Bài học đã hoàn thành. Trình phát reset về 0s để xem lại (Tiến độ gốc giữ nguyên).");
      } else {
        videoRef.current.currentTime = lastSavedTime.current = currentTimeRef.current = savedTime;
        console.log(`▶️ Tiếp tục xem bài học từ mốc dở dang: ${savedTime}s`);
      }
    }
  };

  const handleLessonNavigation = async (targetIdInput) => {
    if (!targetIdInput) return;
    const finalLessonId = typeof targetIdInput === 'object' ? (targetIdInput.lesson_id || targetIdInput.id || targetIdInput._id) : targetIdInput;

    if (!finalLessonId || String(finalLessonId) === 'undefined' || String(finalLessonId).includes('[object Object]')) return;

    if (videoRef.current && videoRef.current.duration > 0) {
      try { await saveProgress(videoRef.current.currentTime, videoRef.current.duration, true); } catch (e) {}
    }
    navigate(`/lesson/${finalLessonId}`); 
  };

  const handleVideoEnded = async () => {
    if (videoRef.current) {
      try { await saveProgress(videoRef.current.duration, videoRef.current.duration, true); } catch (e) {}
    }
    if (nextLessonTarget) {
      setIsSwitching(true);
      setTimeout(() => handleLessonNavigation(nextLessonTarget), 2000);
    }
  };

  const updateRefsAndSave = (video, isForce) => {
    currentTimeRef.current = video.currentTime; 
    durationRef.current = video.duration;
    saveProgress(video.currentTime, video.duration, isForce);
  };

  const handleBackClick = async () => {
    if (videoRef.current && videoRef.current.duration > 0) {
      const { currentTime, duration } = videoRef.current;
      if (!(maxSavedTimeRef.current >= duration - 5 && currentTime < duration - 5)) {
        try {
          await axios.post(`http://localhost:3000/api/client/lessons/${lessonId}/progress`, {
            watch_time: Math.floor(Math.max(currentTime, maxSavedTimeRef.current)),
            duration: Math.floor(duration)
          }, { headers: { Authorization: `Bearer ${getAuthToken()}` } });
        } catch (err) {}
      }
    }
    navigate(-1); 
  };

  // CLEANUP KHẨN CẤP KHI ĐỔI TRANG HOẶC TẮT TAB ĐỘT NGỘT
  useEffect(() => {
    return () => {
      const currentVideoTime = currentTimeRef.current;
      const totalVideoDuration = durationRef.current;
      const token = getAuthToken();
      
      if (maxSavedTimeRef.current >= totalVideoDuration - 5 && currentVideoTime < totalVideoDuration - 5) return;

      if (token && totalVideoDuration > 0 && Math.floor(currentVideoTime) !== Math.floor(lastSavedTime.current)) {
        axios.post(`http://localhost:3000/api/client/lessons/${lessonId}/progress`, {
          watch_time: Math.floor(Math.max(currentVideoTime, maxSavedTimeRef.current)),
          duration: Math.floor(totalVideoDuration)
        }, { headers: { Authorization: `Bearer ${token}` } })
        .catch(err => console.error("Lỗi lưu tiến độ khi unmount:", err));
      }
    };
  }, [lessonId]);

  if (isLoading) return <div className="container-center text-center mt-10">Đang tải bài giảng...</div>;
  if (!lesson) return <div className="container-center text-center mt-10">Không tìm thấy bài giảng!</div>;

  return (
    <div className="learning-container">
      <div className="learning-header">
        <button onClick={handleBackClick} className="btn-back-circle" type="button">
          <ArrowLeft size={20} color="#334155" />
        </button>
        <div>
          <h1 className="learning-title">{lesson.title || lesson.lesson_name}</h1>
          <p className="learning-chapter">{lesson.chapter || lesson.chapter_name || 'Mặc định'}</p>
        </div>
      </div>

      <div className="video-wrapper" style={{ position: 'relative' }}>
        {lesson.video_url ? (
          <video
            ref={videoRef}
            controls
            autoPlay
            className="video-player"
            src={lesson.video_url}
            onTimeUpdate={(e) => updateRefsAndSave(e.target, false)} 
            onPause={(e) => updateRefsAndSave(e.target, true)} 
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnded}
          >
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        ) : (
          <div className="video-fallback">Bài giảng này hiện chưa có video nội dung.</div>
        )}

        {isSwitching && (
          <div className="video-switching-overlay" style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', color: '#fff', zIndex: 10
          }}>
            <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>🎉 Chúc mừng bạn đã hoàn thành bài học!</p>
            <p style={{ color: '#cbd5e1' }}>Đang tự động chuyển sang bài tiếp theo...</p>
          </div>
        )}
      </div>

      <div className="lesson-navigation-bar" style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginTop: '15px', padding: '10px 0', borderBottom: '1px solid #e2e8f0'
      }}>
        <button 
          className="btn-nav-lesson"
          type="button"
          disabled={!prevLessonTarget}
          onClick={() => handleLessonNavigation(prevLessonTarget)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px',
            borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff',
            cursor: prevLessonTarget ? 'pointer' : 'not-allowed', opacity: prevLessonTarget ? 1 : 0.5
          }}
        >
          <ChevronLeft size={18} /> Bài trước
        </button>

        <button 
          className="btn-nav-lesson btn-primary"
          type="button"
          disabled={!nextLessonTarget}
          onClick={() => handleLessonNavigation(nextLessonTarget)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 16px',
            borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff',
            cursor: nextLessonTarget ? 'pointer' : 'not-allowed', opacity: nextLessonTarget ? 1 : 0.5,
            fontWeight: '500'
          }}
        >
          Bài tiếp theo <ChevronRight size={18} />
        </button>
      </div>

      <div className="content-wrapper" style={{ marginTop: '20px' }}>
        <h3 className="content-heading">Nội dung chi tiết bài học</h3>
        <div
          className="rich-text-content"
          dangerouslySetInnerHTML={{ __html: lesson.content || "Chưa có nội dung chữ cho bài học này." }}
        />
      </div>
    </div>
  );
}
