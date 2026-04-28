import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./ClientExamPages.scss";
import GoBack from "../../components/GoBack/GoBack";
import {
  formatDateTime,
  formatDuration,
  getAttemptById,
} from "../../services/clientExamService";

function ResultExam() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAttempt = async () => {
      try {
        const attemptDetail = await getAttemptById(id);
        if (isMounted) {
          setAttempt(attemptDetail);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message || "Không tìm thấy kết quả phù hợp.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadAttempt();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="result-shell">
        <div className="result-layout">
          <div className="loading-state">Đang tải kết quả bài làm...</div>
        </div>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="result-shell">
        <div className="result-layout">
          <GoBack />
          <div className="empty-state">
            {error || "Không tìn thấy kết quả phù hợp. Hãy vào lịch sử để kiểm tra lại."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="result-shell">
      <div className="result-layout">
        <GoBack />

        <section className="result-summary">
          <div className="result-summary__headline">
            <div>
              <span className="client-tag">{attempt.subject || "Tong hop"}</span>
              <h2>{attempt.examTitle}</h2>
              <p>
                {attempt.lesson || "Không có liên kết bài học"} | Lớp {attempt.grade || "N/A"}
              </p>
              <p>Nộp bài lúc {formatDateTime(attempt.submittedAt)}</p>
            </div>

            <div className="result-score">
              <p>Điểm tổng</p>
              <h1>{attempt.score}/10</h1>
              <p>{attempt.scorePercent}% câu đúng</p>
            </div>
          </div>

          <div className="result-metrics">
            <div className="result-metric">
              <p>Câu đúng</p>
              <strong>
                {attempt.correctCount}/{attempt.totalQuestions}
              </strong>
            </div>
            <div className="result-metric">
              <p>Bỏ trống</p>
              <strong>{attempt.unansweredCount}</strong>
            </div>
            <div className="result-metric">
              <p>Thời gian làm bài</p>
              <strong>{formatDuration(attempt.timeSpentSeconds)}</strong>
            </div>
            <div className="result-metric">
              <p>Thời gian của đề</p>
              <strong>{attempt.timeMinutes} phút</strong>
            </div>
          </div>

          <div className="result-actions">
            <Link to={`/do-exam/${attempt.examId}`}>
              <button className="client-button" type="button">
                Làm lại đề này
              </button>
            </Link>
            <Link to="/history-exam">
              <button className="client-button-secondary" type="button">
                Xem lịch sử
              </button>
            </Link>
            <Link to="/">
              <button className="client-button-ghost" type="button">
                Về danh sách đề
              </button>
            </Link>
          </div>
        </section>

        <section className="result-review">
          <div className="review-list">
            {attempt.questions.map((question) => (
              <article
                className={`review-card${question.isCorrect ? " is-correct" : question.isAnswered ? " is-wrong" : " is-empty"}`}
                key={question.id}
              >
                <h3>
                  Câu {question.index}: {question.content}
                </h3>
                <p>
                  Kết quả:{" "}
                  <strong>
                    {question.isCorrect
                      ? "Đúng"
                      : question.isAnswered
                        ? "Sai"
                        : "Chưa trả lời"}
                  </strong>
                </p>
                <p>
                  Câu trả lời của bạn:{" "}
                  <strong>{question.studentAnswerLabel || "Để trống"}</strong>
                </p>
                <p>
                  Đáp án đúng: <strong>{question.correctAnswer}</strong>
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResultExam;
