import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Search, Plus, Upload } from "lucide-react";
import axios from "axios";
import "../../App.css";
import "./CourseDetail.css";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [openId, setOpenId] = useState(1);
  const [courseInfo, setCourseInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loadedCourseId, setLoadedCourseId] = useState(null);

  const sidebarGrades = [
    "Lớp 1",
    "Lớp 2",
    "Lớp 3",
    "Lớp 4",
    "Lớp 5",
    "Lớp 6",
    "Lớp 7",
    "Lớp 8",
    "Lớp 9",
    "Lớp 10",
    "Lớp 11",
    "Lớp 12",
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchCourse = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/courses/${courseId}`);
        if (!isMounted) {
          return;
        }

        const nextChapters = Array.isArray(response.data.chapters)
          ? response.data.chapters
          : [];

        setCourseInfo(response.data.info);
        setChapters(nextChapters);
        setOpenId(nextChapters[0]?.id ?? null);
      } catch (error) {
        console.error("Không thể tải chi tiết khóa học:", error);
        if (!isMounted) {
          return;
        }

        setCourseInfo({
          title: "Khóa học chưa có dữ liệu",
          teacher: "Admin",
          progress: 0,
          completedLessons: 0,
          totalLessons: 0,
        });
        setChapters([]);
        setOpenId(null);
      } finally {
        if (isMounted) {
          setLoadedCourseId(courseId);
        }
      }
    };

    fetchCourse();

    return () => {
      isMounted = false;
    };
  }, [courseId]);

  const handleAddChapter = () => {
    const chapterName = prompt("Nhập tên chương bạn muốn tạo:");
    if (chapterName) {
      navigate(`/upload/${courseId}?chapterName=${encodeURIComponent(chapterName)}`);
    }
  };

  if (loadedCourseId !== courseId || !courseInfo) {
    return <div className="container-center text-center mt-10">Đang tải chi tiết khóa học...</div>;
  }

  return (
    <div className="detail-container">
      <div className="detail-sidebar">
        <h2 className="detail-sidebar-title">Danh mục</h2>
        {sidebarGrades.map((grade) => (
          <div
            key={grade}
            onClick={() => navigate(`/courses?grade=${grade}`)}
            className="detail-sidebar-item"
          >
            {grade}
          </div>
        ))}
      </div>

      <div className="detail-content">
        <div className="course-info-card">
          <h1 className="course-info-title">{courseInfo.title}</h1>
          <p className="course-info-teacher" style={{ marginBottom: 0 }}>
            Giáo viên giảng dạy: <strong>{courseInfo.teacher || "Đang cập nhật"}</strong>
          </p>
        </div>

        <div className="toolbar-container">
          <div className="search-box">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tìm kiếm bài học..."
              className="search-input"
            />
          </div>

          <div className="toolbar-actions">
            <button className="btn-blue action-btn" onClick={handleAddChapter}>
              <Plus size={18} /> Thêm chương
            </button>
            <button
              className="btn-blue action-btn"
              onClick={() => navigate(`/upload/${courseId}`)}
            >
              <Upload size={18} /> Upload video
            </button>
          </div>
        </div>

        <div
          className="content-card"
          style={{ padding: 0, background: "transparent", boxShadow: "none" }}
        >
          {chapters.length === 0 ? (
            <div className="empty-chapters">
              Khóa học này chưa có bài học nào. Hãy upload video bài giảng nhé!
            </div>
          ) : (
            chapters.map((chapter) => (
              <div key={chapter.id} className="chapter-item">
                <div
                  className={`chapter-header ${openId === chapter.id ? "active" : ""}`}
                  onClick={() => setOpenId(openId === chapter.id ? null : chapter.id)}
                >
                  <div className="chapter-header-left">
                    <span className="chapter-title">{chapter.title}</span>
                    <button
                      className="btn-add-lesson"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(
                          `/upload/${courseId}?chapterName=${encodeURIComponent(chapter.title)}`,
                        );
                      }}
                    >
                      + Thêm bài
                    </button>
                  </div>
                  {openId === chapter.id ? (
                    <ChevronUp color="#64748b" />
                  ) : (
                    <ChevronDown color="#64748b" />
                  )}
                </div>

                {openId === chapter.id && (
                  <div className="lesson-list">
                    {chapter.lessons.map((lesson, index) => (
                      <div key={lesson.id || index} className="lesson-item">
                        <div className="lesson-info">
                          <div className="lesson-title" style={{ marginBottom: 0 }}>
                            {lesson.title}
                          </div>
                        </div>

                        <div>
                          <button
                            className="btn-blue btn-continue"
                            onClick={() => navigate(`/lesson/${lesson.id}`)}
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
