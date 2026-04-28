import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ClientExamPages.scss";
import { getAvailableClientExams } from "../../services/clientExamService";

const EXAMS_PER_SECTION = 3;

const getSectionLabel = (sectionKey) => {
  switch (sectionKey) {
    case "primary":
      return "Tiểu học";
    case "secondary":
      return "THCS";
    case "highschool":
      return "THPT";
    default:
      return "Khác";
  }
};

const groupExamBySection = (exam) => {
  const grade = Number(exam.grade);

  if (grade >= 1 && grade <= 5) {
    return "primary";
  }

  if (grade >= 6 && grade <= 9) {
    return "secondary";
  }

  if (grade >= 10 && grade <= 12) {
    return "highschool";
  }

  return "other";
};

function SearchExam() {
  const [keyword, setKeyword] = useState("");
  const [allExams, setAllExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pages, setPages] = useState({
    primary: 1,
    secondary: 1,
    highschool: 1,
    other: 1,
  });

  useEffect(() => {
    let isMounted = true;

    const loadExams = async () => {
      try {
        const exams = await getAvailableClientExams();
        if (isMounted) {
          setAllExams(exams);
          setError("");
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Không thể tải danh sách đề.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadExams();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();

    const nextKeyword = keyword.trim().toLowerCase();
    if (!nextKeyword) {
      setFilteredExams([]);
      setIsSearching(false);
      return;
    }

    const results = allExams.filter((exam) =>
      [exam.title, exam.subject, exam.lesson, exam.grade]
        .join(" ")
        .toLowerCase()
        .includes(nextKeyword),
    );

    setFilteredExams(results);
    setIsSearching(true);
  };

  const sectionedExams = {
    highschool: allExams.filter((exam) => groupExamBySection(exam) === "highschool"),
    secondary: allExams.filter((exam) => groupExamBySection(exam) === "secondary"),
    primary: allExams.filter((exam) => groupExamBySection(exam) === "primary"),
    other: allExams.filter((exam) => groupExamBySection(exam) === "other"),
  };

  const renderExamCard = (exam) => (
    <article className="exam-card" key={exam.id}>
      <div className="client-tag-list">
        <span className="client-tag">{exam.subject || "Tổng hợp"}</span>
        <span className="client-tag">{exam.grade ? `Lớp ${exam.grade}` : "Không thể xem lớp"}</span>
      </div>
      <h3 className="exam-card__title">{exam.title || "Đề luyện tập"}</h3>
      <div className="exam-card__meta">
        <span>Bài: {exam.lesson || "Đang cập nhật"}</span>
        <span>Thời gian: {exam.timeMinutes} phút</span>
        <span>Số câu: {exam.questionCount ?? exam.questions?.length ?? 0}</span>
      </div>
      <div className="exam-card__actions">
        <Link to={`/do-exam/${exam.id}`}>
          <button className="client-button" type="button">
            Làm bài
          </button>
        </Link>
      </div>
    </article>
  );

  return (
    <section className="client-panel">
      <div className="client-toolbar">
        <div>
          <h2 className="client-section__title">Tìm kiếm đề luyện</h2>
          <p className="client-section__hint">
            Chọn đề phù hợp và bắt đầu làm bài ngay.
          </p>
        </div>
      </div>

      <form className="client-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Nhập tên đề môn học bài học"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <button className="client-button" type="submit">
          Tìm
        </button>
        {isSearching && (
          <button
            className="client-button-secondary"
            type="button"
            onClick={() => {
              setKeyword("");
              setFilteredExams([]);
              setIsSearching(false);
            }}
          >
            Xoá bộ lọc
          </button>
        )}
      </form>

      {loading && <div className="loading-state">Đang tải danh sách đề...</div>}
      {!loading && error && <div className="error-state">{error}</div>}

      {!loading && !error && isSearching && (
        <section className="client-section">
          <div className="client-section__header">
            <h3 className="client-section__title">Kết quả tìm kiếm</h3>
            <p className="client-section__hint">
              {filteredExams.length} kết quả phù hợp với từ khoá"{keyword.trim()}"
            </p>
          </div>

          {filteredExams.length === 0 ? (
            <div className="empty-state">
              Không tìm thấy kết quả phù hợp. Hãy tìm kiếm bằng từ khoá khác.
            </div>
          ) : (
            <div className="exam-grid">{filteredExams.map(renderExamCard)}</div>
          )}
        </section>
      )}

      {!loading &&
        !error &&
        !isSearching &&
        ["highschool", "secondary", "primary", "other"].map((sectionKey) => {
          const sectionExams = sectionedExams[sectionKey];
          const totalPages = Math.max(
            1,
            Math.ceil(sectionExams.length / EXAMS_PER_SECTION),
          );
          const currentPage = Math.min(pages[sectionKey], totalPages);
          const startIndex = (currentPage - 1) * EXAMS_PER_SECTION;
          const currentItems = sectionExams.slice(
            startIndex,
            startIndex + EXAMS_PER_SECTION,
          );

          if (sectionExams.length === 0) {
            return null;
          }

          return (
            <section className="client-section" key={sectionKey}>
              <div className="client-section__header">
                <h3 className="client-section__title">
                  {getSectionLabel(sectionKey)}
                </h3>
                <p className="client-section__hint">
                  Trang {currentPage}/{totalPages}
                </p>
              </div>

              <div className="exam-grid">{currentItems.map(renderExamCard)}</div>

              <div className="pagination-row">
                <div className="exam-card__actions">
                  <button
                    className="client-button-secondary"
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setPages((currentPages) => ({
                        ...currentPages,
                        [sectionKey]: Math.max(1, currentPages[sectionKey] - 1),
                      }))
                    }
                  >
                    Trang trước
                  </button>
                  <button
                    className="client-button-secondary"
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() =>
                      setPages((currentPages) => ({
                        ...currentPages,
                        [sectionKey]: Math.min(
                          totalPages,
                          currentPages[sectionKey] + 1,
                        ),
                      }))
                    }
                  >
                    Trang sau
                  </button>
                </div>
              </div>
            </section>
          );
        })}
    </section>
  );
}

export default SearchExam;
