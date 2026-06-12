import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
// import ExamForm from "../../components/ExamForm";
import GoBack from "../../components/GoBack/GoBack";
import { getExamById, updateExam } from "../../services/examApi";
import { buildNotice } from "../../utils/notice";

function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadExam = async () => {
      try {
        const data = await getExamById(id);
        if (isMounted) {
          setExam(data);
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(error.message || "Không thể tải đề thi.");
        }
      }
    };

    loadExam();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleUpdate = async (data) => {
    await updateExam(id, data);
    navigate(data.exported ? "/admin/exported" : "/admin/saved", {
      state: {
        notice: buildNotice(
          "success",
          data.exported
            ? "Đề thi đã được cập nhật và xuất bản thành công."
            : "Đề thi đã được cập nhật và lưu thành công.",
        ),
      },
    });
  };

  if (errorMessage) {
    return <p>{errorMessage}</p>;
  }

  if (!exam) {
    return <p>Đang tải...</p>;
  }

  return (
    <div>
      <div className="page">Trang sửa đề thi</div>
      <GoBack />
      <ExamForm key={exam.id || id} data={exam} onSubmit={handleUpdate} />
    </div>
  );
}

export default EditExam;
