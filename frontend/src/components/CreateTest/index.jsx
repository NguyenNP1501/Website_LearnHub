import { useState } from "react";
import "./CreateTest.scss"

function CreateTest(){

  const [questionArray, setQuestionArray] = useState([]);
  //Thêm số lượng câu hỏi
  const handleChangeNumberQuestion = (e) =>{
    const val = parseInt(e.target.value);
    if(val > 0){
      const newQuestions = Array.from({length: val}, ()=>(
        {
          content: "",
          type: 1,
          answer: [
            {content:"", isCorect: false},
            {content:"", isCorect: false}
          ]
      }));
      console.log(val);
      setQuestionArray(newQuestions);
    }
  }
  //Tạo nội dung câu hỏi
  const handleChangeQuestionContent = (qIndex, content)=>{
    if(content !== ""){
      const newQuestions = [...questionArray];
      newQuestions[qIndex].content = content;
      console.log(newQuestions[qIndex].content);
      setQuestionArray(newQuestions);
    }
  }
  //Thay đổi loại câu hỏi
  const handleChangeTypeQuestion = (qIndex, type) => {
    const newQuestions = [...questionArray];
    newQuestions[qIndex].type = parseInt(type);
    setQuestionArray(newQuestions);
  }
  //Tạo số lượng đáp án của một câu hỏi
  const handleChangeNumberAnswer = (qIndex, value)=>{
    const newQuestions = [...questionArray];
    newQuestions[qIndex].answer = Array.from({length: parseInt(value)}, ()=>(
      {
        content: "",
        isCorect: false
      }
    ));
    console.log(newQuestions[qIndex].answer.length);
    setQuestionArray(newQuestions);
  }
  //Tạo đáp án đúng cho loại radio
  const handleCorrectRadio = (qIndex, aIndex)=>{
    const newQuestions = [...questionArray];
    newQuestions[qIndex].answer.forEach((ans, i) => {
      if(i === aIndex){
        ans.isCorect = true;
      }
      else{
        ans.isCorect = false;
      }
    });
    console.log(newQuestions[qIndex].answer[aIndex]);
    setQuestionArray(newQuestions);
    console.log(newQuestions[qIndex].answer[aIndex]);
  }
  //Tạo đáp án đúng cho loại check box
  const handleCorrectCheckbox = (qIndex, aIndex)=>{
    const newQuestions = [...questionArray];
    newQuestions[qIndex].answer[aIndex].isCorect = !newQuestions[qIndex].answer[aIndex].isCorect;
    console.log(newQuestions[qIndex].answer[aIndex]);
    setQuestionArray(newQuestions);
    console.log(newQuestions[qIndex].answer[aIndex]);
  }
  //Thêm nội dung cho câu trả lời
  const handleChangeAnswerContent = (qIndex, aIndex, value)=>{
    const newQuestions = [...questionArray];
    newQuestions[qIndex].answer[aIndex].content = value;
    console.log(newQuestions[qIndex].answer[aIndex].content);
    setQuestionArray(newQuestions);
  }
  //Thêm câu trả lời cho loại textbox
  const handleCorrectAnswer = (qIndex, value)=>{
    const newQuestions = [...questionArray];
    newQuestions[qIndex].answer[0].content = value;
    newQuestions[qIndex].answer[0].isCorect = true;
    console.log(newQuestions[qIndex].answer[0].content);
    console.log(newQuestions[qIndex].answer[0].isCorect);
    console.log(newQuestions[qIndex].answer[0]);
    setQuestionArray(newQuestions);
  }
    return(
        <>
            {/* Các thông tin cần thiết của đề */}
            <div className="section-one">
              <div className="container infomation-test">
                <form className="request row" action={""} method="POST">
                  <div className="request__title col-xl-4">
                    <label htmlFor="title">Tiêu đề:</label>
                    <input  type="text" name="title"></input>
                  </div>
                  <div className="request__subject col-xl-4">
                    <label htmlFor="subject">Môn học:</label>
                    <input  type="text" name="subject"></input>
                  </div>
                  <div className="request__class col-xl-4">
                    <label htmlFor="class">Lớp:</label>
                    <input  type="number" name="class"></input>
                  </div>
                  <div className="request__lesson col-xl-4">
                    <label htmlFor="lesson">Tên bài:</label>
                    <input type="text" name="lesson"></input>
                  </div>
                  <div className="request__lessonid col-xl-4">
                    <label htmlFor="lessonid">Mã bài giảng:</label>
                    <input  type="text" name="lessonid"></input>
                  </div>
                  <div className="request__time col-xl-4">
                    <label htmlFor="time">Thời gian</label>
                    <input  type="number" name="time"></input>
                  </div>
                </form>
            </div>
            </div>
            {/* Tạo câu hỏi */}
            <div className="section-two">
              <div className="container">
                <label htmlFor="">Số lượng câu hỏi cần tạo: </label>
                <input type="number" onChange={handleChangeNumberQuestion}/>
              </div>
              <div className="container">
                <div className="test">
                  <form action="">
                    {questionArray.map((q, qIndex)=>(
                      <div className="test__question" key={qIndex}>
                        <h5 className="test__stt">Câu {qIndex + 1}</h5>
                        <textarea 
                        name="" id="" placeholder="Nhập câu hỏi"
                        value={questionArray[qIndex].content}
                        onChange={(e)=>handleChangeQuestionContent(qIndex, e.target.value)}>
                        </textarea>
                        <select name="" id="" onChange={(e) => handleChangeTypeQuestion(qIndex, e.target.value)}>
                          <option value="1">Một đáp án</option>
                          <option value="2">Nhiều đáp án</option>
                          <option value="3">Điền đáp án</option>
                        </select>
                        {(q.type === 1 || q.type === 2) && (
                          <>
                            <label htmlFor="">Nhập số lượng đáp án:</label>
                            <input
                              className="answer"
                              type="number"
                              onChange={(e) => handleChangeNumberAnswer(qIndex, e.target.value)}
                            ></input>
                            {q.answer.map((a, aIndex)=>(
                              <div key={aIndex}>
                                {q.type === 1 ? (
                                  <div className="answer__box">
                                    <input type="radio" 
                                    onChange={() => handleCorrectRadio(qIndex, aIndex)}/>
                                    <input 
                                    type="text" 
                                    onChange={(e) => handleChangeAnswerContent(qIndex, aIndex, e.target.value)}/>
                                  </div>
                                ):(
                                  <div className="answer__box">
                                    <input type="checkbox" 
                                    onChange={() => handleCorrectCheckbox(qIndex, aIndex)}/>
                                    <input type="text" onChange={(e) => handleChangeAnswerContent(qIndex, aIndex, e.target.value)} />
                                  </div>
                                )}
                              </div>
                            ))}
                          </>
                        )}
                        {q.type === 3 && (
                          <div>
                            <label>Nhập đáp án: </label>
                            <input type="text" 
                            value={q.answer[0]?.content || ""}
                            onChange={(e) => handleCorrectAnswer(qIndex, e.target.value)}/>
                          </div>
                        )}
                      </div>
                    ))}
                    <div className="test__submit">
                      <button>Xuất bản</button>
                      <button>Lưu</button>
                      <button onChange={handlePreview}>Xem trước</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
        </>
    );
}

export default CreateTest;