import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, BookOpen, Trophy, Settings, Clock,
  FileText, Award, Mail, GraduationCap, Medal, Search, CheckCircle, Shield, Lock
} from 'lucide-react';
import axios from 'axios';
import './Profile.css';

// ĐỒNG BỘ TOÀN HỆ THỐNG: Sử dụng utils quản lý token và session tập trung
import { getStoredToken, getStoredSession, clearStoredSession } from '../../utils/authStorage';

// ĐỒNG BỘ TOÀN HỆ THỐNG: Quản lý endpoint tập trung tại một nơi
const API_BASE = 'http://localhost:3000/api';
const FALLBACK_COLORS = ['#bbf7d0', '#fecaca', '#bfdbfe', '#fef08a', '#e9d5ff'];

export default function Profile() {
  const navigate = useNavigate();
  const isMounted = useRef(true);

  // 1. ĐỌC THÔNG TIN XÁC THỰC ĐỒNG BỘ
  const { token, currentUser } = useMemo(() => {
    return {
      token: getStoredToken(),
      currentUser: getStoredSession()?.user || null
    };
  }, []);

  const isAdminOrTeacher = currentUser?.role === "admin" || currentUser?.role === "teacher";

  // TRẠNG THÁI ĐIỀU HƯỚNG TAB
  const [activeTab, setActiveTab] = useState('account'); // 'account' | 'courses' | 'achievements' | 'settings'

  // TRẠNG THÁI LƯU TRỮ DỮ LIỆU PROFILE
  const [userInfo, setUserInfo] = useState({ name: '', grade: '', school: '', email: '' });
  const [activeCourses, setActiveCourses] = useState([]);
  const [achievements, setAchievements] = useState({ hours: 0, tests: 0, badges: 0 });
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  // Bộ lọc tìm kiếm khóa học
  const [courseSearch, setCourseSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all'); // 'all' | 'learning' | 'completed'

  // TRẠNG THÁI FORM CÀI ĐẶT & BẢO MẬT
  const [updateInfo, setUpdateInfo] = useState({ name: '', school: '', grade: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Theo dõi vòng đời component phòng thủ lỗi bất đồng bộ khi hủy mount trang
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // Điều hướng cưỡng chế nếu chưa có phiên đăng nhập hợp lệ
  useEffect(() => {
    if (!token) {
      alert("Vui lòng đăng nhập để xem thông tin trang cá nhân!");
      clearStoredSession();
      navigate('/login');
    }
  }, [token, navigate]);

  // ==================== 2. API: LẤY THÔNG TIN CHI TIẾT PROFILE ====================
  const fetchProfileData = useCallback(async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/client/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success && isMounted.current) {
        const { user, courses, stats, examHistory } = res.data.data;
        const isSystemStaff = user?.role === 'admin' || user?.role === 'teacher';
        setAvatarUrl(user?.avatar_url || null);

        const fetchedUser = {
          name: user?.username || 'Thành viên LearnHub',
          grade: isSystemStaff
            ? (user?.role === 'admin' ? 'Quản trị viên' : 'Giáo viên')
            : (user?.grade_class || 'Chưa cập nhật lớp'),
          school: isSystemStaff
            ? 'Hệ thống Giáo dục LearnHub'
            : (user?.school || 'Chưa cập nhật trường'),
          email: user?.email || 'Chưa cập nhật email'
        };

        setUserInfo(fetchedUser);

        // Đổ dữ liệu có sẵn vào form chỉnh sửa (Chỉ áp dụng với tài khoản học sinh)
        if (!isSystemStaff) {
          setUpdateInfo({
            name: fetchedUser.name,
            school: fetchedUser.school === 'Chưa cập nhật trường' ? '' : fetchedUser.school,
            grade: fetchedUser.grade === 'Chưa cập nhật lớp' ? '' : fetchedUser.grade
          });
        }

        setActiveCourses(courses || []);
        setAchievements({
          hours: Math.round((stats?.totalWatchTime || 0) / 3600),
          tests: stats?.totalExams || 0,
          badges: stats?.badges || 0
        });
        setHistory(examHistory || []);
      }
    } catch (err) {
      console.error("🔴 Lỗi kết nối API profile dữ liệu:", err.response ? err.response.data : err.message);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // ==================== 3. API: XỬ LÝ CẬP NHẬT THÔNG TIN CÁ NHÂN ====================
  const handleUpdateInfoSubmit = async (e) => {
    e.preventDefault();
    if (!updateInfo.name.trim()) {
      alert("Họ tên không được phép để trống!");
      return;
    }
    try {
      setIsSubmittingInfo(true);
      const res = await axios.put(`${API_BASE}/client/profile/update`, updateInfo, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data?.success) {
        alert("Cập nhật thông tin cá nhân thành công!");
        fetchProfileData();
      } else {
        alert(res.data?.message || "Có lỗi xảy ra trong quá trình cập nhật!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi kết nối máy chủ khi cập nhật dữ liệu!");
    } finally {
      if (isMounted.current) setIsSubmittingInfo(false);
    }
  };

  // ==================== 4. API: XỬ LÝ ĐỔI MẬT KHẨU TÀI KHOẢN ====================
  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Vui lòng điền đầy đủ các trường mật khẩu yêu cầu!");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới và Xác nhận lại mật khẩu không trùng khớp!");
      return;
    }
    if (newPassword.length < 6) {
      alert("Mật khẩu mới yêu cầu độ dài tối thiểu từ 6 ký tự trở lên!");
      return;
    }
    try {
      setIsSubmittingPassword(true);
      const res = await axios.put(`${API_BASE}/client/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data?.success) {
        alert("Thay đổi mật khẩu tài khoản thành công!");
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(res.data?.message || "Mật khẩu hiện tại cung cấp không chính xác!");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gặp lỗi kết nối server khi thực hiện đổi mật khẩu!");
    } finally {
      if (isMounted.current) setIsSubmittingPassword(false);
    }
  };

  // Logic tính toán hiển thị danh sách khóa học dựa theo bộ lọc Tab nội bộ
  const filteredCourses = useMemo(() => {
    return activeCourses.filter(course => {
      const matchesSearch = course.course_name.toLowerCase().includes(courseSearch.toLowerCase());
      if (courseFilter === 'completed') return matchesSearch && (course.progress >= 100);
      if (courseFilter === 'learning') return matchesSearch && (course.progress < 100);
      return matchesSearch;
    });
  }, [activeCourses, courseSearch, courseFilter]);

  if (isLoading) {
    return <div className="profile-loading">Đang tải thông tin cá nhân...</div>;
  }
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setIsUploadingAvatar(true);
      const res = await axios.put(`${API_BASE}/client/profile/avatar`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
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

  return (
    <div className="profile-container">

      {/* ================= CỘT TRÁI (SIDEBAR THÔNG TIN) ================= */}
      <div className="profile-sidebar">
        <div className="profile-card user-info-card">

          {/* Khối Avatar Chữ Cái Đầu */}
          <div className="avatar-wrapper" style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            {avatarUrl ? (
              <img
                src={`http://localhost:3000${avatarUrl}`}
                alt="Avatar"
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="avatar-text">
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            {/* Overlay khi hover */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(0,0,0,0.4)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              opacity: 0, transition: '0.2s',
              color: 'white', fontSize: 12
            }}
              onMouseEnter={e => e.currentTarget.style.opacity = 1}
              onMouseLeave={e => e.currentTarget.style.opacity = 0}
            >
              {isUploadingAvatar ? '...' : '📷 Đổi ảnh'}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleAvatarChange}
            />
          </div>

          {/* Badge phân loại quyền người dùng */}
          <div className="badge-wrapper">
            <span className={`role-badge ${currentUser?.role || 'student'}`}>
              {currentUser?.role === 'admin' ? '🔑 Admin' : currentUser?.role === 'teacher' ? '👨‍🏫 Giáo Viên' : '🎓 Học Sinh'}
            </span>
          </div>

          {/* Metadata thông tin chi tiết */}
          <div className="user-metadata-details">
            <div className="metadata-row">
              <div className="metadata-icon-wrapper"><User size={16} /></div>
              <div className="metadata-body">
                <span className="metadata-label">Họ tên</span>
                <span className="metadata-value">{userInfo.name}</span>
              </div>
            </div>

            <div className="metadata-row">
              <div className="metadata-icon-wrapper"><GraduationCap size={16} /></div>
              <div className="metadata-body">
                <span className="metadata-label">Trường</span>
                <span className="metadata-value">{userInfo.school}</span>
              </div>
            </div>

            <div className="metadata-row">
              <div className="metadata-icon-wrapper"><BookOpen size={16} /></div>
              <div className="metadata-body">
                <span className="metadata-label">Lớp</span>
                <span className="metadata-value">{userInfo.grade}</span>
              </div>
            </div>

            <div className="metadata-row">
              <div className="metadata-icon-wrapper"><Mail size={16} /></div>
              <div className="metadata-body">
                <span className="metadata-label">Email</span>
                <span className="metadata-value email-text" title={userInfo.email}>{userInfo.email}</span>
              </div>
            </div>
          </div>

          {/* Danh mục chuyển đổi tab chức năng */}
          <div className="profile-menu">
            <button className={`menu-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
              <User size={18} /> Tổng quan tài khoản
            </button>
            <button className={`menu-item ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
              <BookOpen size={18} /> Khóa học của tôi
            </button>
            <button className={`menu-item ${activeTab === 'achievements' ? 'active' : ''}`} onClick={() => setActiveTab('achievements')}>
              <Trophy size={18} /> Thành tích đạt được
            </button>
            <button className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
              <Settings size={18} /> Cài đặt & Hỗ trợ
            </button>
          </div>
        </div>

        {/* Lịch sử làm bài thi gần đây */}
        <div className="profile-card history-card">
          <h4 className="card-title">Bài thi gần đây</h4>
          <div className="history-list">
            {history.length === 0 ? (
              <p className="history-empty">Chưa có lịch sử làm đề</p>
            ) : history.map((item, idx) => (
              <div key={item.attempt_id || idx} className="history-item" title={item.exam_title}>
                <span className="history-exam-title">{item.exam_title}</span>
                <span className="history-score">
                  {item.score} Điểm
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= CỘT PHẢI (NỘI DUNG NĂNG ĐỘNG THEO TAB) ================= */}
      <div className="profile-content">

        {/* TAB 1: TỔNG QUAN TÀI KHOẢN */}
        {activeTab === 'account' && (
          <>
            <div className="welcome-banner">
              <h2>Chào mừng trở lại, <span className="text-highlight">{userInfo.name || "Bạn"}</span>!</h2>
              <p>Hôm nay chúng ta sẽ tiếp tục hành trình chinh phục kiến thức chứ?</p>
            </div>

            <div className="section-container status-container">
              <Shield size={40} className="status-icon" />
              <h4 className="status-title">Trạng thái tài khoản</h4>
              <p className="status-desc">Tài khoản của bạn đang hoạt động bình thường trên hệ thống LearnHub.</p>
              <div className="status-meta-group">
                <div className="status-meta-item">
                  <span className="status-meta-label">Ngày tham gia</span>
                  <span className="status-meta-value">Tháng 06/2026</span>
                </div>
                <div className="status-meta-item">
                  <span className="status-meta-label">Bảo mật</span>
                  <span className="status-meta-value text-success">Đã bảo vệ</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* TAB 2: KHÓA HỌC CỦA TÔI */}
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
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Tất cả</option>
                  <option value="learning">Đang học</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
              </div>
            </div>

            <div className="course-grid">
              {filteredCourses.length === 0 ? (
                <div className="courses-empty">
                  Không tìm thấy khóa học nào phù hợp với bộ lọc tìm kiếm.
                </div>
              ) : filteredCourses.map((course, idx) => (
                <div key={course.course_id} className="active-course-card">
                  <div className="course-card-top">
                    {course.img_url ? (
                      <img src={course.img_url} alt={course.course_name} className="course-color-block" />
                    ) : (
                      <div className="course-color-block" style={{ backgroundColor: FALLBACK_COLORS[idx % FALLBACK_COLORS.length] }}></div>
                    )}
                    <span className="course-card-title">{course.course_name}</span>
                  </div>

                  <div className="progress-section">
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${course.progress || 0}%` }}></div>
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

        {/* TAB 3: THÀNH TÍCH ĐẠT ĐƯỢC */}
        {activeTab === 'achievements' && (
          <div>
            <div className="section-container mb-24">
              <h3 className="section-title">Số liệu thống kê tích lũy</h3>
              <div className="achievement-grid">
                <div className="achievement-card bg-purple">
                  <Clock size={28} />
                  <div className="achivement-number">{achievements.hours}</div>
                  <div className="achievement-label">Giờ học tích lũy</div>
                </div>

                <div className="achievement-card bg-green">
                  <FileText size={28} />
                  <div className="achivement-number">{achievements.tests}</div>
                  <div className="achievement-label">Bài luyện đề<br />đã tham gia</div>
                </div>

                <div className="achievement-card bg-orange">
                  <Award size={28} />
                  <div className="achivement-number">{achievements.badges}</div>
                  <div className="achievement-label">Khóa học<br />hoàn thành</div>
                </div>
              </div>
            </div>

            <div className="section-container badges-container">
              <h3 className="section-title">Huy hiệu danh hiệu LearnHub</h3>
              <div className="badges-grid">

                <div className={`badge-item ${achievements.hours > 0 ? '' : 'is-locked'}`}>
                  <Medal size={32} className="badge-icon icon-yellow" />
                  <div>
                    <h5 className="badge-title">Chăm Chỉ Học Tập</h5>
                    <p className="badge-desc">Có giờ học tích lũy đầu tiên</p>
                  </div>
                </div>

                <div className={`badge-item ${achievements.tests > 0 ? '' : 'is-locked'}`}>
                  <CheckCircle size={32} className="badge-icon icon-green" />
                  <div>
                    <h5 className="badge-title">Vượt Vũ Môn</h5>
                    <p className="badge-desc">Hoàn thành tối thiểu 1 bài thi</p>
                  </div>
                </div>

                <div className={`badge-item ${achievements.badges > 0 ? '' : 'is-locked'}`}>
                  <Award size={32} className="badge-icon icon-blue" />
                  <div>
                    <h5 className="badge-title">Học Giả Uyên Bác</h5>
                    <p className="badge-desc">Tốt nghiệp 1 khóa học bất kỳ</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CÀI ĐẶT & BẢO MẬT */}
        {activeTab === 'settings' && (
          <div className="settings-tab-container">

            {/* Form sửa thông tin */}
            <div className="settings-card-form">
              <div className="settings-card-header">
                <User size={20} className="text-highlight" />
                <h3>Cập nhật thông tin cá nhân</h3>
              </div>

              {isAdminOrTeacher ? (
                <p className="staff-notice">
                  Tài khoản quyền Quản lý/Giáo viên cần liên hệ bộ phận Kỹ thuật hệ thống LearnHub để điều chỉnh đơn vị công tác.
                </p>
              ) : (
                <form onSubmit={handleUpdateInfoSubmit} className="settings-form-layout">
                  <div className="form-group">
                    <label className="form-label">Họ và tên</label>
                    <input
                      type="text"
                      className="form-input"
                      value={updateInfo.name}
                      onChange={(e) => setUpdateInfo({ ...updateInfo, name: e.target.value })}
                      placeholder="Nhập họ và tên mới..."
                    />
                  </div>

                  <div className="form-row-grid">
                    <div className="form-group">
                      <label className="form-label">Trường học</label>
                      <input
                        type="text"
                        className="form-input"
                        value={updateInfo.school}
                        onChange={(e) => setUpdateInfo({ ...updateInfo, school: e.target.value })}
                        placeholder="Tên trường học..."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lớp học</label>
                      <input
                        type="text"
                        className="form-input"
                        value={updateInfo.grade}
                        onChange={(e) => setUpdateInfo({ ...updateInfo, grade: e.target.value })}
                        placeholder="Ví dụ: Lớp 12A1..."
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn-submit-settings" disabled={isSubmittingInfo}>
                    {isSubmittingInfo ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </form>
              )}
            </div>

            {/* Form đổi mật khẩu bảo mật */}
            <div className="settings-card-form">
              <div className="settings-card-header">
                <Lock size={20} className="icon-danger" />
                <h3>Đổi mật khẩu tài khoản</h3>
              </div>

              <form onSubmit={handleChangePasswordSubmit} className="settings-form-layout">
                <div className="form-group">
                  <label className="form-label">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    className="form-input"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="••••••••"
                  />
                </div>

                <div className="form-row-grid">
                  <div className="form-group">
                    <label className="form-label">Mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Tối thiểu 6 ký tự"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      className="form-input"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Nhập lại mật khẩu mới"
                    />
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