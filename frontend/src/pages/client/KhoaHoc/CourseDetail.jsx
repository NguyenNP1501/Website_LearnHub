// File: src/pages/client/CourseDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search } from 'lucide-react'; 
import axios from 'axios';
import '../../../App.css';
import '../../../assets/styles/CourseDetailLayout.css'; 

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [openId, setOpenId] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [progress, setProgress] = useState(0); 

  // Hàm bóc tách Token rút gọn dùng Optional Chaining
  const getClientToken = () => {
    try { return JSON.parse(sessionStorage.getItem("remake-2.auth"))?.token || null; } catch { return null; }
  };

  // ==================== 1. TẢI SIDEBAR KHỐI LỚP ====================
  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/client/grades');
        const data = response.data.success ? response.data.data : response.data;
        if (Array.isArray(data)) setGrades(data);
      } catch (err) { console.error("Lỗi khi lấy danh mục khối lớp cho client sidebar:", err); }
    })();
  }, []);

  // ==================== 2. TẢI CHI TIẾT KHÓA HỌC & BÀI HỌC ====================
  useEffect(() => {
    if (!courseId) return;
    (async () => {
      setIsLoading(true);
      try {
        const token = getClientToken();
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await axios.get(`http://localhost:3000/api/client/courses/${courseId}`, config);
        
        const rawCourseData = response.data.info || response.data.data || response.data;
        setCourseInfo(Array.isArray(rawCourseData) ? rawCourseData[0] : rawCourseData);
        setIsEnrolled(response.data.isEnrolled || false);
        setProgress(response.data.progress || 0);
        
        const chaptersData = response.data.chapters || [];
        setChapters(chaptersData);
        if (chaptersData.length > 0) setOpenId(chaptersData[0].chapter_id || chaptersData[0].id);
      } catch (error) {
        console.error("Lỗi API lấy chi tiết khóa học phía client:", error);
        setCourseInfo({ course_name: "Khóa học chưa sẵn sàng dữ liệu", teacher_name: "Đang cập nhật" });
        setChapters([]);
        setIsEnrolled(false);
        setProgress(0);
      } finally { setIsLoading(false); }
    })();
  }, [courseId]);

  // ==================== 3. XỬ LÝ ĐĂNG KÝ KHÓA HỌC ====================
  const handleEnroll = async () => {
    const token = getClientToken();
    if (!token) {
      alert("Vui lòng đăng nhập tài khoản trước khi đăng ký khóa học!");
      return navigate('/login');
    }

    try {
      const response = await axios.post(`http://localhost:3000/api/client/courses/${courseId}/enroll`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (response.data.success) {
        alert("Đăng ký tham gia khóa học thành công!");
        setIsEnrolled(true); 
        setProgress(0);
      } else alert(response.data.message || "Đăng ký khóa học thất bại.");
    } catch (error) {
      console.error("Lỗi xử lý đăng ký khóa học:", error);
      alert(error.response?.data?.message || "Hệ thống bận, vui lòng thử lại sau!");
    }
  };

  if (isLoading) return <div className="container-center text-center mt-10">Đang tải chi tiết khóa học...</div>;
  if (!courseInfo) return <div className="container-center text-center mt-10">Không tìm thấy thông tin dữ liệu khóa học này.</div>;

  // ==================== 4. LOGIC TÌM KIẾM BÀI HỌC CỤC BỘ ====================
  const filteredChapters = chapters.map(ch => ({
    ...ch,
    lessons: (ch.lessons || []).filter(ls => 
      String(ls?.lesson_name || ls?.title || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(ch => ch.lessons.length > 0 || searchQuery === '');

  return (
    <div className="detail-container">
      {/* CỘT TRÁI: SIDEBAR KHỐI LỚP */}
      <div className="detail-sidebar">
        <h2 className="detail-sidebar-title">Danh mục khối lớp</h2>
        {grades.map(grade => {
          const isCurrentGrade = courseInfo && (Number(grade.grade_id) === Number(courseInfo.grade_id));
          return (
            <div key={`grade-sidebar-${grade.grade_id}`} onClick={() => navigate(`/courses?grade_id=${grade.grade_id}`)} className={`detail-sidebar-item ${isCurrentGrade ? 'active' : ''}`}>
              {grade.grade_name}
            </div>
          );
        })}
      </div>

      {/* CỘT PHẢI: NỘI DUNG CHI TIẾT KHÓA HỌC */}
      <div className="detail-content">
        <div className="course-info-card">
          <h1 className="course-info-title">{courseInfo.course_name || courseInfo.title}</h1>
          <p className="course-info-teacher" style={{ marginBottom: 0 }}>
            Giáo viên giảng dạy: <strong>{courseInfo.teacher_name || courseInfo.teacher || 'Đang cập nhật'}</strong>
          </p>
          {courseInfo.description && (
            <p className="course-description" style={{ marginTop: '12px', color: '#475569', fontSize: '14px', lineHeight: '1.6' }}>{courseInfo.description}</p>
          )}

          {/* HIỂN THỊ THANH TIẾN ĐỘ */}
          {isEnrolled && (
            <div className="progress-wrapper">
              <div className="progress-header">
                <span className="progress-text">Tiến độ khóa học</span>
                <span className="progress-percent">{progress}%</span>
              </div>
              <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
            </div>
          )}

          {/* NÚT ĐĂNG KÝ HOẶC ĐÃ ĐĂNG KÝ */}
          <div style={{ marginTop: '20px' }}>
            {isEnrolled ? (
              <button className="btn-green" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', cursor: 'default', background: '#10b981', color: '#fff', border: 'none' }} disabled>
                ✓ Bạn đã đăng ký khóa học này
              </button>
            ) : (
              <button onClick={handleEnroll} className="btn-blue" style={{ padding: '10px 24px', fontWeight: '600', borderRadius: '8px', fontSize: '15px' }}>
                Đăng ký khóa học ngay
              </button>
            )}
          </div>
        </div>

        {/* THANH CÔNG CỤ TÌM KIẾM */}
        <div className="toolbar-container">
          <div className="search-box" style={{ width: '100%', maxWidth: '400px' }}>
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Tìm kiếm nhanh bài học..." className="search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </div>

        {/* DANH SÁCH CHƯƠNG VÀ BÀI HỌC */}
        <div className="content-card" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
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
                  <div className={`chapter-header ${openId === currentChapterId ? 'active' : ''}`} onClick={() => setOpenId(openId === currentChapterId ? null : currentChapterId)} style={{ cursor: 'pointer' }}>
                    <div className="chapter-header-left"><span className="chapter-title">{currentChapterTitle}</span></div>
                    {openId === currentChapterId ? <ChevronUp color="#64748b" /> : <ChevronDown color="#64748b" />}
                  </div>

                  {/* DANH SÁCH BÀI HỌC TRONG CHƯƠNG */}
                  {openId === currentChapterId && (
                    <div className="lesson-list">
                      {ch.lessons && ch.lessons.map((ls, idx) => {
                        const currentLessonId = ls.lesson_id || ls.id;
                        const currentLessonTitle = ls.lesson_name || ls.title || 'Bài học chưa đặt tên';

                        return (
                          <div key={`lesson-item-${currentLessonId || idx}`} className="lesson-item" style={{ cursor: 'pointer', opacity: isEnrolled ? 1 : 0.6 }} onClick={() => isEnrolled ? navigate(`/lesson/${currentLessonId}`) : alert("Bạn cần đăng ký khóa học này để mở khóa nội dung bài học!")}>
                            <div className="lesson-info" style={{ display: 'flex', gap: '15px', alignItems: 'center', flex: 1 }}>
                              <img
                                src={ls.thumbnail || ls.img_url || 'https://placehold.co/160x90/e2e8f0/64748b?text=Bai+Hoc'}
                                alt={currentLessonTitle}
                                className="lesson-thumbnail-img"
                                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://placehold.co/160x90/e2e8f0/64748b?text=LearnHub"; }}
                              />
                              <div className="lesson-title" style={{ marginBottom: 0, fontWeight: '500', fontSize: '15px' }}>{currentLessonTitle}</div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <button className={isEnrolled ? "btn-blue" : "btn-disabled"} style={{ padding: '6px 16px', fontSize: '13px', borderRadius: '6px', pointerEvents: 'none', backgroundColor: isEnrolled ? '' : '#e2e8f0', color: isEnrolled ? '' : '#94a3b8', border: isEnrolled ? '' : 'none' }}>
                                {isEnrolled ? 'Vào học' : 'Bị khóa'}
                              </button>
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
