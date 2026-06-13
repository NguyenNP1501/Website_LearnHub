import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, BookOpen, Trophy, Settings, Clock, FileText,
  Award, Mail, GraduationCap, Medal, Search, CheckCircle, Lock
} from 'lucide-react';
import axios from 'axios';
import './Profile.css';
import { getStoredToken, getStoredSession, clearStoredSession } from '../../utils/authStorage';

const API_BASE = 'http://localhost:3000/api';
const FALLBACK_COLORS = ['#bbf7d0', '#fecaca', '#bfdbfe', '#fef08a', '#e9d5ff'];
const TABS = [
  { key: 'account', icon: User, label: 'Tổng quan tài khoản' },
  { key: 'courses', icon: BookOpen, label: 'Khóa học của tôi' },
  { key: 'achievements', icon: Trophy, label: 'Thành tích đạt được' },
  { key: 'settings', icon: Settings, label: 'Cài đặt & Hỗ trợ' },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function MetaRow({ icon: Icon, label, value }) {
  return (
    <div className="metadata-row">
      <div className="metadata-icon-wrapper"><Icon size={16} /></div>
      <div className="metadata-body">
        <span className="metadata-label">{label}</span>
        <span className="metadata-value">{value}</span>
      </div>
    </div>
  );
}

function AvatarBlock({ avatarUrl, name, isUploading, fileInputRef, onChange }) {
  const src = avatarUrl
    ? (avatarUrl.startsWith('/') ? `http://localhost:3000${avatarUrl}` : `http://localhost:3000/${avatarUrl}`)
    : null;

  return (
    <div className="avatar-wrapper avatar-clickable" onClick={() => fileInputRef.current?.click()}>
      {src ? (
        <img src={src} alt="Avatar" className="avatar-img" onError={(e) => { e.target.style.display = 'none'; }} />
      ) : (
        <div className="avatar-text">
          {name ? name.charAt(0).toUpperCase() : 'U'}
        </div>
      )}

      <div className="avatar-overlay">
        {isUploading ? '...' : '📷 Đổi ảnh'}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden-file-input"
        onChange={onChange}
      />
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const fileInputRef = useRef(null);

  const { token, currentUser } = useMemo(() => ({
    token: getStoredToken(),
    currentUser: getStoredSession()?.user || null,
  }), []);
  const authHeaders = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const isAdminOrTeacher = ['admin', 'teacher'].includes(currentUser?.role);

  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [userInfo, setUserInfo] = useState({ name: '', grade: '', school: '', email: '' });
  const [activeCourses, setActiveCourses] = useState([]);
  const [achievements, setAchievements] = useState({ hours: 0, tests: 0, badges: 0 });
  const [history, setHistory] = useState([]);

  const [courseSearch, setCourseSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');

  const [updateInfo, setUpdateInfo] = useState({ name: '', school: '', grade: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  const [userPosts, setUserPosts] = useState([]);

  // ── Fetch profile functions ──────────────────────────────────────────────────
  const fetchUserPosts = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/client/profile/posts`, authHeaders);
      if (res.data?.success) setUserPosts(res.data.data);
    } catch (err) {
      console.error("Lỗi load bài đăng:", err.message);
    }
  }, [authHeaders]);

  const fetchProfileData = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/client/profile`, authHeaders);
      if (!res.data?.success || !isMounted.current) return;

      const { user, courses, stats, examHistory } = res.data.data;
      const isStaff = ['admin', 'teacher'].includes(user?.role);

      setAvatarUrl(user?.avatar_url || null);

      const fetchedUser = {
        name: user?.username || 'Thành viên LearnHub',
        grade: isStaff ? (user?.role === 'admin' ? 'Quản trị viên' : 'Giáo viên') : (user?.grade_class || 'Chưa cập nhật lớp'),
        school: isStaff ? 'Hệ thống Giáo dục LearnHub' : (user?.school || 'Chưa cập nhật trường'),
        email: user?.email || 'Chưa cập nhật email',
      };
      setUserInfo(fetchedUser);

      if (!isStaff) {
        setUpdateInfo({
          name: fetchedUser.name,
          school: fetchedUser.school === 'Chưa cập nhật trường' ? '' : fetchedUser.school,
          grade: fetchedUser.grade === 'Chưa cập nhật lớp' ? '' : fetchedUser.grade,
        });
      }

      setActiveCourses(courses || []);
      setAchievements({
        hours: Math.round((stats?.totalWatchTime || 0) / 3600),
        tests: stats?.totalExams || 0,
        badges: stats?.badges || 0,
      });
      setHistory(examHistory || []);
    } catch (err) {
      console.error("Lỗi profile:", err.response?.data || err.message);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [token, authHeaders]);

  // ── useEffects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (!token) {
      alert("Vui lòng đăng nhập để xem thông tin trang cá nhân!");
      clearStoredSession();
      navigate('/login');
    }
  }, [token, navigate]);

  useEffect(() => { fetchUserPosts(); }, [fetchUserPosts]);
  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);


  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      setIsUploadingAvatar(true);
      const res = await axios.put(`${API_BASE}/client/profile/avatar`, formData, authHeaders);
      if (res.data?.success) {
        setAvatarUrl(res.data.data.avatarUrl);
        alert("Cập nhật ảnh đại diện thành công!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi tải ảnh lên!");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleUpdateInfoSubmit = async (e) => {
    e.preventDefault();
    if (!updateInfo.name.trim()) return alert("Họ tên không được phép để trống!");
    try {
      setIsSubmittingInfo(true);
      const res = await axios.put(`${API_BASE}/client/profile/update`, updateInfo, authHeaders);
      if (res.data?.success) { alert("Cập nhật thành công!"); fetchProfileData(); }
      else alert(res.data?.message || "Có lỗi xảy ra!");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi kết nối!");
    } finally {
      if (isMounted.current) setIsSubmittingInfo(false);
    }
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;
    if (!currentPassword || !newPassword || !confirmPassword) return alert("Vui lòng điền đầy đủ!");
    if (newPassword !== confirmPassword) return alert("Mật khẩu mới không trùng khớp!");
    if (newPassword.length < 6) return alert("Mật khẩu tối thiểu 6 ký tự!");
    try {
      setIsSubmittingPassword(true);
      const res = await axios.put(`${API_BASE}/client/profile/change-password`, { currentPassword, newPassword }, authHeaders);
      if (res.data?.success) {
        alert("Đổi mật khẩu thành công!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else alert(res.data?.message || "Mật khẩu hiện tại không chính xác!");
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi kết nối!");
    } finally {
      if (isMounted.current) setIsSubmittingPassword(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Bạn có chắc muốn xóa bài đăng này không?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/client/profile/posts/${postId}`, authHeaders);
      if (res.data?.success) {
        setUserPosts(prev => prev.filter(p => p.post_id !== postId));
        alert("Xóa bài đăng thành công!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi xóa bài đăng!");
    }
  };

  const filteredCourses = useMemo(() => activeCourses.filter(course => {
    const match = course.course_name.toLowerCase().includes(courseSearch.toLowerCase());
    if (courseFilter === 'completed') return match && course.progress >= 100;
    if (courseFilter === 'learning') return match && course.progress < 100;
    return match;
  }), [activeCourses, courseSearch, courseFilter]);

  if (isLoading) return <div className="profile-loading">Đang tải thông tin cá nhân...</div>;

  const roleBadge = currentUser?.role === 'admin' ? '🔑 Admin' : currentUser?.role === 'teacher' ? '👨‍🏫 Giáo Viên' : '🎓 Học Sinh';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="profile-container">

      {/* SIDEBAR */}
      <div className="profile-sidebar">
        <div className="profile-card user-info-card">

          <AvatarBlock
            avatarUrl={avatarUrl}
            name={userInfo.name}
            isUploading={isUploadingAvatar}
            fileInputRef={fileInputRef}
            onChange={handleAvatarChange}
          />

          <div className="badge-wrapper">
            <span className={`role-badge ${currentUser?.role || 'student'}`}>{roleBadge}</span>
          </div>

          <div className="user-metadata-details">
            <MetaRow icon={User} label="Họ tên" value={userInfo.name} />
            <MetaRow icon={GraduationCap} label="Trường" value={userInfo.school} />
            <MetaRow icon={BookOpen} label="Lớp" value={userInfo.grade} />
            <MetaRow icon={Mail} label="Email" value={userInfo.email} />
          </div>

          <div className="profile-menu">
            {TABS.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                className={`menu-item ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="profile-card history-card">
          <h4 className="card-title">Bài thi gần đây</h4>
          <div className="history-list">
            {history.length === 0 ? (
              <p className="history-empty">Chưa có lịch sử làm đề</p>
            ) : history.map((item, idx) => (
              <div key={item.attempt_id || idx} className="history-item" title={item.exam_title}>
                <span className="history-exam-title">{item.exam_title}</span>
                <span className="history-score">{item.score} Điểm</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="profile-content">

        {/* TAB: Tổng quan */}
        {activeTab === 'account' && (
          <>
            <div className="welcome-banner">
              <h2>Chào mừng trở lại, <span className="text-highlight">{userInfo.name || "Bạn"}</span>!</h2>
              <p>Hôm nay chúng ta sẽ tiếp tục hành trình chinh phục kiến thức chứ?</p>
            </div>
            
            <div className="section-container mt-16">
              <h4 className="status-title">Bài đăng của tôi</h4>
              {userPosts.length === 0 ? (
                <p className="empty-posts-text">Bạn chưa có bài đăng nào.</p>
              ) : userPosts.map(post => (
                <div key={post.post_id} className="profile-post-item">

                  {/* VÙNG CLICK XEM CHI TIẾT BÀI ĐĂNG */}
                  <div
                    onClick={() => navigate(`/view-post/${post.post_id}`)}
                    className="profile-post-click-area"
                    title="Bấm để xem chi tiết bài viết"
                  >
                    <p className="profile-post-title">
                      {post.title || 'Không có tiêu đề'}
                    </p>
                    <p className="profile-post-date">
                      {new Date(post.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>

                  {/* NÚT XÓA BÀI ĐĂNG */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePost(post.post_id);
                    }}
                    className="btn-delete-post"
                  >
                    Xóa
                  </button>

                </div>
              ))}
            </div>
          </>
        )}

        {/* TAB: Khóa học */}
        {activeTab === 'courses' && (
          <div className="section-container">
            <div className="courses-header">
              <h3 className="section-title">Khóa học của tôi</h3>
              <div className="courses-filters">
                <div className="search-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm khóa học..."
                    value={courseSearch}
                    onChange={(e) => setCourseSearch(e.target.value)}
                    className="search-input"
                  />
                </div>
                <select value={courseFilter} onChange={(e) => setCourseFilter(e.target.value)} className="filter-select">
                  <option value="all">Tất cả</option>
                  <option value="learning">Đang học</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
              </div>
            </div>

            <div className="course-grid">
              {filteredCourses.length === 0 ? (
                <div className="courses-empty">Không tìm thấy khóa học phù hợp.</div>
              ) : filteredCourses.map((course, idx) => (
                <div key={course.course_id} className="active-course-card">
                  <div className="course-card-top">
                    {course.img_url
                      ? <img src={course.img_url} alt={course.course_name} className="course-color-block" />
                      : <div className="course-color-block" style={{ backgroundColor: FALLBACK_COLORS[idx % FALLBACK_COLORS.length] }} />
                    }
                    <span className="course-card-title">{course.course_name}</span>
                  </div>
                  <div className="progress-section">
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${course.progress || 0}%` }} />
                    </div>
                    <div className="progress-text-wrapper">
                      <span>Tiến độ</span>
                      <span className="progress-percentage">{Math.round(course.progress || 0)}%</span>
                    </div>
                  </div>
                  <button
                    className="btn-continue-learning"
                    onClick={() => navigate(isAdminOrTeacher ? `/admin/course/${course.course_id}` : `/course/${course.course_id}`)}
                  >
                    {course.progress >= 100 ? 'Xem lại bài học' : 'Vào học tiếp'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: Thành tích */}
        {activeTab === 'achievements' && (
          <div>
            <div className="section-container mb-24">
              <h3 className="section-title">Số liệu thống kê tích lũy</h3>
              <div className="achievement-grid">
                {[
                  { icon: Clock, value: achievements.hours, label: 'Giờ học tích lũy', bg: 'bg-purple' },
                  { icon: FileText, value: achievements.tests, label: 'Bài luyện đề đã tham gia', bg: 'bg-green' },
                  { icon: Award, value: achievements.badges, label: 'Khóa học hoàn thành', bg: 'bg-orange' },
                ].map(({ icon: Icon, value, label, bg }) => (
                  <div key={label} className={`achievement-card ${bg}`}>
                    <Icon size={28} />
                    <div className="achivement-number">{value}</div>
                    <div className="achievement-label">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-container badges-container">
              <h3 className="section-title">Huy hiệu danh hiệu LearnHub</h3>
              <div className="badges-grid">
                {[
                  { icon: Medal, unlocked: achievements.hours > 0, title: 'Chăm Chỉ Học Tập', desc: 'Có giờ học tích lũy đầu tiên', cls: 'icon-yellow' },
                  { icon: CheckCircle, unlocked: achievements.tests > 0, title: 'Vượt Vũ Môn', desc: 'Hoàn thành tối thiểu 1 bài thi', cls: 'icon-green' },
                  { icon: Award, unlocked: achievements.badges > 0, title: 'Học Giả Uyên Bác', desc: 'Tốt nghiệp 1 khóa học bất kỳ', cls: 'icon-blue' },
                ].map(({ icon: Icon, unlocked, title, desc, cls }) => (
                  <div key={title} className={`badge-item ${unlocked ? '' : 'is-locked'}`}>
                    <Icon size={32} className={`badge-icon ${cls}`} />
                    <div>
                      <h5 className="badge-title">{title}</h5>
                      <p className="badge-desc">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Cài đặt */}
        {activeTab === 'settings' && (
          <div className="settings-tab-container">

            <div className="settings-card-form">
              <div className="settings-card-header">
                <User size={20} className="text-highlight" />
                <h3>Cập nhật thông tin cá nhân</h3>
              </div>
              {isAdminOrTeacher ? (
                <p className="staff-notice">Tài khoản Quản lý/Giáo viên cần liên hệ bộ phận Kỹ thuật để điều chỉnh thông tin.</p>
              ) : (
                <form onSubmit={handleUpdateInfoSubmit} className="settings-form-layout">
                  <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input type="text" className="form-input" value={updateInfo.name}
                      onChange={(e) => setUpdateInfo({ ...updateInfo, name: e.target.value })}
                      placeholder="Nhập họ và tên mới..." />
                  </div>
                  <div className="form-row-grid">
                    <div className="form-group">
                      <label className="form-label">Trường học</label>
                      <input type="text" className="form-input" value={updateInfo.school}
                        onChange={(e) => setUpdateInfo({ ...updateInfo, school: e.target.value })}
                        placeholder="Tên trường học..." />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lớp học</label>
                      <input type="text" className="form-input" value={updateInfo.grade}
                        onChange={(e) => setUpdateInfo({ ...updateInfo, grade: e.target.value })}
                        placeholder="Ví dụ: Lớp 12A1..." />
                    </div>
                  </div>
                  <button type="submit" className="btn-submit-settings" disabled={isSubmittingInfo}>
                    {isSubmittingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              )}
            </div>

            <div className="settings-card-form">
              <div className="settings-card-header">
                <Lock size={20} className="icon-danger" />
                <h3>Đổi mật khẩu tài khoản</h3>
              </div>
              <form onSubmit={handleChangePasswordSubmit} className="settings-form-layout">
                <div className="form-group">
                  <label className="form-label">Mật khẩu hiện tại</label>
                  <input type="password" className="form-input" value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••" />
                </div>
                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="form-label">Mật khẩu mới</label>
                    <input type="password" className="form-input" value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Tối thiểu 6 ký tự" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Xác nhận mật khẩu mới</label>
                    <input type="password" className="form-input" value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới" />
                  </div>
                </div>
                <button type="submit" className="btn-submit-settings btn-danger-settings" disabled={isSubmittingPassword}>
                  {isSubmittingPassword ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}