import { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import { getCurrentUserApi, loginApi } from "../services/authService";
import {
  clearStoredSession,
  getStoredSession,
  setStoredSession,
} from "../utils/authStorage";

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [isBootstrapping, setIsBootstrapping] = useState(() =>
    Boolean(getStoredSession()?.token),
  );

  useEffect(() => {
    let isMounted = true;
    const storedSession = getStoredSession();

    if (!storedSession?.token) {
      return undefined;
    }

    const restoreSession = async () => {
      try {
        const user = await getCurrentUserApi();
        if (!isMounted) {
          return;
        }

        const nextSession = {
          token: storedSession.token,
          user,
        };

        setStoredSession(nextSession);
        setSession(nextSession);
      } catch {
        clearStoredSession();
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (credentials) => {
    const data = await loginApi(credentials);
    const nextSession = {
      token: data.token,
      user: data.user,
    };

    setStoredSession(nextSession);
    setSession(nextSession);

    return nextSession;
  };

  const logout = () => {
    clearStoredSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        token: session?.token ?? "",
        isAuthenticated: Boolean(session?.token),
        isBootstrapping,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
