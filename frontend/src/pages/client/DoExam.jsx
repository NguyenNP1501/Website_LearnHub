import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ExamTest from "../../components/ExamTest/ExamTest";
import "./ClientExamPages.scss";
import GoBack from "../../components/GoBack/GoBack";
import {
  getClientExamById,
  submitClientExam,
} from "../../services/clientExamService";

function DoExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadExam = async () => {
      try {
        const currentExam = await getClientExamById(id);
        if (!currentExam) {
          throw new Error("Không tìm thấy đề thi");
        }

        if (isMounted) {
          setExam(currentExam);
        }
      } catch (loadError) {
        if (isMounted) {
          setError(loadError.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadExam();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSubmitExam = async ({ answers, timeSpentSeconds }) => {
    if (!exam) {
      return;
    }

    try {
      setSubmitting(true);
      const attempt = await submitClientExam({
        examId: exam.id,
        answers,
        timeSpentSeconds,
      });

      navigate(`/result-exam/${attempt.id}`, {
        replace: true,
      });
    } catch (submitError) {
      setError(submitError.message || "Không thể nộp bài. Hãy thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="result-shell">
        <div className="result-layout">
          <div className="loading-state">Đang tải đề thi...</div>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="result-shell">
        <div className="result-layout">
          <GoBack />
          <div className="error-state">
            {error || "Không thể tải đề thi. Hãy quay lại và thử lại"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {submitting && (
        <div className="result-shell">
          <div className="result-layout">
            <div className="loading-state">Đang nộp bài và lưu kết quả...</div>
          </div>
        </div>
      )}
      <ExamTest data={exam} onSubmit={handleSubmitExam} />
    </>
  );
}

export default DoExam;
