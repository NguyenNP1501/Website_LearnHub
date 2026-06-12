// src/pages/admin/AdminCourseDetail.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronUp, Search, Plus, Upload, Edit3 } from 'lucide-react';
import axios from 'axios';
import '../../../App.css';
import '../../../assets/styles/CourseDetailLayout.css';

export default function AdminCourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // 1. STATES DỮ LIỆU & UI
  const [openId, setOpenId] = useState(null);
  const [courseInfo, setCourseInfo] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [grades, setGrades] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  // 2. ĐỌC THÔNG TIN XÁC THỰC (LOCALSTORAGE)
  const { token, currentUser, currentId } = (() => {
    try {
      const auth = JSON.parse(sessionStorage.getItem("remake-2.auth"));
      const u = auth?.user || null;
      return { 
        token: auth?.token || null, 
        currentUser: u, 
        currentId: u ? (u.id || u.user_id || u.teacher_id) : null 
      };
    } catch { 
      return { token: null, currentUser: null, currentId: null }; 
    }
  })();

  // Kiểm tra phiên đăng nhập
  useEffect(() => {
    if (!token) {
      alert("Phiên làm việc hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại!");
      navigate('/login');
    }
  }, [token, navigate]);

  // 3. API: QUẢN LÝ DANH MỤC KHỐI LỚP (SIDEBAR)
  const fetchGrades = useCallback(() => {
    if (!token) return;
    axios.get('http://localhost:3000/api/admin/grades', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const d = res.data.success ? res.data.data : res.data;
        if (Array.isArray(d)) setGrades(d);
      })
      .catch(err => console.error("Lỗi lấy danh mục khối lớp:", err));
  }, [token]);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const handleCreateGrade = async () => {
    const name = prompt("Nhập tên khối lớp mới muốn tạo (VD: Khối lớp 10):");
    if (!name || !name.trim()) return;

    try {
      const res = await axios.post(
        'http://localhost:3000/api/admin/grades',
        { grade_name: name.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Thêm khối lớp mới thành công!");
        fetchGrades();
      }
    } catch (err) {
      console.error("Lỗi khi thêm khối lớp:", err);
      alert(err.response?.data?.message || "Thêm khối lớp thất bại.");
    }
  };

  const handleUpdateGrade = async (e, g) => {
    e.stopPropagation(); // Ngăn kích hoạt hành vi click thẻ cha chuyển hướng trang

    const currentName = g.grade_name;
    const newName = prompt("Nhập tên mới cho khối lớp này:", currentName);
    if (!newName || !newName.trim() || newName.trim() === currentName) return;

    try {
      const res = await axios.put(
        `http://localhost:3000/api/admin/grades/${g.grade_id}`,
        { grade_name: newName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("Cập nhật tên khối lớp thành công!");
        setGrades(prev =>
          prev.map(item => item.grade_id === g.grade_id ? { ...item, grade_name: newName.trim() } : item)
        );
      }
    } catch (err) {
      console.error("Lỗi khi sửa khối lớp:", err);
      alert(err.response?.data?.message || "Sửa khối lớp thất bại.");
    }
  };

  // 4. API: LẤY CHI TIẾT KHÓA HỌC & PHÂN QUYỀN TRUY CẬP
  const fetchCourseDetails = useCallback(() => {
    if (!token || !courseId) return;
    setIsLoading(true);
    axios.get(`http://localhost:3000/api/client/courses/${courseId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const raw = res.data.info || res.data.data || res.data;
        const info = Array.isArray(raw) ? raw[0] : raw;
        setCourseInfo(info);

        const fetchedChapters = res.data.chapters || [];
        setChapters(fetchedChapters);
        setCanEdit(!!(info && currentId && (info.teacher_id == currentId || currentUser?.role === 'admin')));

        if (fetchedChapters.length > 0) {
          const firstChapterKey = fetchedChapters[0].chapter_name || fetchedChapters[0].title || fetchedChapters[0].chapter_id || fetchedChapters[0].id;
          setOpenId(firstChapterKey);
        }
      })
      .catch(err => {
        console.error("Lỗi API lấy chi tiết khóa học:", err);
        setCourseInfo({ course_name: "Khóa học chưa có dữ liệu", teacher: "Đang cập nhật" });
        setChapters([]);
      })
      .finally(() => setIsLoading(false));
  }, [courseId, token, currentId, currentUser?.role]);

  useEffect(() => { fetchCourseDetails(); }, [fetchCourseDetails]);

  // 5. API: THAO TÁC QUẢN LÝ BÀI HỌC VÀ CHƯƠNG KHÓA HỌC
  const handleDeleteLesson = async (e, lessonId) => {
    e.stopPropagation();
    if (!window.confirm("Bạn có chắc chắn muốn xóa bài học này không?")) return;
    try {
      await axios.delete(`http://localhost:3000/api/admin/lessons/${lessonId}`, { headers: { Authorization: `Bearer ${token}` } });
      alert("Xóa bài học thành công!");
      fetchCourseDetails();
    } catch (err) {
      console.error("Lỗi khi xóa bài học:", err);
      alert(err.response?.data?.message || "Xóa bài học thất bại.");
    }
  };

  const handleEditChapter = async (e, currentTitle, lessonsInChapter) => {
    e.stopPropagation();
    if (!currentTitle) return alert("Không tìm thấy tên chương!");
    if (!lessonsInChapter || lessonsInChapter.length === 0) return alert("Chương chưa có bài học để cập nhật!");

    const newName = prompt("Nhập tên chương mới:", currentTitle);
    if (!newName || !newName.trim() || newName.trim() === currentTitle.trim()) return;

    try {
      setIsLoading(true);
      const updatePromises = lessonsInChapter.map(ls => {
        const lessonId = ls.lesson_id || ls.id;
        return axios.put(
          `http://localhost:3000/api/admin/lessons/${lessonId}`,
          {
            course_id: ls.course_id,
            title: ls.title || ls.lesson_name || "",
            chapter: newName.trim(),
            content: ls.content || "",
            thumbnail_url: ls.img_url || ls.thumbnail || null,
            video_url: ls.video_url || null,
            status: ls.status || "Active"
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      });

      await Promise.all(updatePromises);

      setChapters(prev =>
        prev.map(ch => {
          const oldTitle = ch.chapter_name || ch.title;
          if (oldTitle !== currentTitle) return ch;
          return {
            ...ch,
            chapter_name: newName.trim(),
            lessons: ch.lessons.map(ls => ({
              ...ls,
              chapter: newName.trim(),
              chapter_name: newName.trim()
            }))
          };
        })
      );

      setOpenId(newName.trim());
      alert("Đổi tên chương thành công!");
    } catch (err) {
      console.error("Lỗi sửa chương:", err);
      alert(err.response?.data?.message || "Sửa tên chương thất bại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChapter = () => {
    const name = prompt("Nhập tên chương bạn muốn tạo (VD: Chương 2: Phép nhân):");
    if (name?.trim()) navigate(`/admin/upload/${courseId}?chapterName=${encodeURIComponent(name.trim())}`);
  };

  // 6. GIAO DIỆN KHI ĐANG TẢI DỮ LIỆU
  if (isLoading || !courseInfo) {
    return <div className="container-center text-center mt-10">Đang tải chi tiết khóa học...</div>;
  }

  // 7. GIAO DIỆN CHÍNH
  return (
    <div className="detail-container">
      {/* SIDEBAR QUẢN LÝ LỚP HỌC */}
      <div className="detail-sidebar">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 className="detail-sidebar-title" style={{ margin: 0 }}>Quản lý lớp</h2>
          <button
            onClick={handleCreateGrade}
            style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '5px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            <Plus size={14} /> Thêm
          </button>
        </div>

        {grades.map(g => (
          <div
            key={g.grade_id}
            onClick={() => navigate(`/admin/courses?grade=${g.grade_id}`)}
            className="detail-sidebar-item"
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}
          >
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {g.grade_name}
            </span>
            <button
              onClick={(e) => handleUpdateGrade(e, g)}
              style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Sửa tên lớp"
            >
              <Edit3 size={13} className="btn-edit-icon-hover" style={{ transition: 'color 0.2s' }} />
            </button>
          </div>
        ))}
      </div>

      {/* KHU VỰC NỘI DUNG CHÍNH */}
      <div className="detail-content">
        <div className="course-info-card">
          <h1 className="course-info-title">{courseInfo.course_name || courseInfo.title}</h1>
          <p className="course-info-teacher">Giáo viên giảng dạy: <strong>{courseInfo.teacher_name || courseInfo.teacher || 'Đang cập nhật'}</strong></p>
          {!canEdit && <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '10px', fontStyle: 'italic' }}>* Bạn chỉ có quyền xem (Khóa học này do giáo viên khác tạo).</p>}
        </div>

        <div className="toolbar-container">
          <div className="search-box">
            <Search size={18} color="#94a3b8" />
            <input type="text" placeholder="Tìm kiếm bài học theo tiêu đề..." className="search-input" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {canEdit && (
            <div className="toolbar-actions">
              <button className="action-btn" onClick={handleAddChapter}><Plus size={18} /> Thêm chương</button>
              <button className="action-btn" onClick={() => navigate(`/admin/upload/${courseId}`)}><Upload size={18} /> Upload video</button>
            </div>
          )}
        </div>

        <div className="content-card" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
          {chapters.length === 0 ? (
            <div className="empty-chapters">Khóa học này chưa có bài học nào. {canEdit && 'Hãy bấm "Upload video" hoặc "Thêm chương" để bắt đầu!'}</div>
          ) : chapters.map((ch, idx) => {
            const chTitle = ch.chapter_name || ch.title || 'Chương không rõ tên';
            const chKey = ch.chapter_name || ch.title || ch.chapter_id || ch.id || idx;
            const currentLessons = ch.lessons || [];
            const filteredLessons = currentLessons.filter(ls => (ls.lesson_name || ls.title || '').toLowerCase().includes(searchTerm.toLowerCase()));

            if (searchTerm && filteredLessons.length === 0) return null;
            const isChapterOpen = searchTerm ? true : (openId === chKey);

            return (
              <div key={chKey} className="chapter-item">
                {/* HEADER CHƯƠNG */}
                <div className={`chapter-header ${isChapterOpen ? 'active' : ''}`} onClick={() => !searchTerm && setOpenId(openId === chKey ? null : chKey)}>
                  <div className="chapter-header-left">
                    <span className="chapter-title">{chTitle}</span>
                    {canEdit && (
                      <div className="chapter-action-group" onClick={(e) => e.stopPropagation()}>
                        <button className="btn-custom-edit-chapter" onClick={(e) => handleEditChapter(e, chTitle, currentLessons)}><Edit3 size={13} /> Sửa tên</button>
                        <button className="btn-custom-add-lesson" onClick={() => navigate(`/admin/upload/${courseId}?chapterName=${encodeURIComponent(chTitle)}`)}><Plus size={13} /> Thêm bài</button>
                      </div>
                    )}
                  </div>
                  {isChapterOpen ? <ChevronUp color="#64748b" /> : <ChevronDown color="#64748b" />}
                </div>

                {/* DANH SÁCH BÀI HỌC TRONG CHƯƠNG */}
                {isChapterOpen && (
                  <div className="lesson-list">
                    {filteredLessons.length === 0 ? (
                      <div style={{ padding: '15px', color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>Chưa có bài học nào trong chương này</div>
                    ) : filteredLessons.map((ls, lIdx) => {
                      const lsId = ls.lesson_id || ls.id || lIdx;
                      const lsTitle = ls.lesson_name || ls.title;
                      return (
                        <div key={lsId} className="lesson-item" style={{ cursor: 'default' }}>
                          <div className="lesson-left-content" style={{ cursor: 'pointer' }} onClick={() => navigate(`/lesson/${lsId}`)}>
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
