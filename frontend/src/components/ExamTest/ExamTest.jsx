import { useEffect, useRef, useState } from "react";
import GoBack from "../GoBack/GoBack";
import "./ExamTest.scss";
import {
  formatDuration,
  getAnsweredCount,
  isObjectiveQuestion,
} from "../../services/clientExamService";

function ExamTest({ data = {}, onSubmit }) {
  const questions = Array.isArray(data.questions) ? data.questions : [];
  const totalQuestions = questions.length;
  const durationSeconds = Math.max(60, Number(data.timeMinutes ?? data.time ?? 0) * 60);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const submitLockRef = useRef(false);

  useEffect(() => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setTimeLeft(durationSeconds);
    submitLockRef.current = false;
  }, [data.id, durationSeconds]);

  useEffect(() => {
    if (totalQuestions === 0) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft((previousTimeLeft) => {
        if (previousTimeLeft <= 1) {
          window.clearInterval(intervalId);

          if (!submitLockRef.current) {
            submitLockRef.current = true;
            onSubmit?.({
              answers,
              timeSpentSeconds: durationSeconds,
              isAutoSubmit: true,
            });
          }

          return 0;
        }

        return previousTimeLeft - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [answers, durationSeconds, onSubmit, totalQuestions]);

  if (totalQuestions === 0) {
    return (
      <div className="exam-shell">
        <div className="exam-layout">
          <GoBack />
          <div className="exam-empty">
            Đề thi này chưa có câu hỏi để học sinh làm bài.
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = getAnsweredCount(answers);

  const handleSubmit = () => {
    if (submitLockRef.current) {
      return;
    }

    submitLockRef.current = true;
    onSubmit?.({
      answers,
      timeSpentSeconds: durationSeconds - timeLeft,
      isAutoSubmit: false,
    });
  };

  return (
    <div className="exam-shell">
      <div className="exam-layout">
        <div className="exam-header">
          <div className="exam-header__top">
            <GoBack />
            <div className="exam-header__actions">
              <button
                className="exam-submit"
                type="button"
                onClick={handleSubmit}
              >
                Nộp bài
              </button>
            </div>
          </div>

          <div className="exam-hero">
            <div className="exam-hero__content">
              <span className="exam-chip">{data.subject || "Tổng hợp"}</span>
              <h1>{data.title || "Đề luyện tập"}</h1>
              <p>
                {data.lesson || "Không có liên kết bài học"} | Lớp {data.grade || "N/A"} |{" "}
                {totalQuestions} câu hỏi
              </p>
            </div>

            <div className="exam-hero__stats">
              <div className="exam-stat">
                <span>Thời gian còn lại</span>
                <strong>{formatDuration(timeLeft)}</strong>
              </div>
              <div className="exam-stat">
                <span>Đã làm</span>
                <strong>
                  {answeredCount}/{totalQuestions}
                </strong>
              </div>
            </div>
          </div>
        </div>

        <div className="exam-main">
          <aside className="exam-sidebar">
            <h3> Câu hỏi</h3>
            <div className="exam-question-nav">
              {questions.map((question, index) => {
                const isActive = index === currentQuestionIndex;
                const isAnswered = Boolean(String(answers[question.id] ?? "").trim());

                return (
                  <button
                    className={`exam-question-nav__item${isActive ? " is-active" : ""}${isAnswered ? " is-answered" : ""}`}
                    key={question.id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(index)}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="exam-card">
            <div className="exam-card__header">
              <span className="exam-chip">Câu {currentQuestionIndex + 1}</span>
              <span className="exam-chip exam-chip--muted">
                {isObjectiveQuestion(currentQuestion)
                  ? "Chọn 1 đáp án"
                  : "Chọn nhiều đáp án"}
              </span>
            </div>

            <h2 className="exam-card__title">{currentQuestion.content}</h2>

            {currentQuestion.imgUrl && (
              <img
                alt={`Minh hoa cau ${currentQuestionIndex + 1}`}
                className="exam-card__image"
                src={currentQuestion.imgUrl}
              />
            )}

            {isObjectiveQuestion(currentQuestion) ? (
              <div className="exam-options">
                {currentQuestion.answers.map((answer, answerIndex) => (
                  <label className="exam-option" key={answer.id}>
                    <input
                      checked={answers[currentQuestion.id] === answer.id}
                      name={currentQuestion.id}
                      type="radio"
                      onChange={() =>
                        setAnswers((currentAnswers) => ({
                          ...currentAnswers,
                          [currentQuestion.id]: answer.id,
                        }))
                      }
                    />
                    <span className="exam-option__badge">
                      {String.fromCharCode(65 + answerIndex)}
                    </span>
                    <span>{answer.content}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="exam-text-answer">
                <input
                  placeholder="Nhap dap an cua ban"
                  type="text"
                  value={answers[currentQuestion.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((currentAnswers) => ({
                      ...currentAnswers,
                      [currentQuestion.id]: event.target.value,
                    }))
                  }
                />
              </div>
            )}

            <div className="exam-footer">
              <button
                className="exam-ghost"
                disabled={currentQuestionIndex === 0}
                type="button"
                onClick={() =>
                  setCurrentQuestionIndex((previousIndex) =>
                    Math.max(0, previousIndex - 1),
                  )
                }
              >
                Câu trước
              </button>

              {currentQuestionIndex < totalQuestions - 1 ? (
                <button
                  className="exam-submit"
                  type="button"
                  onClick={() =>
                    setCurrentQuestionIndex((previousIndex) =>
                      Math.min(totalQuestions - 1, previousIndex + 1),
                    )
                  }
                >
                  Câu tiếp theo
                </button>
              ) : (
                <button
                  className="exam-submit"
                  type="button"
                  onClick={handleSubmit}
                >
                  Hoàn thành bài làm
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ExamTest;
