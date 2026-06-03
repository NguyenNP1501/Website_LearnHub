import { requestJson } from "./apiClient";

const buildExamFormData = (exam = {}) => {
  const formData = new FormData();
  const questions = Array.isArray(exam.questions)
    ? exam.questions.map((question, index) => {
        const nextQuestion = { ...question };
        const nextFile = nextQuestion.file;

        delete nextQuestion.file;
        delete nextQuestion.previewUrl;

        if (typeof File !== "undefined" && nextFile instanceof File) {
          formData.append(`questionImage_${index}`, nextFile);
        }

        return {
          ...nextQuestion,
          imgUrl: nextQuestion.imgUrl || "",
        };
      })
    : [];

  formData.append(
    "payload",
    JSON.stringify({
      ...exam,
      questions,
    }),
  );

  return formData;
};

export const getAllExams = async () => {
  return requestJson("/admin/exams");
};

export const getExamById = async (id) => {
  return requestJson(`/admin/exams/${id}`);
};

export const createExam = async (exam) =>
  requestJson("/admin/exams", {
    method: "POST",
    body: buildExamFormData(exam),
  });

export const updateExam = async (id, exam) =>
  requestJson(`/admin/exams/${id}`, {
    method: "PUT",
    body: buildExamFormData(exam),
  });

export const importExamFile = async (file, importMode = "exported") => {
  const formData = new FormData();
  formData.append("examFile", file);
  formData.append("importMode", importMode);

  return requestJson("/admin/exams/import", {
    method: "POST",
    body: formData,
  });
};

export const updateDataExam = async (id, exam) =>
  requestJson(`/admin/exams/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exam),
  });

export const deleteSoftExam = async (id, exam) =>
  requestJson(`/admin/exams/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exam),
  });

export const deleteExam = async (id) =>
  requestJson(`/admin/exams/${id}`, {
    method: "DELETE",
  });

export const getClientExamListApi = async (keyword = "") => {
  const params = new URLSearchParams();
  if (keyword) {
    params.set("keyword", keyword);
  }

  const payload = await requestJson(
    `/client/exams${params.toString() ? `?${params.toString()}` : ""}`,
  );

  return payload.data ?? [];
};

export const getClientExamDetailApi = async (examId) => {
  const payload = await requestJson(`/client/exams/${examId}`);
  return payload.data;
};

export const submitClientExamApi = async (examId, body) => {
  const payload = await requestJson(`/client/exams/${examId}/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return payload.data;
};

export const getClientAttemptHistoryApi = async (keyword = "") => {
  const params = new URLSearchParams();
  if (keyword) {
    params.set("keyword", keyword);
  }

  const payload = await requestJson(
    `/client/attempts${params.toString() ? `?${params.toString()}` : ""}`,
  );

  return payload.data ?? [];
};

export const getClientAttemptDetailApi = async (attemptId) => {
  const payload = await requestJson(`/client/attempts/${attemptId}`);
  return payload.data;
};

export const deleteClientAttemptApi = async (attemptId) => {
  await requestJson(`/client/attempts/${attemptId}`, {
    method: "DELETE",
  });
};
