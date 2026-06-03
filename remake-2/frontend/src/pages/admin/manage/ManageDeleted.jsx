import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ActionNotice from "../../../components/ActionNotice/ActionNotice";
import GoBack from "../../../components/GoBack/GoBack";
import { getAllExams, updateDataExam } from "../../../services/examApi";
import { buildNotice } from "../../../utils/notice";
import "./Manage.scss";

function ManageDeleted() {
  const [exams, setExams] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [notice, setNotice] = useState(null);

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

  const deletedExams = exams.filter((item) => item.deleted === true);

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
      deletedExams.filter((item) =>
        [item.title, item.subject, item.lesson, item.grade]
          .join(" ")
          .toLowerCase()
          .includes(key),
      ),
    );
  };

  const handleRestore = async (exam) => {
    try {
      await updateDataExam(exam.id, {
        ...exam,
        exported: false,
        saved: true,
        deleted: false,
      });
      setNotice(buildNotice("success", "Đề thi đã được khôi phục vào mục đã lưu."));
      await refreshExams();
    } catch (error) {
      setNotice(buildNotice("error", error.message || "Không thể khôi phục đề thi."));
    }
  };

  const handleUndoDelete = async (exam) => {
    try {
      await updateDataExam(exam.id, {
        ...exam,
        exported: false,
        saved: false,
        deleted: false,
      });
      setNotice(buildNotice("success", "Đã bỏ trạng thái xóa cho đề thi."));
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
        <button className="btn__view" onClick={() => handleRestore(exam)}>
          Khôi phục vào mục đã lưu
        </button>
        <button className="btn__fix" onClick={() => handleUndoDelete(exam)}>
          Bỏ trạng thái xóa
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="page">Các đề đã xóa</div>
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

        <div className="list">{deletedExams.map(renderCard)}</div>
      </div>
    </>
  );
}

export default ManageDeleted;
