import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAllExams, updateDataExam } from "../../../services/examApi";
import GoBack from "../../../components/GoBack/GoBack";
import "./Manage.scss";

function ManageDeleted() {
  const [exams, setExams] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);

  const loadData = async () => {
    const data = await getAllExams();
    setExams(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const deletedExams = useMemo(
    () => exams.filter((item) => item.deleted === true),
    [exams],
  );

  const handleSearch = (event) => {
    event.preventDefault();
    const key = keyword.trim().toLowerCase();

    if (!key) {
      setResults([]);
      return;
    }

    setResults(
      deletedExams.filter((item) =>
        [item.title, item.subject, item.lesson, item.grade]
          .join(" ")
          .toLowerCase()
          .includes(key),
      ),
    );
  };

  const handleRestore = async (exam) => {
    await updateDataExam(exam.id, {
      ...exam,
      exported: false,
      saved: true,
      deleted: false,
    });
    await loadData();
  };

  const handleUndoDelete = async (exam) => {
    await updateDataExam(exam.id, {
      ...exam,
      exported: false,
      saved: false,
      deleted: false,
    });
    await loadData();
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
        <button className="btn__view" onClick={() => handleRestore(exam)}>
          Khôi phục vào Saved
        </button>
        <button className="btn__fix" onClick={() => handleUndoDelete(exam)}>
          Bỏ trạng thái xoá
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="page">Các đề đã xoá </div>
      <GoBack />
      <div className="container-fluid">
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

        <div className="list">{deletedExams.map(renderCard)}</div>
      </div>
    </>
  );
}

export default ManageDeleted;
