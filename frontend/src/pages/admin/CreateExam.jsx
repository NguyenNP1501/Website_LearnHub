import { useNavigate } from "react-router-dom";
import { createExam } from "../../services/examApi";
import ExamForm from "../../components/ExamForm";
import GoBack from "../../components/GoBack/GoBack";

function CreateExam() {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    await createExam(data);
    navigate("/admin");
  };

  return (
    <div>
      <div className="page">Trang tạo đề thi thủ công</div>
      <GoBack></GoBack>
      <ExamForm onSubmit={handleCreate} />
    </div>
  );
}

export default CreateExam;
