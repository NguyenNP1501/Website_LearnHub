import { useEffect, useState } from "react";

function Home() {
  return <h2>Trang chủ</h2>;
}

function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/courses")
      .then(res => res.json())
      .then(setCourses);
  }, []);

  return (
    <div>
      <h2>Khoá học</h2>
      {courses.map(c => (
        <div key={c.course_id}>
          {c.course_name}
        </div>
      ))}
    </div>
  );
}

function Exam() {
  return <h2>Phòng thi</h2>;
}

function Discussion() {
  return <h2>Thảo luận</h2>;
}

function Profile() {
  return <h2>Cá nhân</h2>;
}

export default function App() {
  const [page, setPage] = useState("home");

  return (
    <div>
      <nav style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setPage("home")}>Trang chủ</button>
        <button onClick={() => setPage("courses")}>Khoá học</button>
        <button onClick={() => setPage("exam")}>Phòng thi</button>
        <button onClick={() => setPage("discussion")}>Thảo luận</button>
        <button onClick={() => setPage("profile")}>Cá nhân</button>
      </nav>

      <div style={{ marginTop: 20 }}>
        {page === "home" && <Home />}
        {page === "courses" && <Courses />}
        {page === "exam" && <Exam />}
        {page === "discussion" && <Discussion />}
        {page === "profile" && <Profile />}
      </div>
    </div>
  );
}