import React, { useState, useEffect } from 'react';
import { User, BookOpen, Trophy, Settings, Clock, FileText, Award } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  // ==========================================
  // STATE CHỨA DỮ LIỆU (Sẵn sàng nối Backend)
  // ==========================================
  const [userInfo, setUserInfo] = useState({
    name: 'Nguyễn Văn A',
    grade: 'Lớp 1A',
    school: 'Trường Tiểu học A',
    avatar: 'https://placehold.co/100x100/fde68a/d97706?text=A'
  });

  const [activeCourses, setActiveCourses] = useState([
    { id: 1, title: 'Toán lớp 1', progress: 50, color: '#bbf7d0' },
    { id: 2, title: 'Tiếng việt lớp 1', progress: 50, color: '#fecaca' }
  ]);

  const [achievements, setAchievements] = useState({
    hours: 150,
    tests: 25,
    badges: 12
  });

  const [history, setHistory] = useState([
    { id: 1, date: '23/3/2026', title: 'Bài kiểm tra Toán' },
    { id: 2, date: '22/3/2026', title: 'Bài tập Tiếng Việt' },
    { id: 3, date: '21/3/2026', title: 'Bài tập Đạo Đức' }
  ]);

  // Nơi này sau này bạn dùng axios để gọi API lấy dữ liệu thật
  useEffect(() => {
    // axios.get('http://localhost:3000/api/users/profile').then(...)
  }, []);

  return (
    <div className="profile-container">
      
      {/* ================= CỘT TRÁI ================= */}
      <div className="profile-sidebar">
        
        {/* Thẻ thông tin cá nhân */}
        <div className="profile-card user-info-card">
          <img src={userInfo.avatar} alt="Avatar" className="user-avatar" />
          <h3 className="user-name">{userInfo.name}</h3>
          <p className="user-school">{userInfo.grade}</p>
          <p className="user-school">{userInfo.school}</p>

          <div className="profile-menu">
            <button className="menu-item active">
              <User size={18} /> Thông tin tài khoản
            </button>
            <button className="menu-item">
              <BookOpen size={18} /> Khóa học của tôi
            </button>
            <button className="menu-item">
              <Trophy size={18} /> Thành tích
            </button>
            <button className="menu-item">
              <Settings size={18} /> Cài đặt và hỗ trợ
            </button>
          </div>
        </div>

        {/* Thẻ Lịch sử nộp bài */}
        <div className="profile-card history-card">
          <h4 className="card-title">Lịch sử nộp bài</h4>
          <div className="history-list">
            {history.map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-bar"></div>
                <span className="history-date">{item.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= CỘT PHẢI ================= */}
      <div className="profile-content">
        
        {/* Banner chào mừng */}
        <div className="welcome-banner">
          <h2>Chào mừng trở lại <span className="text-highlight">A</span> !</h2>
          <p>Hôm nay bạn muốn học gì ?</p>
        </div>

        {/* Khóa học đang học */}
        <div className="section-container">
          <h3 className="section-title">Khóa học đang học</h3>
          <div className="course-grid">
            {activeCourses.map(course => (
              <div key={course.id} className="active-course-card">
                <div className="course-card-top">
                  <div className="course-color-block" style={{ backgroundColor: course.color }}></div>
                  <span className="course-card-title">{course.title}</span>
                </div>
                
                <div className="progress-section">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <span className="progress-text">{course.progress}%</span>
                </div>
                
                <button className="btn-continue-learning">Vào học ngay</button>
              </div>
            ))}
          </div>
        </div>

        {/* Bảng thành tích */}
        <div className="section-container">
          <h3 className="section-title">Bảng thành tích</h3>
          <div className="achievement-grid">
            
            <div className="achievement-card bg-purple">
              <Clock size={28} />
              <div className="achivement-number">{achievements.hours}</div>
              <div className="achievement-label">Giờ học tích lũy</div>
            </div>

            <div className="achievement-card bg-green">
              <FileText size={28} />
              <div className="achivement-number">{achievements.tests}</div>
              <div className="achievement-label">Bài kiểm tra<br/>hoàn thành</div>
            </div>

            <div className="achievement-card bg-orange">
              <Award size={28} />
              <div className="achivement-number">{achievements.badges}</div>
              <div className="achievement-label">Huy hiệu đạt được</div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}