import { Link} from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import '../../App.css'; 
import './Home.css';
import { useState } from 'react';
import { useEffect } from 'react';

export default function Home() {

  const [latestPost, setLatestPost] = useState([]);
  const [latestCourse, setLatestCourse] = useState([]);
  const [keyword, setKeyword] = useState(null);
  const [searchResult, setSearchResult] = useState([]);

  const LATEST_POST_API_URL = "http://localhost:3000/api/nearestposts";
  const LATEST_COURSE_API_URL = "http://localhost:3000/api/latestcourses";
  const SEARCH_POST_APT_URL = "http://localhost:3000/api/nearestposts/search?keyword="
  const fetchAPI = async (API_URL) =>{
    const response = await fetch(API_URL);
    const result = await response.json();
    return result;
  }
  useEffect(() =>{
    const loadData = async () =>{
      const data = await fetchAPI(LATEST_POST_API_URL);
      setLatestPost(data);
    }
    loadData();
  }, [])

  useEffect(() =>{
    const loadData = async () =>{
      const data = await fetchAPI(LATEST_POST_API_URL);
      setLatestCourse(data);
    }
    loadData();
  }, [])
  
  useEffect(()=>{
      const loadData = async () =>{
        const data = await fetchAPI(SEARCH_POST_APT_URL + `${keyword}`);
        setSearchResult(data);
      }
      loadData();
  }, [keyword]);

  
  return (
    <div className="home-page-container">
      
      {/* CỘT TRÁI: DANH SÁCH BÀI VIẾT */}
      <div className="left-column">
        <h2 className="section-title">Bài viết mới nhất</h2>

        {latestPost.map((item, index) => (
          <div className="article-card" key={index}>
            <h3 className="article-title">{item.title}</h3>
            {/* <p className="article-snippet">{item.content.slice(0, 100) ? item.content.length() > 100 : item.content}</p> */}
            <p className="article-snippet">{item.content}</p>
            
            <div className="article-divider-wrapper">
              <span className="article-author">{item.user_name}</span>
            </div>

            <Link to={`/view-post/${item.post_id}`}>
              <button className="btn-article">Xem bài viết</button>
            </Link>
          </div>
        ))}
        
      </div>

      {/* CỘT PHẢI: TÌM KIẾM VÀ KHÓA HỌC */}
      <div className="right-column">
        
        {/* Khu vực Tìm kiếm */}
        {/* <div className="search-section">
          <h2 className="section-title">Tìm bài viết</h2>
          <input 
            type="text" 
            placeholder="Search..." 
            className="search-input"
            onChange={handleSearch}
            onKeyDown={(e) => {
              if(e.key === "Enter"){
                handleSearch(e);
              }
            }}
          />
        </div> */}

        {/* {
          (searchResult.length === 0 && (keyword === "" || keyword === null)) 
          ? <p>Không tìm thấy bài viết</p> 
          : <div className="featured-courses-section">
              <h2 className="section-title">Kết quả tìm kiếm</h2>
              <div className="featured-courses-grid">
                {searchResult.map((item, index) => (
                  <div key={index} className="course-card-mini">
                    <div className="course-icon-wrapper">
                      <img src={item.img_url} />
                    </div>
                    <div className="course-card-mini-content">
                      <div className="course-card-mini-title">{item.course_name}</div>
                      <Link to={`course/${item.course_id}`}>
                        <button 
                        className="btn-course-mini"
                        >
                          Học ngay
                      </button>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        } */}

        {/* Khu vực Khóa học nổi bật */}
        <div className="featured-courses-section">
          <h2 className="section-title">Khoá học mới nhất</h2>
          <div className="featured-courses-grid">
            
            {latestCourse.map((item, index) => (
              <div key={index} className="course-card-mini">
                <div className="course-icon-wrapper">
                  <img src={item.img_url} />
                </div>
                <div className="course-card-mini-content">
                  <div className="course-card-mini-title">{item.course_name}</div>
                  <Link to={`course/${item.course_id}`}>
                    <button 
                    className="btn-course-mini"
                    >
                      Học ngay
                  </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
    </div>
  );
}
