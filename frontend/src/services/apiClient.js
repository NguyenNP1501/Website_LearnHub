import { clearStoredSession, getStoredToken } from "../utils/authStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const requestJson = async (path, options = {}) => {
  const headers = new Headers(options.headers ?? {});
  const token = getStoredToken();

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body instanceof FormData && headers.has("Content-Type")) {
    headers.delete("Content-Type");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => null);

  if (response.status === 401) {
    clearStoredSession();
  }

  if (!response.ok) {
    const error = new Error(payload?.message || "API request failed");
    error.status = response.status;
    throw error;
  }

  return payload;
};
