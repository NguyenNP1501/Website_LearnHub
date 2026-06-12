const AUTH_STORAGE_KEY = "remake-2.auth";

const canUseStorage = () => typeof window !== "undefined" && !!window.sessionStorage;

export const getStoredSession = () => {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const rawValue = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
};

export const getStoredToken = () => getStoredSession()?.token ?? "";

export const setStoredSession = (session) => {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearStoredSession = () => {
  if (!canUseStorage()) {
    return;
  }

  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
};
