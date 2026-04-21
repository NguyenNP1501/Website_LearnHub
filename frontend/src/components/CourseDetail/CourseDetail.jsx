import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, Plus, Upload } from 'lucide-react';
import axios from 'axios';
import '../../App.css';
import './CourseDetail.css'; 

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const handleAddChapter = () => {
    const chapterName = prompt("Nhập tên chương bạn muốn tạo (VD: Chương 2: Phép nhân):");
    if (chapterName) {
      navigate(`/upload/${courseId}?chapterName=${encodeURIComponent(chapterName)}`);
    }
  };

  const [openId, setOpenId] = useState(1);
  const [courseInfo, setCourseInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const sidebarGrades = ['Lớp 1', 'Lớp 2', 'Lớp 3', 'Lớp 4', 'Lớp 5', 'Lớp 6','Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];

  useEffect(() => {
    setIsLoading(true);
    axios.get(`http://localhost:3000/api/courses/${courseId}`)
      .then(response => {
        setCourseInfo(response.data.info);
        setChapters(response.data.chapters);
        if (response.data.chapters.length > 0) {
          setOpenId(response.data.chapters[0].id);
        }
        setIsLoading(false);
      })
      .catch(error => {
        setCourseInfo({ title: "Khóa học chưa có dữ liệu", teacher: "Admin", progress: 0, completedLessons: 0, totalLessons: 0 });
        setChapters([]);
        setIsLoading(false);
      });
  }, [courseId]);

  if (isLoading || !courseInfo) return <div className="container-center text-center mt-10">Đang tải chi tiết khóa học...</div>;

  return (
    <div className="detail-container">

      {/* CỘT TRÁI: SIDEBAR */}
      <div className="detail-sidebar">
        <h2 className="detail-sidebar-title">Danh mục</h2>
        {sidebarGrades.map(grade => (
          <div 
            key={grade} 
            onClick={() => navigate(`/courses?grade=${grade}`)}
            className="detail-sidebar-item"
          >
            {grade}
          </div>
        ))}
      </div>

      {/* CỘT PHẢI: NỘI DUNG */}
      <div className="detail-content">
        
        {/* THÔNG TIN KHÓA HỌC */}
        <div className="course-info-card">
          <h1 className="course-info-title">{courseInfo.title}</h1>
          
          <p className="course-info-teacher" style={{ marginBottom: 0 }}>
            Giáo viên giảng dạy: <strong>{courseInfo.teacher || 'Đang cập nhật'}</strong>
          </p>

        </div>

        {/* THANH CÔNG CỤ TÌM KIẾM & THÊM */}
        <div className="toolbar-container">
          <div className="search-box">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Tìm kiếm bài học..." className="search-input" />
          </div>
          <div className="toolbar-actions">
            <button className="btn-blue action-btn" onClick={handleAddChapter}>
              <Plus size={18} /> Thêm chương
            </button>
            <button className="btn-blue action-btn" onClick={() => navigate(`/upload/${courseId}`)}>
              <Upload size={18} /> Upload video
            </button>
          </div>
        </div>

        {/* DANH SÁCH CHƯƠNG VÀ BÀI HỌC */}
        <div className="content-card" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
          {chapters.length === 0 ? (
            <div className="empty-chapters">
              Khóa học này chưa có bài học nào. Hãy upload video bài giảng nhé!
            </div>
          ) : (
            chapters.map(ch => (
              <div key={ch.id} className="chapter-item">
                
                {/* HEADER CỦA CHƯƠNG */}
                <div 
                  className={`chapter-header ${openId === ch.id ? 'active' : ''}`}
                  onClick={() => setOpenId(openId === ch.id ? null : ch.id)} 
                >
                  <div className="chapter-header-left">
                    <span className="chapter-title">{ch.title}</span>
                    <button 
                      className="btn-add-lesson"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        navigate(`/upload/${courseId}?chapterName=${encodeURIComponent(ch.title)}`);
                      }}
                    >
                      + Thêm bài
                    </button>
                  </div>
                  {openId === ch.id ? <ChevronUp color="#64748b" /> : <ChevronDown color="#64748b" />}
                </div>

                {/* DANH SÁCH BÀI HỌC BÊN TRONG CHƯƠNG */}
                {openId === ch.id && (
                  <div className="lesson-list">
                    {ch.lessons.map((ls, idx) => (
                      <div key={idx} className="lesson-item">
                        
                        {/* === PHẦN ĐÃ SỬA: BỔ SUNG ẢNH BÀI HỌC === */}
                        <div className="lesson-info" style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <img 
                            src={ls.thumbnail ? `http://localhost:3000${ls.thumbnail}` : 'https://placehold.co/160x90/e2e8f0/64748b?text=Chua+co+anh'} 
                            alt={ls.title}
                            className="lesson-thumbnail-img"
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = "https://placehold.co/160x90/e2e8f0/64748b?text=Loi+Anh";
                            }}
                          />
                          <div className="lesson-title" style={{ marginBottom: 0, fontWeight: '500', fontSize: '15px' }}>
                            {ls.title}
                          </div>
                        </div>
                        {/* ======================================= */}

                        <div>
                          <button
                            className="btn-blue btn-continue"
                            onClick={() => navigate(`/lesson/${ls.id}`)}
                          >
                            Tiếp tục học
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}