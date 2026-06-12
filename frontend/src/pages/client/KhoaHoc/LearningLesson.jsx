import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import '../../../App.css';
import '../../../assets/styles/LearningLesson.css';
import { getStoredToken, clearStoredSession } from "../../../utils/authStorage";

const API_BASE = 'http://localhost:3000/api';

export default function LearningLesson() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const lastSavedTime = useRef(0);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const maxSavedTimeRef = useRef(0);
  const hasSeekedRef = useRef(false);

  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  const { } = useForm();

  const token = getStoredToken();
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  const prevLessonTarget = lesson?.prev_lesson_id || lesson?.prev_id || lesson?.previous_lesson_id;
  const nextLessonTarget = lesson?.next_lesson_id || lesson?.next_id || lesson?.next_lesson_id;

  // ==================== 1. KIỂM TRA PHIÊN ĐĂNG NHẬP ====================
  useEffect(() => {
    if (!token) {
      clearStoredSession();
      navigate('/login');
    }
  }, [token, navigate]);

  // ==================== 2. TẢI CHI TIẾT BÀI GIẢNG ====================
  useEffect(() => {
    if (!token) return;
    let isCurrentRequest = true;
    setIsLoading(true);
    setIsSwitching(false);

    axios.get(`${API_BASE}/client/lessons/${lessonId}`, authConfig)
      .then(res => {
        if (!isCurrentRequest) return;
        const data = res.data?.data || res.data;
        setLesson(data);
        maxSavedTimeRef.current = data?.watch_time || data?.last_watch_time || data?.progress_time || 0;
      })
      .catch(() => { })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => { isCurrentRequest = false; };
  }, [lessonId, navigate]);

  // Reset Ref khi chuyển bài
  useEffect(() => {
    currentTimeRef.current = 0;
    durationRef.current = 0;
    lastSavedTime.current = 0;
    maxSavedTimeRef.current = 0;
    hasSeekedRef.current = false;
  }, [lessonId]);

  // Tự động pause khi đổi tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ==================== 3. ĐỒNG BỘ TIẾN ĐỘ ====================
  const saveProgress = async (currentTime, duration, isForce = false) => {
    if (!duration || document.hidden) return;
    if (maxSavedTimeRef.current >= duration - 5 && currentTime < duration - 5) return;
    if (currentTime < maxSavedTimeRef.current && !isForce) return;
    if (!isForce && Math.abs(currentTime - lastSavedTime.current) < 15) return;

    if (!token) return;

    try {
      const timeToSave = Math.max(currentTime, maxSavedTimeRef.current);
      await axios.post(`${API_BASE}/client/lessons/${lessonId}/progress`, {
        watch_time: Math.floor(timeToSave),
        duration: Math.floor(duration)
      }, authConfig);

      lastSavedTime.current = currentTime;
      if (timeToSave > maxSavedTimeRef.current) maxSavedTimeRef.current = timeToSave;
    } catch { }
  };

  // ==================== 4. XỬ LÝ SỰ KIỆN VIDEO ====================
  const handleCanPlay = () => {
    if (!videoRef.current || hasSeekedRef.current) return;
    
    const duration = videoRef.current.duration;
    const savedTime = maxSavedTimeRef.current;
    durationRef.current = duration;
    hasSeekedRef.current = true;
    if (savedTime > 0) {
      if (savedTime >= duration - 5) {
        videoRef.current.currentTime = 0;
        lastSavedTime.current = currentTimeRef.current = 0;
      } else {
        videoRef.current.currentTime = savedTime;
        lastSavedTime.current = currentTimeRef.current = savedTime;
      }
    }
  };

  const handleLessonNavigation = async (targetIdInput) => {
    if (!targetIdInput) return;
    const finalLessonId = typeof targetIdInput === 'object'
      ? (targetIdInput.lesson_id || targetIdInput.id || targetIdInput._id)
      : targetIdInput;

    if (!finalLessonId || String(finalLessonId) === 'undefined' || String(finalLessonId).includes('[object Object]')) return;

    if (videoRef.current && videoRef.current.duration > 0) {
      try { await saveProgress(videoRef.current.currentTime, videoRef.current.duration, true); }
      catch { }
    }
    navigate(`/lesson/${finalLessonId}`);
  };

  const handleVideoEnded = async () => {
    if (videoRef.current) {
      try { await saveProgress(videoRef.current.duration, videoRef.current.duration, true); }
      catch { }
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
          await axios.post(`${API_BASE}/client/lessons/${lessonId}/progress`, {
            watch_time: Math.floor(Math.max(currentTime, maxSavedTimeRef.current)),
            duration: Math.floor(duration)
          }, authConfig);
        } catch { }
      }
    }
    navigate(-1);
  };

  // ==================== 5. CLEANUP KHI UNMOUNT ====================
  useEffect(() => {
    return () => {
      const currentVideoTime = currentTimeRef.current;
      const totalVideoDuration = durationRef.current;
      const cleanupToken = getStoredToken();

      if (maxSavedTimeRef.current >= totalVideoDuration - 5 && currentVideoTime < totalVideoDuration - 5) return;

      if (cleanupToken && totalVideoDuration > 0 && Math.floor(currentVideoTime) !== Math.floor(lastSavedTime.current)) {
        axios.post(`${API_BASE}/client/lessons/${lessonId}/progress`, {
          watch_time: Math.floor(Math.max(currentVideoTime, maxSavedTimeRef.current)),
          duration: Math.floor(totalVideoDuration)
        }, { headers: { Authorization: `Bearer ${cleanupToken}` } })
          .catch(() => { });
      }
    };
  }, [lessonId]);

  if (isLoading) return <div className="container-center text-center mt-10">Đang tải bài giảng...</div>;
  if (!lesson) return <div className="container-center text-center mt-10">Không tìm thấy bài giảng!</div>;

  return (
    <div className="learning-container">
      {/* THANH ĐIỀU HƯỚNG QUAY LẠI */}
      <div className="learning-header">
        <button onClick={handleBackClick} className="btn-back-circle" type="button">
          <ArrowLeft size={20} color="#334155" />
        </button>
        <div>
          <h1 className="learning-title">{lesson.title || lesson.lesson_name}</h1>
          <p className="learning-chapter">{lesson.chapter || lesson.chapter_name || 'Mặc định'}</p>
        </div>
      </div>

      {/* KHU VỰC TRÌNH PHÁT VIDEO */}
      <div className="video-wrapper">
       {lesson.video_url ? (
          <video
            key={lessonId}
            ref={videoRef}
            controls
            autoPlay
            className="video-player"
            src={lesson.video_url}
            onTimeUpdate={(e) => updateRefsAndSave(e.target, false)}
            onPause={(e) => updateRefsAndSave(e.target, true)}
            onCanPlay={handleCanPlay}
            onEnded={handleVideoEnded}
          >
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        ) : (
          <div className="video-fallback">Bài giảng này hiện chưa có video nội dung.</div>
        )}

        {/* OVERLAY TỰ ĐỘNG CHUYỂN BÀI */}
        {isSwitching && (
          <div className="video-switching-overlay">
            <p className="video-switching-overlay-title">🎉 Chúc mừng bạn đã hoàn thành bài học!</p>
            <p className="video-switching-overlay-subtitle">Đang tự động chuyển sang bài tiếp theo...</p>
          </div>
        )}
      </div>

      {/* THANH ĐIỀU HƯỚNG BÀI TRƯỚC / TIẾP THEO */}
      <div className="lesson-navigation-bar">
        <button
          className="btn-nav-lesson btn-nav-prev"
          type="button"
          disabled={!prevLessonTarget}
          onClick={() => handleLessonNavigation(prevLessonTarget)}
        >
          <ChevronLeft size={18} /> Bài trước
        </button>

        <button
          className="btn-nav-lesson btn-nav-next"
          type="button"
          disabled={!nextLessonTarget}
          onClick={() => handleLessonNavigation(nextLessonTarget)}
        >
          Bài tiếp theo <ChevronRight size={18} />
        </button>
      </div>

      {/* NỘI DUNG CHI TIẾT */}
      <div className="content-wrapper">
        <h3 className="content-heading">Nội dung chi tiết bài học</h3>
        <div
          className="rich-text-content"
          dangerouslySetInnerHTML={{ __html: lesson.content || "Chưa có nội dung chữ cho bài học này." }}
        />
      </div>
    </div>
  );
}