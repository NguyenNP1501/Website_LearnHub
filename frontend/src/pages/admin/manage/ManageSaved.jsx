import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deleteSoftExam, getAllExams, updateDataExam } from "../../../services/examApi";
import GoBack from "../../../components/GoBack/GoBack";
import "./Manage.scss";

function ManageSaved() {
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

  const savedExams = useMemo(
    () => exams.filter((item) => item.saved === true && item.deleted === false),
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
      savedExams.filter((item) =>
        [item.title, item.subject, item.lesson, item.grade]
          .join(" ")
          .toLowerCase()
          .includes(key),
      ),
    );
  };

  const handleSoftDelete = async (exam) => {
    await deleteSoftExam(exam.id, {
      ...exam,
      exported: false,
      saved: false,
      deleted: true,
    });
    await loadData();
  };

  const handleExport = async (exam) => {
    await updateDataExam(exam.id, {
      ...exam,
      exported: true,
      saved: false,
      deleted: false,
    });
    await loadData();
  };

  const renderCard = (exam) => (
    <div className="list__item" key={exam.id}>
      <h4 className="list__item--title">{exam.title}</h4>
      <p className="list__item--subject">Mon: {exam.subject}</p>
      <p className="list__item--lesson">Bai: {exam.lesson}</p>
      <p className="list__item--time">Thoi gian: {exam.time} phut</p>
      <div className="btn">
        <Link to={`/admin/view/${exam.id}`}>
          <button className="btn__view">Xem</button>
        </Link>
        <button className="btn__view" onClick={() => handleExport(exam)}>
          Xuất bản
        </button>
        <Link to={`/admin/edit/${exam.id}`}>
          <button className="btn__fix">Sửa</button>
        </Link>
        <button className="btn__del" onClick={() => handleSoftDelete(exam)}>
          Xoá
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="page">Các đề đã lưu</div>
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

        <div className="list">{savedExams.map(renderCard)}</div>
      </div>
    </>
  );
}

export default ManageSaved;
