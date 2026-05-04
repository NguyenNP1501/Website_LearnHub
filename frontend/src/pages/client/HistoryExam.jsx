import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./ClientExamPage.scss";
import {
  deleteAttempt,
  formatDateTime,
  formatDuration,
  getAttempts,
} from "../../services/clientExamService";
import Header from "../../components/Header/index";

function HistoryExam() {
  const [keyword, setKeyword] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        setLoading(true);
        const history = await getAttempts();
        setAttempts(history);
      } catch (loadError) {
        setError(loadError.message || "Không thể tải lịch sử làm bài.");
      } finally {
        setLoading(false);
      }
    };

    loadAttempts();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();

    try {
      setLoading(true);
      const history = await getAttempts(keyword.trim());
      setAttempts(history);
      setError("");
    } catch (loadError) {
      setError(loadError.message || "Không thể tải lịch sử làm bài.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttempt = async (attemptId) => {
    try {
      await deleteAttempt(attemptId);
      const history = await getAttempts(keyword.trim());
      setAttempts(history);
    } catch (deleteError) {
      setError(deleteError.message || "Không thể xoá.");
    }
  };

  const attemptList = attempts;

  return (
    <>
      <Header></Header>
      <section className="client-panel">
        <div className="client-toolbar">
          <div>
            <h2 className="client-section__title">Lịch sử làm bài</h2>
            <p className="client-section__hint">
              Xem lại kết quả, làm lại đề.
            </p>
          </div>
        </div>

        <form className="client-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Nhập tên đề, bài học, môn học, lớp,..."
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
          <button className="client-button" type="submit">
            Tìm
          </button>
          <button
            className="client-button-secondary"
            type="button"
            onClick={async () => {
              try {
                setKeyword("");
                setLoading(true);
                const history = await getAttempts();
                setAttempts(history);
                setError("");
              } catch (loadError) {
                setError(loadError.message || "Không thể tải lịch sử làm bài.");
              } finally {
                setLoading(false);
              }
            }}
          >
            Tải lại
          </button>
        </form>

        {loading && <div className="loading-state">Đang tải lịch sử làm bài...</div>}
        {!loading && error && <div className="error-state">{error}</div>}

        {!loading && attemptList.length === 0 && (
          <div className="empty-state">
            {!keyword.trim() ? (
              <>
                Bạn chưa có lần nộp nào. <Link to="/">Chọn đề để bắt đầu.</Link>
              </>
            ) : (
              "Không có kết quả phù hợp"
            )}
          </div>
        )}

        {!loading && attemptList.length > 0 && (
          <div className="history-table">
            {attemptList.map((attempt) => (
              <article className="history-row" key={attempt.id}>
                <div className="history-row__main">
                  <h3 className="history-row__title">{attempt.examTitle}</h3>
                  <p className="history-row__muted">
                    {attempt.subject || "Tổng hợp"} | {attempt.lesson || "Không có bài học"}
                  </p>
                  <p className="history-row__muted">
                    Lớp {attempt.grade || "N/A"} | Nộp bài lúc {formatDateTime(attempt.submittedAt)}
                  </p>
                </div>

                <div className="history-row__score">
                  <strong>{attempt.score}/10</strong>
                  <span>
                    {attempt.correctCount}/{attempt.totalQuestions} câu đúng
                  </span>
                  <span>Làm bài: {formatDuration(attempt.timeSpentSeconds)}</span>
                </div>

                <div className="history-row__actions">
                  <Link to={`/result-exam/${attempt.id}`}>
                    <button className="client-button" type="button">
                      Xem kết quả
                    </button>
                  </Link>
                  <Link to={`/do-exam/${attempt.examId}`}>
                    <button className="client-button-ghost" type="button">
                      Làm lại
                    </button>
                  </Link>
                  <button
                    className="client-button-danger"
                    type="button"
                    onClick={() => handleDeleteAttempt(attempt.id)}
                  >
                    Xoá
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export default HistoryExam;
