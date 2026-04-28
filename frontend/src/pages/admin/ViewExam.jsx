import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getExamById } from "../../services/examApi";
import GoBack from "../../components/GoBack/GoBack";
import "./ViewExam.scss";

function ViewExam() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);

  useEffect(() => {
    getExamById(id).then(setExam);
  }, [id]);

  if (!exam) return <p>Loading...</p>;

  return (
    <div>
      <div className="page">Trang xem đề thi</div>
      <GoBack></GoBack>
      <div className="exam">
        <h3 className="exam__title">{exam.title}</h3>
        <div>
          <span className="exam__subject">Môn: {exam.subject}</span>
          -
          <span className="exam__grade">Lớp {exam.grade}</span>
        </div>
        <i className="exam__time">Thời gian làm bài: {exam.time}</i>
        <div className="ques">
          {exam.questions.map((qItem, qIndex) => (
            <div className="ques__detail" key={qIndex}>
              <h5 className="ques__detail--number">Câu {qIndex + 1}:</h5>
              <p className="ques__detail--content">{qItem.content}</p>
              {qItem.imgUrl && (
                <img 
                src={qItem.imgUrl} 
                alt="Ảnh đề bài" 
                className="ques__detail--imgUrl"/>
              )}
              <p className="ques__detail--type">{qItem.type}</p>
              {qItem.type === 1 &&
                qItem.answer.map((aItem, aIndex) => (
                  <div className="ans__item" key={aIndex}>
                    <input
                      className="ans__item--pick"
                      type="radio"
                      name={`q-${qIndex}`}
                      checked={aItem.isCorrect}
                      readOnly
                    />
                    <p className="ans__item--content">
                      {aItem.content}
                    </p>
                  </div>
                ))}

                {qItem.type === 2 &&
                qItem.answer.map((aItem, aIndex) => (
                  <div className="ans__item" key={aIndex}>
                    <input
                      className="ans__item--choose"
                      type="checkbox"
                      checked={aItem.isCorrect}
                      readOnly
                    />
                    <p className="ans__item--content">
                      {aItem.content}
                    </p>
                  </div>
                ))}

                {qItem.type === 3 &&
                qItem.answer.map((aItem, aIndex) => (
                  <div className="ans__item" key={aIndex}>
                    <p className="ans__item--content">
                      {aItem.content}
                    </p>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ViewExam;
