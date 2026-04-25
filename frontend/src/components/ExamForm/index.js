import { useState } from "react";
import "./ExamForm.scss";

const createDefaultQuestion = () => ({
  content: "",
  type: 1,
  imgUrl: "",
  answer: [
    { content: "", isCorrect: false },
    { content: "", isCorrect: false },
  ],
});

function ExamForm({ data = {}, onSubmit }) {
  const [title, setTitle] = useState(data.title || "");
  const [subject, setSubject] = useState(data.subject || "");
  const [time, setTime] = useState(data.time || 0);
  const [lesson, setLesson] = useState(data.lesson || "");
  const [lessonId, setLessonId] = useState(data.lessonId || "");
  const [grade, setGrade] = useState(data.grade || 0);
  const [questions, setQuestions] = useState(
    data.questions?.length ? data.questions : [createDefaultQuestion()],
  );

  const handleNumQues = (value) => {
    const questionCount = Number(value);
    if (!questionCount || questionCount < 1) {
      setQuestions([createDefaultQuestion()]);
      return;
    }

    if (questionCount > questions.length) {
      setQuestions([
        ...questions,
        ...Array.from(
          { length: questionCount - questions.length },
          () => createDefaultQuestion(),
        ),
      ]);
      return;
    }

    setQuestions((currentQuestions) => currentQuestions.slice(0, questionCount));
  };

  const handleChangeContentQues = (value, qIndex) => {
    const nextQuestions = [...questions];
    nextQuestions[qIndex].content = value;
    setQuestions(nextQuestions);
  };

  const handleChangeOption = (value, qIndex) => {
    const nextQuestions = [...questions];
    nextQuestions[qIndex].type = Number(value);
    if (Number(value) === 3 && nextQuestions[qIndex].answer.length !== 1) {
      nextQuestions[qIndex].answer = [{ content: "", isCorrect: true }];
    }
    setQuestions(nextQuestions);
  };

  const handleChangeNumAns = (value, qIndex) => {
    const totalAnswers = Math.max(2, Number(value) || 2);
    const nextQuestions = [...questions];

    nextQuestions[qIndex].answer = Array.from({ length: totalAnswers }, (_, index) => ({
      content: nextQuestions[qIndex].answer[index]?.content || "",
      isCorrect: nextQuestions[qIndex].answer[index]?.isCorrect || false,
    }));

    setQuestions(nextQuestions);
  };

  const handleChangeContentAns = (value, qIndex, aIndex) => {
    const nextQuestions = [...questions];
    nextQuestions[qIndex].answer[aIndex].content = value;
    setQuestions(nextQuestions);
  };

  const handelCorrectRadio = (qIndex, aIndex) => {
    const nextQuestions = [...questions];
    nextQuestions[qIndex].answer.forEach((answer, index) => {
      answer.isCorrect = index === aIndex;
    });
    setQuestions(nextQuestions);
  };

  const handelCorrectCheckBox = (qIndex, aIndex) => {
    const nextQuestions = [...questions];
    nextQuestions[qIndex].answer[aIndex].isCorrect =
      !nextQuestions[qIndex].answer[aIndex].isCorrect;
    setQuestions(nextQuestions);
  };

  const handleChangeAns = (value, qIndex) => {
    const nextQuestions = [...questions];
    nextQuestions[qIndex].answer = [{ content: value, isCorrect: true }];
    setQuestions(nextQuestions);
  };

  const handleChangeImage = (event, qIndex) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const nextQuestions = [...questions];
    if (nextQuestions[qIndex].imgUrl) {
      URL.revokeObjectURL(nextQuestions[qIndex].imgUrl);
    }

    nextQuestions[qIndex].imgUrl = URL.createObjectURL(file);
    nextQuestions[qIndex].file = file;
    setQuestions(nextQuestions);
  };

  const handleRemoveImage = (qIndex) => {
    const nextQuestions = [...questions];
    if (nextQuestions[qIndex].imgUrl) {
      URL.revokeObjectURL(nextQuestions[qIndex].imgUrl);
    }

    nextQuestions[qIndex].imgUrl = "";
    nextQuestions[qIndex].file = null;
    setQuestions(nextQuestions);
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
    questions,
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(buildPayload("exported"));
  };

  const handleSaveDraft = async () => {
    await onSubmit(buildPayload("saved"));
  };

  return (
    <div className="container">
      <form className="exam" onSubmit={handleSubmit}>
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
            <label>Thoi gian</label>
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
            <label>Nhập số lượng câu hỏi</label>
            <input
              type="number"
              className="exam__detail--item"
              onChange={(event) => handleNumQues(event.target.value)}
            />
          </div>
        </div>

        {questions.map((question, qIndex) => (
          <div className="row" key={qIndex}>
            <h5>Câu {qIndex + 1}</h5>

            <div className="ques__detail">
              <textarea
                className="ques__detail--item"
                value={question.content}
                onChange={(event) =>
                  handleChangeContentQues(event.target.value, qIndex)
                }
                placeholder="Noi dung cau hoi"
              />
            </div>

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

              {question.imgUrl && (
                <div>
                  <img src={question.imgUrl} alt="preview" width="150" />
                  <button type="button" onClick={() => handleRemoveImage(qIndex)}>
                    Xoa anh
                  </button>
                </div>
              )}
            </div>

            <div className="ques__detail">
              <select
                className="exam__detail--item"
                value={question.type}
                onChange={(event) => handleChangeOption(event.target.value, qIndex)}
              >
                <option value={1}>1 đáp án</option>
                <option value={2}>Nhiều đáp án</option>
                <option value={3}>Điền  đáp án</option>
              </select>
            </div>

            {(question.type === 1 || question.type === 2) && (
              <div className="ques__detail">
                <input
                  type="number"
                  className="exam__detail--item"
                  value={question.answer.length}
                  onChange={(event) => handleChangeNumAns(event.target.value, qIndex)}
                />

                {question.answer.map((answer, aIndex) => (
                  <div className="ans__detail" key={aIndex}>
                    {question.type === 1 ? (
                      <>
                        <input
                          className="ans__detail--pick"
                          type="radio"
                          name={`q-${qIndex}`}
                          checked={answer.isCorrect}
                          onChange={() => handelCorrectRadio(qIndex, aIndex)}
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
                          onChange={() => handelCorrectCheckBox(qIndex, aIndex)}
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

            {question.type === 3 && (
              <div className="ques__detail">
                <input
                  className="exam__detail--fill"
                  placeholder="Dap an"
                  value={question.answer[0]?.content || ""}
                  onChange={(event) => handleChangeAns(event.target.value, qIndex)}
                />
              </div>
            )}
          </div>
        ))}

        <div className="btn__feature">
          <button type="submit">Xuất bản</button>
          <button type="button" onClick={handleSaveDraft}>
            Lưu tạm<main></main>
          </button>
          <button type="button">Xem trước</button>
        </div>
      </form>
    </div>
  );
}

export default ExamForm;
