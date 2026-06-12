// File: src/pages/client/CourseDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import axios from 'axios';
import '../../../App.css';
import '../../../assets/styles/CourseDetailLayout.css';
import { getStoredToken } from "../../../utils/authStorage";
import SidebarGrade from '../../../components/SidebarGrade/SidebarGrade';

const API_BASE = 'http://localhost:3000/api';

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [openId, setOpenId] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  const { register, watch } = useForm({
    defaultValues: { searchQuery: '' }
  });

  const searchQuery = watch('searchQuery');

  const token = getStoredToken();
  const authConfig = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  // ==================== 1. TẢI SIDEBAR KHỐI LỚP ====================
  useEffect(() => {
    let isMounted = true;
    const fetchGrades = async () => {
      try {
        const response = await axios.get(`${API_BASE}/client/grades`);
        if (!isMounted) return;
        const data = response.data?.success ? response.data.data : response.data;
        if (Array.isArray(data)) setGrades(data);
      } catch { }
    };
    fetchGrades();
    return () => { isMounted = false; };
  }, []);

  // ==================== 2. TẢI CHI TIẾT KHÓA HỌC & BÀI HỌC ====================
  useEffect(() => {
    if (!courseId) return;
    let isCurrentRequest = true;

    const fetchCourseDetail = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${API_BASE}/client/courses/${courseId}`, authConfig);
        if (!isCurrentRequest) return;

        const rawCourseData = response.data?.info || response.data?.data || response.data;
        setCourseInfo(Array.isArray(rawCourseData) ? rawCourseData[0] : rawCourseData);
        setIsEnrolled(response.data?.isEnrolled || false);
        setProgress(response.data?.progress || 0);

        const chaptersData = response.data?.chapters || [];
        setChapters(chaptersData);
        if (chaptersData.length > 0) {
          setOpenId(chaptersData[0].chapter_id || chaptersData[0].id);
        }
      } catch {
        if (!isCurrentRequest) return;
        setCourseInfo({ course_name: "Khóa học chưa sẵn sàng dữ liệu", teacher_name: "Đang cập nhật" });
        setChapters([]);
        setIsEnrolled(false);
        setProgress(0);
      } finally {
        if (isCurrentRequest) setIsLoading(false);
      }
    };

    fetchCourseDetail();
    return () => { isCurrentRequest = false; };
  }, [courseId]);

  // ==================== 3. XỬ LÝ ĐĂNG KÝ KHÓA HỌC ====================
  const handleEnroll = async () => {
    if (!token) {
      alert("Vui lòng đăng nhập tài khoản trước khi đăng ký khóa học!");
      return navigate('/login');
    }
    try {
      const response = await axios.post(
        `${API_BASE}/client/courses/${courseId}/enroll`, {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data?.success) {
        alert("Đăng ký tham gia khóa học thành công!");
        setIsEnrolled(true);
        setProgress(0);
      } else {
        alert(response.data?.message || "Đăng ký khóa học thất bại.");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Hệ thống bận, vui lòng thử lại sau!");
    }
  };

  if (isLoading) return <div className="container-center text-center mt-10">Đang tải chi tiết khóa học...</div>;
  if (!courseInfo) return <div className="container-center text-center mt-10">Không tìm thấy thông tin dữ liệu khóa học này.</div>;

  // ==================== 4. LOGIC TÌM KIẾM BÀI HỌC ====================
  const filteredChapters = chapters.map(ch => ({
    ...ch,
    lessons: (ch.lessons || []).filter(ls =>
      String(ls?.lesson_name || ls?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(ch => ch.lessons.length > 0 || searchQuery === '');

  return (
    <div className="detail-container">
      
      {/* 2. SideBar*/}
      <SidebarGrade 
        grades={grades}
        activeGradeId={courseInfo?.grade_id} 
        isAdmin={false}                    
        onGradeClick={(gradeId) => navigate(`/courses?grade_id=${gradeId}`)}
      />

      <div className="detail-content">
        <div className="course-info-card">
          <h1 className="course-info-title">{courseInfo.course_name || courseInfo.title}</h1>
          <p className="course-info-teacher">
            Giáo viên giảng dạy: <strong>{courseInfo.teacher_name || courseInfo.teacher || 'Đang cập nhật'}</strong>
          </p>
          {courseInfo.description && (
            <p className="course-description">{courseInfo.description}</p>
          )}

          {isEnrolled && (
            <div className="progress-wrapper">
              <div className="progress-header">
                <span className="progress-text">Tiến độ khóa học</span>
                <span className="progress-percent">{progress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

          <div className="course-enroll-btn-wrapper">
            {isEnrolled ? (
              <button className="btn-enrolled" disabled>
                ✓ Bạn đã đăng ký khóa học này
              </button>
            ) : (
              <button onClick={handleEnroll} className="btn-blue btn-enroll">
                Đăng ký khóa học ngay
              </button>
            )}
          </div>
        </div>

        <div className="toolbar-container">
          <div className="search-box search-box-full">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tìm kiếm nhanh bài học..."
              className="search-input"
              {...register('searchQuery')}
            />
          </div>
        </div>

        <div className="content-card content-card-transparent">
          {filteredChapters.length === 0 ? (
            <div className="empty-chapters">
              {searchQuery ? 'Không tìm thấy bài học phù hợp với từ khóa!' : 'Khóa học này hiện tại chưa có bài học nào đang được cập nhật.'}
            </div>
          ) : (
            filteredChapters.map(ch => {
              const currentChapterId = ch.chapter_id || ch.id;
              const currentChapterTitle = ch.chapter_name || ch.title;

              return (
                <div key={`chapter-group-${currentChapterId}`} className="chapter-item">
                  <div
                    className={`chapter-header chapter-header-clickable ${openId === currentChapterId ? 'active' : ''}`}
                    onClick={() => setOpenId(openId === currentChapterId ? null : currentChapterId)}
                  >
                    <div className="chapter-header-left">
                      <span className="chapter-title">{currentChapterTitle}</span>
                    </div>
                    {openId === currentChapterId ? <ChevronUp color="#64748b" /> : <ChevronDown color="#64748b" />}
                  </div>

                  {openId === currentChapterId && (
                    <div className="lesson-list">
                      {ch.lessons && ch.lessons.map((ls, idx) => {
                        const currentLessonId = ls.lesson_id || ls.id;
                        const currentLessonTitle = ls.lesson_name || ls.title || 'Bài học chưa đặt tên';

                        return (
                          <div
                            key={`lesson-item-${currentLessonId || idx}`}
                            className={`lesson-item ${isEnrolled ? 'lesson-item-enrolled' : 'lesson-item-locked'}`}
                            onClick={() => isEnrolled ? navigate(`/lesson/${currentLessonId}`) : alert("Bạn cần đăng ký khóa học này để mở khóa nội dung bài học!")}
                          >
                            <div className="lesson-info lesson-info-row">
                              <img
                                src={ls.thumbnail || ls.img_url || 'https://placehold.co/160x90/e2e8f0/64748b?text=Bai+Hoc'}
                                alt={currentLessonTitle}
                                className="lesson-thumbnail-img"
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = "https://placehold.co/160x90/e2e8f0/64748b?text=LearnHub";
                                }}
                              />
                              <div className="lesson-title lesson-title-text">
                                {currentLessonTitle}
                              </div>
                            </div>

                            <div className="lesson-action-wrapper">
                              {isEnrolled ? (
                                <button className="btn-blue btn-lesson-view" style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', pointerEvents: 'none' }}>
                                  Vào học
                                </button>
                              ) : (
                                <button className="btn-lesson-locked">
                                  Bị khóa
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}