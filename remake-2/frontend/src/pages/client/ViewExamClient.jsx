import { useState } from "react";
import "./ViewExamClient.scss";
import SearchExam from "./SearchExam";
import HistoryExam from "./HistoryExam";

const tabs = [
  {
    key: "search",
    title: "Tìm đề và làm bài",
    description: "Khám phá đề mới theo môn học, khối lớp và bắt đầu làm bài ngay.",
    statLabel: "Mục tiêu hôm nay",
    statValue: "Luyện đúng đề",
  },
  {
    key: "history",
    title: "Lịch sử làm bài",
    description: "Xem lại kết quả, thời gian làm bài và quay lại các đề đã nộp trước đó.",
    statLabel: "Theo dõi tiến độ",
    statValue: "Ôn tập hiệu quả",
  },
];

function ViewExamClient() {
  const [activeTab, setActiveTab] = useState("search");

  const activeTabConfig = tabs.find((item) => item.key === activeTab) ?? tabs[0];

  return (
    <section className="practice-room">
      {/* <div className="practice-room__hero"> */}
        {/* <div className="practice-room__hero-content">
          <p className="practice-room__eyebrow">Phòng luyện đề</p>
          <h2>Không gian ôn luyện dành cho học sinh</h2>
          <p className="practice-room__description">
            Tìm đề phù hợp, làm bài theo thời gian thực và theo dõi lịch sử nộp bài
            ngay trong một nơi.
          </p>
        </div> */}

        {/* <div className="practice-room__hero-card">
          <span>{activeTabConfig.statLabel}</span>
          <strong>{activeTabConfig.statValue}</strong>
          <p>{activeTabConfig.description}</p>
        </div> */}
      {/* </div> */}

      <div className="practice-room__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`practice-room__tab${activeTab === tab.key ? " is-active" : ""}`}
            type="button"
            onClick={() => setActiveTab(tab.key)}
          >
            <strong>{tab.title}</strong>
            <span>{tab.description}</span>
          </button>
        ))}
      </div>

      <div className="practice-room__content">
        {activeTab === "search" ? <SearchExam /> : <HistoryExam />}
      </div>
    </section>
  );
}

export default ViewExamClient;
