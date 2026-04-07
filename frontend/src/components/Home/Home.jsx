import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import '../../App.css'; 
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  // Dữ liệu giả lập cho 4 khóa học bên cột phải
  const featuredCourses = [1, 2, 3, 4];

  return (
    <div className="home-page-container">
      
      {/* CỘT TRÁI: DANH SÁCH BÀI VIẾT */}
      <div className="left-column">
        <h2 className="section-title">Bài viết nổi bật</h2>
        
        {/* Bài viết 1 */}
        <div className="article-card">
          <h3 className="article-title">Bộ giáo dục thông tin về kỳ thi THPT 2026</h3>
          <p className="article-snippet">Bộ giáo dục đã thông báo...</p>
          
          <div className="article-divider-wrapper">
            <span className="article-author">Tác giả: Teacher A...</span>
          </div>
          
          <button className="btn-article">Xem bài viết</button>
        </div>

        {/* Bài viết 2 */}
        <div className="article-card">
          <h3 className="article-title">Bộ giáo dục thông tin về kỳ thi THPT 2026</h3>
          <p className="article-snippet">Bộ giáo dục đã thông báo...</p>
          
          <div className="article-divider-wrapper">
            <span className="article-author">Tác giả: Teacher A...</span>
          </div>
          
          <button className="btn-article">Xem bài viết</button>
        </div>
      </div>

      {/* CỘT PHẢI: TÌM KIẾM VÀ KHÓA HỌC */}
      <div className="right-column">
        
        {/* Khu vực Tìm kiếm */}
        <div className="search-section">
          <h2 className="section-title">Tìm bài viết</h2>
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
          />
        </div>

        {/* Khu vực Khóa học nổi bật */}
        <div className="featured-courses-section">
          <h2 className="section-title">Khoá học nổi bật</h2>
          <div className="featured-courses-grid">
            
            {featuredCourses.map((item) => (
              <div key={item} className="course-card-mini">
                <div className="course-icon-wrapper">
                  <GraduationCap size={65} color="#2563eb" strokeWidth={1.5} />
                </div>
                <div className="course-card-mini-content">
                  <div className="course-card-mini-title">Toán 12</div>
                  <button 
                    className="btn-course-mini"
                    // Chuyển hướng tạm về khóa học có ID là 1
                    onClick={() => navigate('/course/1')} 
                  >
                    Học ngay
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>
        
      </div>
    </div>
  );
}