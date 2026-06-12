import { requestJson } from "./apiClient";

export const loginApi = async (credentials) => {
  const payload = await requestJson("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return payload.data;
};

export const getCurrentUserApi = async () => {
  const payload = await requestJson("/auth/me");
  return payload.data.user;
};
