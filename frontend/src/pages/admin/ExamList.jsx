import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ActionNotice from "../../components/ActionNotice/ActionNotice";
import GoBack from "../../components/GoBack/GoBack";
import { deleteExam, deleteSoftExam, getAllExams } from "../../services/examApi";
import { buildNotice } from "../../utils/notice";
import "./ExamList.scss";

function ExamList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchResults, setSearchResults] = useState([]);
  const [notice, setNotice] = useState(location.state?.notice ?? null);

  const itemsPerPage = 12;

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

  const activeExams = exams.filter((exam) => {
    if (exam.exported === true || exam.saved === true) {
      return exam;
    }
    return null;
  }
  );
  const totalPages = Math.max(1, Math.ceil(activeExams.length / itemsPerPage));
  const currentExams = activeExams.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const refreshExams = async () => {
    const data = await getAllExams();
    setExams(data);
  };

  const handleDeletePermanent = async (id) => {
    try {
      await deleteExam(id);
      setNotice(buildNotice("success", "Đề thi đã được xóa vĩnh viễn."));
      await refreshExams();
    } catch (error) {
      setNotice(
        buildNotice("error", error.message || "Không thể xóa đề thi. Hãy thử lại."),
      );
    }
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
      setNotice(
        buildNotice(
          "error",
          error.message || "Không thể cập nhật trạng thái đề thi. Hãy thử lại.",
        ),
      );
    }
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const key = keyword.trim().toLowerCase();

    if (!key) {
      setSearchResults([]);
      return;
    }

    const filtered = activeExams.filter((item) =>
      [item.title, item.subject, item.lesson, item.grade]
        .join(" ")
        .toLowerCase()
        .includes(key),
    );

    setSearchResults(filtered);
  };

  const countExported = exams.filter((item) => item.exported).length;
  const countSaved = exams.filter((item) => item.saved).length;
  const countDeleted = exams.filter((item) => item.deleted).length;

  const renderExamCard = (exam, allowHardDelete = false) => (
    <div className="list__item" key={exam.id}>
      <h4 className="list__item--title">{exam.title}</h4>
      <p className="list__item--subject">Môn: {exam.subject}</p>
      <p className="list__item--lesson">Bài: {exam.lesson}</p>
      <p className="list__item--grade">Lớp: {exam.grade}</p>
      <p className="list__item--time">Thời gian: {exam.time} phút</p>
      <div className="btn">
        <Link to={`/admin/view/${exam.id}`}>
          <button className="btn__view">Xem</button>
        </Link>
        <Link to={`/admin/edit/${exam.id}`}>
          <button className="btn__fix">Sửa</button>
        </Link>
        <button
          className="btn__del"
          onClick={() =>
            allowHardDelete ? handleDeletePermanent(exam.id) : handleSoftDelete(exam)
          }
        >
          Xóa
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page">Trang quản lý đề thi</div>
      <div className="back-create">
        <GoBack />
      </div>
      <div className="container-fluid">
        <ActionNotice notice={notice} onClose={() => setNotice(null)} />

        <h4 className="section">| Quản lý đề thi</h4>
        <div className="manager">
          <Link to="/admin/exported">
            <div className="manager__exported">Đã xuất bản: {countExported}</div>
          </Link>
          <Link to="/admin/saved">
            <div className="manager__saved">Đã lưu: {countSaved}</div>
          </Link>
          <Link to="/admin/deleted">
            <div className="manager__deleted">Đã xóa: {countDeleted}</div>
          </Link>
        </div>

        <h4 className="section">| Tạo mới và tìm kiếm</h4>
        <div className="create-search">
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

          <Link to="/admin/create">
            <button className="btn__create">Tạo mới đề</button>
          </Link>
        </div>

        {keyword.trim() && (
          <>
            <h4 className="section">| Kết quả tìm kiếm</h4>
            {searchResults.length === 0 ? (
              <p>Không tìm thấy kết quả phù hợp</p>
            ) : (
              <div className="list">
                {searchResults.map((exam) => renderExamCard(exam, true))}
              </div>
            )}
          </>
        )}

        <h4 className="section">| Tất cả đề thi</h4>
        <div className="list">{currentExams.map((exam) => renderExamCard(exam))}</div>

        <div className="pagination">
          <button
            className="btn__view"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          >
            Trước
          </button>
          <button
            className="btn__view"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
          >
            Tiếp
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExamList;
