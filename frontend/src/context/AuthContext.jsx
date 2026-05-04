/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "learnhub_auth";
const AUTH_API_URL = "http://localhost:3000/api/auth";

const AuthContext = createContext(null);

const readStoredAuth = () => {
  if (typeof window === "undefined") {
    return { token: "", user: null };
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) {
      return { token: "", user: null };
    }

    const parsedValue = JSON.parse(rawValue);
    return {
      token: parsedValue?.token ?? "",
      user: parsedValue?.user ?? null,
    };
  } catch {
    return { token: "", user: null };
  }
};

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => readStoredAuth());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const syncAuthState = async () => {
      if (!authState.token) {
        setIsReady(true);
        return;
      }

      try {
        const response = await fetch(`${AUTH_API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        });
        const payload = await response.json().catch(() => null);

        if (!response.ok || !payload?.data?.user) {
          throw new Error(payload?.message || "Phiên đăng nhập không hợp lệ.");
        }

        setAuthState({
          token: authState.token,
          user: payload.data.user,
        });
      } catch {
        setAuthState({ token: "", user: null });
      } finally {
        setIsReady(true);
      }
    };

    syncAuthState();
  }, [authState.token]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (!authState.token || !authState.user) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
  }, [authState]);

  const login = async ({ email, password, role }) => {
    const response = await fetch(`${AUTH_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        role,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload?.data?.token || !payload?.data?.user) {
      throw new Error(payload?.message || "Đăng nhập thất bại.");
    }

    const nextAuthState = {
      token: payload.data.token,
      user: payload.data.user,
    };

    setAuthState(nextAuthState);
    return nextAuthState.user;
  };

  const logout = () => {
    setAuthState({ token: "", user: null });
  };

  return (
    <AuthContext.Provider
      value={{
        token: authState.token,
        user: authState.user,
        isAuthenticated: Boolean(authState.token && authState.user),
        isReady,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
