import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ActionNotice from "../../components/ActionNotice/ActionNotice";
import ExamForm from "../../components/ExamForm/index";
import GoBack from "../../components/GoBack/GoBack";
import { createExam, importExamFile } from "../../services/examApi";
import { buildNotice } from "../../utils/notice";
import "./CreateExam.scss";

const buildImportNotice = (importMode) =>
  buildNotice(
    "success",
    importMode === "saved"
      ? "Đề thi đã được import và lưu tạm thành công."
      : "Đề thi đã được import và xuất bản thành công.",
  );

function CreateExam() {
  const navigate = useNavigate();
  const [notice, setNotice] = useState(null);
  const [importFile, setImportFile] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleCreate = async (data) => {
    await createExam(data);
    navigate(data.exported ? "/admin/exported" : "/admin/saved", {
      state: {
        notice: buildNotice(
          "success",
          data.exported
            ? "Đề thi đã được tạo và xuất bản thành công."
            : "Đề thi đã được lưu thành công.",
        ),
      },
    });
  };

  const handleImport = async (importMode) => {
    if (!importFile) {
      setNotice(buildNotice("error", "Bạn cần chọn file CSV, XLSX hoặc XLS trước."));
      return;
    }

    setNotice(null);
    setIsImporting(true);

    try {
      await importExamFile(importFile, importMode);
      navigate(importMode === "saved" ? "/admin/saved" : "/admin/exported", {
        state: {
          notice: buildImportNotice(importMode),
        },
      });
    } catch (error) {
      setNotice(
        buildNotice(
          "error",
          error.message || "Không thể import đề thi từ file. Hãy thử lại.",
        ),
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="create-exam-page">
      <div className="page">Trang tạo đề thi</div>
      <GoBack />

      <ActionNotice notice={notice} onClose={() => setNotice(null)} />

      {/* <section className="create-exam__intro">
        {/* <div>
          <p className="create-exam__eyebrow">Quản lý đề thi</p>
          <h1>Tạo đề thi theo cách bạn thấy thuận tay nhất</h1>
          <p className="create-exam__lead">
            Import từ file để lên nhanh nhiều câu hỏi, hoặc nhập thủ công bên dưới
            khi cần chỉnh sửa chi tiết.
          </p>
        </div>
        <div className="create-exam__intro-card">
          <span>Hỗ trợ định dạng</span>
          <strong>CSV, XLSX, XLS</strong>
          <p>
            Mỗi dòng trong file nên đại diện cho một đáp án, để hệ thống nhóm thành
            câu hỏi đúng cấu trúc.
          </p>
        </div> */}
      {/* </section> */}

      <section className="create-exam__section import-panel">
        <div className="create-exam__section-heading">
          <p>Cách 1</p>
          <h2>Import đề thi từ file</h2>
        </div>

        <div className="import-panel__header">
          <div>
            <h3>Nạp nhanh dữ liệu câu hỏi</h3>
            <p>
              Các cột nên có trong file: <code>question_no</code>,{" "}
              <code>question_type</code>, <code>question_content</code>,{" "}
              <code>answer_content</code>, <code>is_correct</code>.
            </p>
          </div>
          <div className="import-panel__meta">
            <span className="import-panel__meta-chip">Mỗi dòng = 1 đáp án</span>
            <span className="import-panel__meta-chip">Ảnh có thể để trong file</span>
          </div>
        </div>

        <div className="import-panel__body">
          <div className="import-panel__field">
            <label htmlFor="exam-import-file">Chọn file import</label>
            <label className="import-panel__picker" htmlFor="exam-import-file">
              <span>Chọn tệp từ máy tính</span>
              <small>Hỗ trợ .csv, .xlsx, .xls</small>
            </label>
            <input
              id="exam-import-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
            />
            <p className="import-panel__file-name">
              {importFile ? `Đã chọn: ${importFile.name}` : "Chưa có file nào được chọn."}
            </p>
          </div>
          <div className="import-panel__actions">
            <button
              type="button"
              disabled={isImporting}
              onClick={() => handleImport("exported")}
            >
              {isImporting ? "Đang import..." : "Import và xuất bản"}
            </button>
            <button
              type="button"
              className="import-panel__secondary"
              disabled={isImporting}
              onClick={() => handleImport("saved")}
            >
              Import và lưu tạm
            </button>
          </div>
        </div>
      </section>

      <section className="create-exam__section">
        <div className="create-exam__section-heading">
          <p>Cách 2</p>
          <h2>Tạo đề thi thủ công</h2>
        </div>
        <ExamForm onSubmit={handleCreate} />
      </section>
    </div>
  );
}

export default CreateExam;
