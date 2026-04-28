import { useState } from "react";
import "./ViewExamClient.scss";
import SearchExam from "./SearchExam";
import HistoryExam from "./HistoryExam";

function ViewExamClient() {
  const [activeTab, setActiveTab] = useState("search");

  return (
    <>
      <div className="page">Phòng luyện đề</div>
      <div className="container-around">
        <div className="tab">
          <div className="sidebar">
            <ul className="menu">
              <li
                className={`menu__item ${activeTab === "search" ? "active" : ""}`}
                onClick={() => setActiveTab("search")}
              >
                Tìm đề và làm bài
              </li>

              <li
                className={`menu__item ${activeTab === "history" ? "active" : ""}`}
                onClick={() => setActiveTab("history")}
              >
                Lịch sử làm bài
              </li>
            </ul>
          </div>

          <div className="content">
            <div className="main__item">
              {activeTab === "search" ? <SearchExam /> : <HistoryExam />}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ViewExamClient;
