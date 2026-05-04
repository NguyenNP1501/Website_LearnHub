const ADMIN_API_URL = "http://localhost:3000/api/admin/exams";
const CLIENT_API_URL = "http://localhost:3000/api/client";
const AUTH_STORAGE_KEY = "learnhub_auth";

const getStoredToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return "";
    }

    const parsedValue = JSON.parse(rawValue);
    return parsedValue?.token ?? "";
  } catch {
    return "";
  }
};

const buildRequestOptions = (options = {}) => {
  const headers = new Headers(options.headers ?? {});
  const token = getStoredToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return {
    ...options,
    headers,
  };
};

const requestJson = async (url, options = {}) => {
  const response = await fetch(url, buildRequestOptions(options));
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message || "API request failed");
  }

  return payload;
};

export const getAllExams = async () => {
  return requestJson(ADMIN_API_URL);
};

export const getExamById = async (id) => {
  return requestJson(`${ADMIN_API_URL}/${id}`);
};

export const createExam = async (exam) =>
  requestJson(ADMIN_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exam),
  });

export const updateExam = async (id, exam) =>
  requestJson(`${ADMIN_API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exam),
  });

export const updateDataExam = async (id, exam) =>
  requestJson(`${ADMIN_API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exam),
  });

export const deleteSoftExam = async (id, exam) =>
  requestJson(`${ADMIN_API_URL}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(exam),
  });

export const deleteExam = async (id) =>
  requestJson(`${ADMIN_API_URL}/${id}`, {
    method: "DELETE",
  });

export const getClientExamListApi = async (keyword = "") => {
  const params = new URLSearchParams();
  if (keyword) {
    params.set("keyword", keyword);
  }

  const payload = await requestJson(
    `${CLIENT_API_URL}/exams${params.toString() ? `?${params.toString()}` : ""}`,
  );

  return payload.data ?? [];
};

export const getClientExamDetailApi = async (examId) => {
  const payload = await requestJson(`${CLIENT_API_URL}/exams/${examId}`);
  return payload.data;
};

export const submitClientExamApi = async (examId, body) => {
  const payload = await requestJson(`${CLIENT_API_URL}/exams/${examId}/submit`, {
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
    `${CLIENT_API_URL}/attempts${params.toString() ? `?${params.toString()}` : ""}`,
  );

  return payload.data ?? [];
};

export const getClientAttemptDetailApi = async (attemptId) => {
  const payload = await requestJson(`${CLIENT_API_URL}/attempts/${attemptId}`);
  return payload.data;
};

export const deleteClientAttemptApi = async (attemptId) => {
  await requestJson(`${CLIENT_API_URL}/attempts/${attemptId}`, {
    method: "DELETE",
  });
};
