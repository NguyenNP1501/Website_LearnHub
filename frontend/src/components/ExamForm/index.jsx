import { useEffect, useRef, useState } from "react";
import ActionNotice from "../ActionNotice/ActionNotice";
import "./ExamForm.scss";

const createDefaultAnswer = () => ({
  content: "",
  isCorrect: false,
});

const revokePreviewUrl = (previewUrl) => {
  if (previewUrl?.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl);
  }
};

const createDefaultQuestion = () => ({
  content: "",
  type: 1,
  imgUrl: "",
  previewUrl: "",
  file: null,
  answer: [createDefaultAnswer(), createDefaultAnswer()],
});

const normalizeQuestion = (question = {}) => ({
  id: question.id,
  content: question.content || "",
  type: Number(question.type ?? 1),
  imgUrl: question.imgUrl || "",
  previewUrl: "",
  file: null,
  answer: Array.isArray(question.answer)
    ? question.answer.map((answer) => ({
        id: answer.id,
        content: answer.content || "",
        isCorrect: Boolean(answer.isCorrect),
      }))
    : [createDefaultAnswer(), createDefaultAnswer()],
});

const buildQuestionsState = (nextQuestions = []) =>
  nextQuestions.length
    ? nextQuestions.map(normalizeQuestion)
    : [createDefaultQuestion()];

function ExamForm({ data = {}, onSubmit }) {
  const [title, setTitle] = useState(data.title || "");
  const [subject, setSubject] = useState(data.subject || "");
  const [time, setTime] = useState(data.time || 0);
  const [lesson, setLesson] = useState(data.lesson || "");
  const [lessonId, setLessonId] = useState(data.lessonId || "");
  const [grade, setGrade] = useState(data.grade || 0);
  const [questions, setQuestions] = useState(buildQuestionsState(data.questions));
  const [notice, setNotice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const questionsRef = useRef(questions);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(
    () => () => {
      questionsRef.current.forEach((question) =>
        revokePreviewUrl(question.previewUrl),
      );
    },
    [],
  );

  const updateQuestionAtIndex = (questionIndex, updater) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question, index) =>
        index === questionIndex ? updater(question) : question,
      ),
    );
  };

  const handleNumQues = (value) => {
    const questionCount = Number(value);

    if (!questionCount || questionCount < 1) {
      setQuestions([createDefaultQuestion()]);
      return;
    }

    setQuestions((currentQuestions) => {
      if (questionCount > currentQuestions.length) {
        return [
          ...currentQuestions,
          ...Array.from(
            { length: questionCount - currentQuestions.length },
            () => createDefaultQuestion(),
          ),
        ];
      }

      currentQuestions
        .slice(questionCount)
        .forEach((question) => revokePreviewUrl(question.previewUrl));

      return currentQuestions.slice(0, questionCount);
    });
  };

  const handleChangeContentQues = (value, qIndex) => {
    updateQuestionAtIndex(qIndex, (question) => ({
      ...question,
      content: value,
    }));
  };

  const handleChangeOption = (value, qIndex) => {
    const nextType = Number(value);

    updateQuestionAtIndex(qIndex, (question) => ({
      ...question,
      type: nextType,
      answer:
        nextType === 3
          ? [{ content: question.answer[0]?.content || "", isCorrect: true }]
          : question.answer.length >= 2
            ? question.answer
            : [createDefaultAnswer(), createDefaultAnswer()],
    }));
  };

  const handleChangeNumAns = (value, qIndex) => {
    const totalAnswers = Math.max(2, Number(value) || 2);

    updateQuestionAtIndex(qIndex, (question) => ({
      ...question,
      answer: Array.from({ length: totalAnswers }, (_, index) => ({
        content: question.answer[index]?.content || "",
        isCorrect: question.answer[index]?.isCorrect || false,
      })),
    }));
  };

  const handleChangeContentAns = (value, qIndex, aIndex) => {
    updateQuestionAtIndex(qIndex, (question) => ({
      ...question,
      answer: question.answer.map((answer, index) =>
        index === aIndex ? { ...answer, content: value } : answer,
      ),
    }));
  };

  const handleCorrectRadio = (qIndex, aIndex) => {
    updateQuestionAtIndex(qIndex, (question) => ({
      ...question,
      answer: question.answer.map((answer, index) => ({
        ...answer,
        isCorrect: index === aIndex,
      })),
    }));
  };

  const handleCorrectCheckBox = (qIndex, aIndex) => {
    updateQuestionAtIndex(qIndex, (question) => ({
      ...question,
      answer: question.answer.map((answer, index) =>
        index === aIndex
          ? { ...answer, isCorrect: !answer.isCorrect }
          : answer,
      ),
    }));
  };

//   const handleChangeAns = (value, qIndex) => {
//     updateQuestionAtIndex(qIndex, (question) => ({
//       ...question,
//       answer: [{ content: value, isCorrect: true }],
//     }));
//   };

  const handleChangeImage = (event, qIndex) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    updateQuestionAtIndex(qIndex, (question) => {
      revokePreviewUrl(question.previewUrl);

      return {
        ...question,
        previewUrl,
        file,
      };
    });
  };

  const handleRemoveImage = (qIndex) => {
    updateQuestionAtIndex(qIndex, (question) => {
      revokePreviewUrl(question.previewUrl);

      return {
        ...question,
        imgUrl: "",
        previewUrl: "",
        file: null,
      };
    });
  };

  const buildPayload = (status) => ({
    title,
    subject,
    lesson,
    lessonId,
    time,
    grade,
    exported: status === "exported",
    saved: status === "saved",
    deleted: false,
    questions: questions.map((question) => {
      const nextQuestion = { ...question };
      const nextFile = nextQuestion.file;

      delete nextQuestion.file;
      delete nextQuestion.previewUrl;

      return {
        ...nextQuestion,
        imgUrl: nextQuestion.imgUrl || "",
        answer: nextQuestion.answer.map((answer) => ({
          id: answer.id,
          content: answer.content,
          isCorrect: Boolean(answer.isCorrect),
        })),
        ...(nextFile ? { file: nextFile } : {}),
      };
    }),
  });

  const submitExam = async (status) => {
    setNotice(null);
    setIsSubmitting(true);

    try {
      await onSubmit(buildPayload(status));
    } catch (error) {
      setNotice({
        type: "error",
        message: error.message || "Không thể lưu đề thi. Hãy thử lại.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitExam("exported");
  };

  const handleSaveDraft = async () => {
    await submitExam("saved");
  };

  return (
    <div className="container">
      <form className="exam" onSubmit={handleSubmit}>
        <ActionNotice notice={notice} onClose={() => setNotice(null)} />

        <div className="row">
          <div className="exam__detail col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
            <label>Tiêu đề</label>
            <input
              className="exam__detail--item"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>

          <div className="exam__detail col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
            <label>Môn học</label>
            <input
              className="exam__detail--item"
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
            />
          </div>

          <div className="exam__detail col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
            <label>Tên bài</label>
            <input
              className="exam__detail--item"
              value={lesson}
              onChange={(event) => setLesson(event.target.value)}
            />
          </div>

          <div className="exam__detail col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
            <label>Mã bài</label>
            <input
              className="exam__detail--item"
              value={lessonId}
              onChange={(event) => setLessonId(event.target.value)}
            />
          </div>

          <div className="exam__detail col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
            <label>Khối</label>
            <input
              type="number"
              className="exam__detail--item"
              value={grade}
              onChange={(event) => setGrade(event.target.value)}
            />
          </div>

          <div className="exam__detail col-xl-4 col-lg-4 col-md-6 col-sm-12 col-12">
            <label>Thời gian</label>
            <input
              type="number"
              className="exam__detail--item"
              value={time}
              onChange={(event) => setTime(event.target.value)}
            />
          </div>
        </div>

        <div className="row">
          <div className="exam__detail">
            <p>Nhập số lượng câu hỏi</p>
            <input
              type="number"
              className="exam__detail--item"
              value={questions.length}
              onChange={(event) => handleNumQues(event.target.value)}
            />
          </div>
        </div>

        {questions.map((question, qIndex) => (
          <div className="row" key={question.id || qIndex}>
            <h5>Câu {qIndex + 1}</h5>

            <div className="ques__detail">
              <textarea
                className="ques__detail--item"
                value={question.content}
                onChange={(event) =>
                  handleChangeContentQues(event.target.value, qIndex)
                }
                placeholder="Nội dung câu hỏi"
              />
            </div>
            <p>Tải ảnh (nếu có)</p>
            <div className="ques__detail">
              <input
                type="file"
                accept="image/*"
                className="exam__detail--item"
                onChange={(event) => handleChangeImage(event, qIndex)}
                onClick={(event) => {
                  event.target.value = null;
                }}
              />

              {(question.previewUrl || question.imgUrl) && (
                <div>
                  <img
                    src={question.previewUrl || question.imgUrl}
                    alt="Xem trước"
                    width="150"
                  />
                  <button type="button" onClick={() => handleRemoveImage(qIndex)}>
                    Xóa ảnh
                  </button>
                </div>
              )}
            </div>

            <div className="ques__detail">
                <p>Chọn loại câu hỏi</p>
              <select
                className="exam__detail--item"
                value={question.type}
                onChange={(event) => handleChangeOption(event.target.value, qIndex)}
              >
                <option value={1}>1 đáp án</option>
                <option value={2}>Nhiều đáp án</option>
                {/* <option value={3}>Điền đáp án</option> */}
              </select>
            </div>

            {(question.type === 1 || question.type === 2) && (
              <div className="ques__detail">
                <p>Nhập số lượng đáp án</p>
                <input
                  type="number"
                  className="exam__detail--item"
                  value={question.answer.length}
                  onChange={(event) => handleChangeNumAns(event.target.value, qIndex)}
                />

                {question.answer.map((answer, aIndex) => (
                  <div className="ans__detail" key={answer.id || aIndex}>
                    {question.type === 1 ? (
                      <>
                        <input
                          className="ans__detail--pick"
                          type="radio"
                          name={`q-${qIndex}`}
                          checked={answer.isCorrect}
                          onChange={() => handleCorrectRadio(qIndex, aIndex)}
                        />
                        <input
                          className="ans__detail--content"
                          type="text"
                          value={answer.content}
                          onChange={(event) =>
                            handleChangeContentAns(
                              event.target.value,
                              qIndex,
                              aIndex,
                            )
                          }
                        />
                      </>
                    ) : (
                      <>
                        <input
                          className="ans__detail--pick"
                          type="checkbox"
                          checked={answer.isCorrect}
                          onChange={() => handleCorrectCheckBox(qIndex, aIndex)}
                        />
                        <input
                          className="ans__detail--content"
                          type="text"
                          value={answer.content}
                          onChange={(event) =>
                            handleChangeContentAns(
                              event.target.value,
                              qIndex,
                              aIndex,
                            )
                          }
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* {question.type === 3 && (
              <div className="ques__detail">
                <input
                  className="exam__detail--fill"
                  placeholder="Đáp án"
                  value={question.answer[0]?.content || ""}
                  onChange={(event) => handleChangeAns(event.target.value, qIndex)}
                />
              </div>
            )} */}
          </div>
        ))}

        <div className="btn__feature">
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Xuất bản"}
          </button>
          <button type="button" onClick={handleSaveDraft} disabled={isSubmitting}>
            Lưu tạm
          </button>
          {/* <button type="button" disabled={isSubmitting}>
            Xem trước
          </button> */}
        </div>
      </form>
    </div>
  );
}

export default ExamForm;
