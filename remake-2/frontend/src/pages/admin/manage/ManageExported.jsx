import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ActionNotice from "../../../components/ActionNotice/ActionNotice";
import GoBack from "../../../components/GoBack/GoBack";
import { deleteSoftExam, getAllExams } from "../../../services/examApi";
import { buildNotice } from "../../../utils/notice";
import "./Manage.scss";

function ManageExported() {
  const location = useLocation();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [notice, setNotice] = useState(location.state?.notice ?? null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const data = await getAllExams();
      if (isMounted) {
        setExams(data);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const nextNotice = location.state?.notice;

    if (!nextNotice) {
      return;
    }

    queueMicrotask(() => {
      setNotice(nextNotice);
      navigate(location.pathname, { replace: true, state: {} });
    });
  }, [location.pathname, location.state, navigate]);

  const exportedExams = exams.filter(
    (item) => item.exported === true && item.deleted === false,
  );

  const refreshExams = async () => {
    const data = await getAllExams();
    setExams(data);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const key = keyword.trim().toLowerCase();

    if (!key) {
      setResults([]);
      return;
    }

    setResults(
      exportedExams.filter((item) =>
        [item.title, item.subject, item.lesson, item.grade]
          .join(" ")
          .toLowerCase()
          .includes(key),
      ),
    );
  };

  const handleSoftDelete = async (exam) => {
    try {
      await deleteSoftExam(exam.id, {
        ...exam,
        exported: false,
        saved: false,
        deleted: true,
      });
      setNotice(buildNotice("success", "Đề thi đã được chuyển vào mục đã xóa."));
      await refreshExams();
    } catch (error) {
      setNotice(buildNotice("error", error.message || "Không thể cập nhật đề thi."));
    }
  };

  const renderCard = (exam) => (
    <div className="list__item" key={exam.id}>
      <h4 className="list__item--title">{exam.title}</h4>
      <p className="list__item--subject">Môn: {exam.subject}</p>
      <p className="list__item--lesson">Bài: {exam.lesson}</p>
      <p className="list__item--time">Thời gian: {exam.time} phút</p>
      <div className="btn">
        <Link to={`/admin/view/${exam.id}`}>
          <button className="btn__view">Xem</button>
        </Link>
        <Link to={`/admin/edit/${exam.id}`}>
          <button className="btn__fix">Sửa</button>
        </Link>
        <button className="btn__del" onClick={() => handleSoftDelete(exam)}>
          Xóa
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="page">Các đề đã xuất bản</div>
      <GoBack />
      <div className="container-fluid">
        <ActionNotice notice={notice} onClose={() => setNotice(null)} />

        <form onSubmit={handleSearch} className="inner-wrap">
          <input
            className="search__box"
            type="text"
            placeholder="Nhập tên đề, môn học, lớp..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button className="btn__search" type="submit">
            Tìm
          </button>
        </form>

        {keyword.trim() && (
          <>
            {results.length === 0 ? (
              <p>Không tìm thấy kết quả phù hợp</p>
            ) : (
              <div className="list">{results.map(renderCard)}</div>
            )}
          </>
        )}

        <div className="list">{exportedExams.map(renderCard)}</div>
      </div>
    </>
  );
}

export default ManageExported;
