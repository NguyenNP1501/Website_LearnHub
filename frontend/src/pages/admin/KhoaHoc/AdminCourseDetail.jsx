import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ChevronDown, ChevronUp, Search, Plus, Upload, Edit3 } from 'lucide-react';
import axios from 'axios';
import '../../../App.css';
import '../../../assets/styles/CourseDetailLayout.css';
import { getStoredToken, getStoredSession, clearStoredSession } from "../../../utils/authStorage";
import SidebarGrade from '../../../components/SidebarGrade/SidebarGrade';

const API_BASE = 'http://localhost:3000/api';

export default function AdminCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [openId, setOpenId] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [grades, setGrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  const { register, watch } = useForm({
    defaultValues: { searchTerm: '' }
  });

  const searchTerm = watch('searchTerm');

  const token = getStoredToken();
  const currentUser = getStoredSession()?.user || null;
  const currentId = currentUser?.teacher_id ?? currentUser?.id ?? currentUser?.user_id ?? null;
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) {
      alert("Phiên làm việc hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!");
      clearStoredSession();
      navigate('/login');
    }
  }, [token, navigate]);

  const fetchGrades = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/admin/grades`, authConfig);
      const d = res.data.success ? res.data.data : res.data;
      if (Array.isArray(d)) setGrades(d);
    } catch { }
  }, [token]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const handleCreateGrade = async () => {
    const name = prompt("Nhập tên khối lớp mới muốn tạo (VD: Khối lớp 10):")?.trim();
    if (!name) return;
    try {
      if ((await axios.post(`${API_BASE}/admin/grades`, { grade_name: name }, authConfig)).data.success) {
        alert("Thêm khối lớp mới thành công!"); fetchGrades();
      }
    } catch (err) { alert(err.response?.data?.message || "Thêm khối lớp thất bại."); }
  };

  const handleUpdateGrade = async (e, g) => {
    const newName = prompt("Nhập tên mới cho khối lớp này:", g.grade_name)?.trim();
    if (!newName || newName === g.grade_name) return;
    try {
      if ((await axios.put(`${API_BASE}/admin/grades/${g.grade_id}`, { grade_name: newName }, authConfig)).data.success) {
        alert("Cập nhật tên khối lớp thành công!");
        setGrades(prev => prev.map(item => item.grade_id === g.grade_id ? { ...item, grade_name: newName } : item));
      }
    } catch (err) { alert(err.response?.data?.message || "Sửa khối lớp thất bại."); }
  };

  const fetchCourseDetails = useCallback(async () => {
    if (!token || !courseId) return;
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/client/courses/${courseId}`, authConfig);
      const raw = res.data.info || res.data.data || res.data;
      const info = Array.isArray(raw) ? raw[0] : raw;
      setCourseInfo(info);

      const fetchedChapters = res.data.chapters || [];
      console.log(fetchedChapters);
      setChapters(fetchedChapters);
      setCanEdit(!!(info && currentId && (info.teacher_id == currentId )));

      if (fetchedChapters.length > 0) {
        setOpenId(fetchedChapters[0].chapter_name || fetchedChapters[0].title || fetchedChapters[0].chapter_id || fetchedChapters[0].id);
      }
    } catch {
      setCourseInfo({ course_name: "Khóa học chưa có dữ liệu", teacher: "Đang cập nhật" });
      setChapters([]);
    } finally { setIsLoading(false); }
  }, [courseId, token, currentId, currentUser?.role]);

  useEffect(() => { fetchCourseDetails(); }, [fetchCourseDetails]);

  const handleDeleteLesson = async (e, lessonId) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này không?")) return;
    try {
      await axios.delete(`${API_BASE}/admin/lessons/${lessonId}`, authConfig);
      alert("Xóa bài học thành công!"); fetchCourseDetails();
    } catch (err) { alert(err.response?.data?.message || "Xóa bài học thất bại."); }
  };

  const handleEditChapter = async (e, currentTitle, lessonsInChapter) => {
    e.stopPropagation();
    if (!currentTitle) return alert("Không tìm thấy tên chương!");
    if (!lessonsInChapter?.length) return alert("Chương chưa có bài học để cập nhật!");

    const newName = prompt("Nhập tên chương mới:", currentTitle)?.trim();
    if (!newName || newName === currentTitle.trim()) return;

    try {
      setIsLoading(true);
      await Promise.all(lessonsInChapter.map(ls => axios.put(`${API_BASE}/admin/lessons/${ls.lesson_id || ls.id}`, {
        course_id: ls.course_id,
        title: ls.title || ls.lesson_name || "",
        chapter: newName,
        content: ls.content || "",
        thumbnail_url: ls.img_url || ls.thumbnail || null,
        video_url: ls.video_url || null,
        status: ls.status || "Active"
      }, authConfig)));

      setChapters(prev => prev.map(ch => ((ch.chapter_name || ch.title) === currentTitle) ? {
        ...ch, chapter_name: newName,
        lessons: ch.lessons.map(ls => ({ ...ls, chapter: newName, chapter_name: newName }))
      } : ch));

      setOpenId(newName); alert("Đổi tên chương thành công!");
    } catch (err) { alert(err.response?.data?.message || "Sửa tên chương thất bại!"); }
    finally { setIsLoading(false); }
  };

  const handleAddChapter = () => {
    const name = prompt("Nhập tên chương bạn muốn tạo (VD: Chương 2: Phép nhân):")?.trim();
    if (name) navigate(`/admin/upload/${courseId}?chapterName=${encodeURIComponent(name)}`);
  };

  if (isLoading || !courseInfo) return <div className="container-center text-center mt-10">Đang tải chi tiết khóa học...</div>;
  const sortedChapters = [...chapters].sort((a, b) => {
    const titleA = a.chapter_name || a.title || '';
    const titleB = b.chapter_name || b.title || '';
    return titleA.localeCompare(titleB, 'vi', { numeric: true });
  });
  return (
    <div className="detail-container">
      {/* SIDEBAR */}
      <SidebarGrade
        grades={grades}
        activeGradeId={courseInfo?.grade_id} // <--- Thêm dòng này để truyền ID khối lớp của khóa học hiện tại
        onAddGrade={handleCreateGrade}
        isAdmin={true}
        onEditGrade={handleUpdateGrade}
        onGradeClick={(gradeId) => navigate(`/admin/courses?grade=${gradeId}`)}
      />

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div className="detail-content">
        <div className="course-info-card">
          <h1 className="course-info-title">{courseInfo.course_name || courseInfo.title}</h1>
          <p className="course-info-teacher">
            Giáo viên giảng dạy: <strong>{courseInfo.teacher_name || courseInfo.teacher || 'Đang cập nhật'}</strong>
          </p>
          {!canEdit && (
            <p className="course-info-view-only">
              * Bạn chỉ có quyền xem (Khóa học này do giáo viên khác tạo).
            </p>
          )}
        </div>

        <div className="toolbar-container">
          <div className="search-box">
            <Search size={18} color="#94a3b8" />
            <input
              type="text"
              placeholder="Tìm kiếm bài học theo tiêu đề..."
              className="search-input"
              {...register('searchTerm')}
            />
          </div>
          {canEdit && (
            <div className="toolbar-actions">
              <button className="action-btn" onClick={handleAddChapter}><Plus size={18} /> Thêm chương</button>
              <button className="action-btn" onClick={() => navigate(`/admin/upload/${courseId}`)}><Upload size={18} /> Đăng bài giảng</button>
            </div>
          )}
        </div>

        <div className="content-card">
          {chapters.length === 0 ? (
            <div className="empty-chapters">
              Khóa học này chưa có bài học nào. {canEdit && 'Hãy bấm "Đăng bài giảng" hoặc "Thêm chương" để bắt đầu!'}
            </div>
          ) : sortedChapters.map((ch, idx) => {
            const chTitle = ch.chapter_name || ch.title || 'Chương không rõ tên';
            const chKey = ch.chapter_name || ch.title || ch.chapter_id || ch.id || idx;
            const currentLessons = ch.lessons || [];
            const filteredLessons = currentLessons.filter(ls =>
              (ls.lesson_name || ls.title || '').toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (searchTerm && filteredLessons.length === 0) return null;
            const isChapterOpen = searchTerm ? true : (openId === chKey);

            return (
              <div key={chKey} className="chapter-item">
                <div
                  className={`chapter-header ${isChapterOpen ? 'active' : ''}`}
                  onClick={() => !searchTerm && setOpenId(openId === chKey ? null : chKey)}
                >
                  <div className="chapter-header-left">
                    <span className="chapter-title">{chTitle}</span>
                    {canEdit && (
                      <div className="chapter-action-group" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-custom-edit-chapter" onClick={(e) => handleEditChapter(e, chTitle, currentLessons)}>
                          <Edit3 size={13} /> Sửa tên
                        </button>
                        <button className="btn-custom-add-lesson" onClick={() => navigate(`/admin/upload/${courseId}?chapterName=${encodeURIComponent(chTitle)}`)}>
                          <Plus size={13} /> Thêm bài
                        </button>
                      </div>
                    )}
                  </div>
                  {isChapterOpen ? <ChevronUp color="#64748b" /> : <ChevronDown color="#64748b" />}
                </div>

                {isChapterOpen && (
                  <div className="lesson-list">
                    {filteredLessons.length === 0 ? (
                      <div className="empty-chapter-msg">Chưa có bài học nào trong chương này</div>
                    ) : filteredLessons.map((ls, lIdx) => {
                      const lsId = ls.lesson_id || ls.id || lIdx;
                      const lsTitle = ls.lesson_name || ls.title;
                      return (
                        <div key={lsId} className="lesson-item">
                          <div className="lesson-left-content" onClick={() => navigate(`/lesson/${lsId}`)}>
                            <img
                              src={ls.img_url || ls.thumbnail || 'https://placehold.co/160x90/e2e8f0/64748b?text=Chua+co+anh'}
                              alt={lsTitle}
                              className="lesson-thumbnail-img"
                              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/160x90/e2e8f0/64748b?text=Loi+Anh"; }}
                            />
                            <div className="lesson-info"><p className="lesson-title">{lsTitle}</p></div>
                          </div>
                          <div className="lesson-actions">
                            <button className="btn-lesson-view" onClick={() => navigate(`/lesson/${lsId}`)}>Xem</button>
                            {canEdit && (
                              <>
                                <button className="btn-lesson-edit" onClick={() => navigate(`/admin/edit-lesson/${lsId}`)}>Sửa</button>
                                <button className="btn-lesson-delete" onClick={(e) => handleDeleteLesson(e, lsId)}>Xóa</button>
                                <button
                                  className="btn-lesson-exam"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/admin/create?lessonId=${lsId}`);
                                  }}
                                >
                                  Tạo đề
                                </button>

                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
