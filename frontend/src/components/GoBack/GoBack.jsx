import { useNavigate } from "react-router-dom";
import "./GoBack.scss";

function GoBack() {
  const navigate = useNavigate();

  return (
    <button
      className="btn__goback"
      type="button"
      onClick={() => navigate(-1)}
    >
      Quay lại
    </button>
  );
}

export default GoBack;
