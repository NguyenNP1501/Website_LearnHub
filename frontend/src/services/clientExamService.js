import {
  deleteClientAttemptApi,
  getClientAttemptDetailApi,
  getClientAttemptHistoryApi,
  getClientExamDetailApi,
  getClientExamListApi,
  submitClientExamApi,
} from "./examApi";

export const isObjectiveQuestion = (question) =>
  !["3", "fill", "fill_blank", "text", "input"].includes(
    String(question?.type ?? "").trim().toLowerCase(),
  );

export const getAvailableClientExams = async (keyword = "") =>
  getClientExamListApi(keyword);

export const getClientExamById = async (id) => getClientExamDetailApi(id);

export const submitClientExam = async ({
  examId,
  answers,
  timeSpentSeconds,
  studentId = null,
}) =>
  submitClientExamApi(examId, {
    studentId,
    answers,
    timeSpentSeconds,
  });

export const getAttempts = async (keyword = "") =>
  getClientAttemptHistoryApi(keyword);

export const getAttemptById = async (id) => getClientAttemptDetailApi(id);

export const deleteAttempt = async (attemptId) =>
  deleteClientAttemptApi(attemptId);

export const formatDuration = (totalSeconds) => {
  const safeSeconds = Math.max(0, Number(totalSeconds) || 0);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const formatDateTime = (value) => {
  try {
    return new Date(value).toLocaleString("vi-VN");
  } catch {
    return String(value ?? "");
  }
};

export const getAnsweredCount = (answers) =>
  Object.values(answers ?? {}).filter((value) => String(value ?? "").trim()).length;
