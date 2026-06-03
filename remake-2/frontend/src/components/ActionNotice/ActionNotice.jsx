import "./ActionNotice.scss";

function ActionNotice({ notice, onClose }) {
  if (!notice?.message) {
    return null;
  }

  return (
    <div className={`action-notice action-notice--${notice.type || "info"}`}>
      <span>{notice.message}</span>
      {onClose ? (
        <button type="button" onClick={onClose}>
          Đóng
        </button>
      ) : null}
    </div>
  );
}

export default ActionNotice;
