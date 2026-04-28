import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ExamForm from "../../components/ExamForm/ExamForm";
import { getExamById, updateExam } from "../../services/examApi";
import GoBack from "../../components/GoBack/GoBack";

function EditExam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);

  useEffect(() => {
    getExamById(id).then(setExam);
  }, [id]);

  const handleUpdate = async (data) => {
    await updateExam(id, data);
    navigate("/admin");
  };

  if (!exam) return <p>Loading...</p>;

  return (
    <div>
      <div className="page"> Trang sửa đề thi</div>
      <GoBack></GoBack>
      <ExamForm data={exam} onSubmit={handleUpdate} />
    </div>
  );
}

export default EditExam;
