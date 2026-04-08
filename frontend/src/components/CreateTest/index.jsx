import { useState } from "react";
import "./CreateTest.scss";
import PreviewTest from "../PreviewTest";

function CreateTest() {

  const [questionArray, setQuestionArray] = useState([]);
  const [showPreview, setShowPreview] = useState(false);

  const [testInfo, setTestInfo] = useState({
    title: "",
    subject: "",
    class: "",
    lesson: "",
    lessonid: "",
    time: ""
  });

  const handleChangeInfo = (e) => {
    const { name, value } = e.target;
    setTestInfo({
      ...testInfo,
      [name]: value
    });
  };

  //Submit ra JSON
  const handleSubmitTest = (e) => {
    e.preventDefault();

    const dataSubmit = {
      ...testInfo,
      questions: questionArray
    };

    console.log("DATA SUBMIT:", dataSubmit);

  };

  //Tạo số câu hỏi
  const handleChangeNumberQuestion = (e) => {
    const val = parseInt(e.target.value);
    if (val > 0) {
      const newQuestions = Array.from({ length: val }, () => ({
        content: "",
        image: "",
        type: 1,
        answer: [
          { content: "", isCorect: false },
          { content: "", isCorect: false }
        ]
      }));
      setQuestionArray(newQuestions);
    }
  };

  //Thêm nội dung cho câu hỏi
  const handleChangeQuestionContent = (qIndex, content) => {
    const newQuestions = [...questionArray];
    newQuestions[qIndex].content = content;
    setQuestionArray(newQuestions);
  };

  //Đường dẫn ảnh cho câu hỏi
  const handleChangeQuestionImage = (qIndex, image) => {
    const newQuestions = [...questionArray];
    newQuestions[qIndex].image = image;
    setQuestionArray(newQuestions);
  };

  //Thiết lập loại câu hỏi
  const handleChangeTypeQuestion = (qIndex, type) => {
    const newQuestions = [...questionArray];
    newQuestions[qIndex].type = parseInt(type);
    setQuestionArray(newQuestions);
  };

  //Thêm số đáp án cho câu hỏi
  const handleChangeNumberAnswer = (qIndex, value) => {
    const newQuestions = [...questionArray];
    newQuestions[qIndex].answer = Array.from(
      { length: parseInt(value) },
      () => ({
        content: "",
        isCorect: false
      })
    );
    setQuestionArray(newQuestions);
  };

  //Tạo đáp án đúng cho loại 1 đáp 
  const handleCorrectRadio = (qIndex, aIndex) => {
    const newQuestions = [...questionArray];
    newQuestions[qIndex].answer.forEach((ans, i) => {
      if(i === aIndex){
        ans.isCorect = true;
      }
      else{
        ans.isCorect = false;
      }
    });
    setQuestionArray(newQuestions);
  };

  //Tạo đáp án đúng cho câu hỏi nhiều đáp án
  const handleCorrectCheckbox = (qIndex, aIndex) => {
    const newQuestions = [...questionArray];
    newQuestions[qIndex].answer[aIndex].isCorect =
      !newQuestions[qIndex].answer[aIndex].isCorect;
    setQuestionArray(newQuestions);
  };

  //Thêm nội dung cho đáp án
  const handleChangeAnswerContent = (qIndex, aIndex, value) => {
    const newQuestions = [...questionArray];
    newQuestions[qIndex].answer[aIndex].content = value;
    setQuestionArray(newQuestions);
  };

  //Thêm đáp án đúng cho câu hỏi điền đáp án
  const handleCorrectAnswer = (qIndex, value) => {
    const newQuestions = [...questionArray];
    newQuestions[qIndex].answer[0].content = value;
    newQuestions[qIndex].answer[0].isCorect = true;
    setQuestionArray(newQuestions);
  };


  return (
    <>
      <form onSubmit={handleSubmitTest}>

        <div className="section-one">
          <div className="container infomation-test">
            <div className="request row">

              <div className="col-xl-4">
                <label>Tiêu đề:</label>
                <input name="title" onChange={handleChangeInfo} />
              </div>

              <div className="col-xl-4">
                <label>Môn học:</label>
                <input name="subject" onChange={handleChangeInfo} />
              </div>

              <div className="col-xl-4">
                <label>Lớp:</label>
                <input name="class" type="number" onChange={handleChangeInfo} />
              </div>

              <div className="col-xl-4">
                <label>Tên bài:</label>
                <input name="lesson" onChange={handleChangeInfo} />
              </div>

              <div className="col-xl-4">
                <label>Mã bài giảng:</label>
                <input name="lessonid" onChange={handleChangeInfo} />
              </div>

              <div className="col-xl-4">
                <label>Thời gian:</label>
                <input name="time" type="number" onChange={handleChangeInfo} />
              </div>

            </div>
          </div>
        </div>

        <div className="section-two">
          <div className="container">
            <label>Số lượng câu hỏi:</label>
            <input type="number" onChange={handleChangeNumberQuestion} />
          </div>

          <div className="container">
            {questionArray.map((q, qIndex) => (
              <div key={qIndex} className="test__question">

                <h5>Câu {qIndex + 1}</h5>

                <textarea
                  value={q.content}
                  onChange={(e) =>
                    handleChangeQuestionContent(qIndex, e.target.value)
                  }
                />

                <input
                  placeholder="Image URL"
                  onChange={(e) =>
                    handleChangeQuestionImage(qIndex, e.target.value)
                  }
                />

                <select onChange={(e) =>
                  handleChangeTypeQuestion(qIndex, e.target.value)
                }>
                  <option value="1">1 đáp án</option>
                  <option value="2">Nhiều đáp án</option>
                  <option value="3">Điền</option>
                </select>

                {(q.type === 1 || q.type === 2) && (
                  <>
                    <input
                      type="number"
                      placeholder="Số đáp án"
                      onChange={(e) =>
                        handleChangeNumberAnswer(qIndex, e.target.value)
                      }
                    />

                    {q.answer.map((a, aIndex) => (
                      <div key={aIndex}>
                        {q.type === 1 ? (
                          <>
                            <input
                              type="radio"
                              name={`q-${qIndex}`}
                              onChange={() =>
                                handleCorrectRadio(qIndex, aIndex)
                              }
                            />
                            <input
                              onChange={(e) =>
                                handleChangeAnswerContent(
                                  qIndex,
                                  aIndex,
                                  e.target.value
                                )
                              }
                            />
                          </>
                        ) : (
                          <>
                            <input
                              type="checkbox"
                              onChange={() =>
                                handleCorrectCheckbox(qIndex, aIndex)
                              }
                            />
                            <input
                              onChange={(e) =>
                                handleChangeAnswerContent(
                                  qIndex,
                                  aIndex,
                                  e.target.value
                                )
                              }
                            />
                          </>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {q.type === 3 && (
                  <input
                    value={q.answer[0]?.content || ""}
                    onChange={(e) =>
                      handleCorrectAnswer(qIndex, e.target.value)
                    }
                  />
                )}
              </div>
            ))}
          </div>

          <div className="test__submit">
            <button type="submit">Xuất bản</button>
            <button type="button">Lưu</button>
            <button type="button" onClick={() => setShowPreview(true)}>
              Xem trước
            </button>
          </div>
        </div>
      </form>

      {/* PREVIEW */}
      {showPreview && (
        <PreviewTest
          data={questionArray}
          onClose={() => setShowPreview(false)}
        />
      )}
    </>
  );
}

export default CreateTest;
