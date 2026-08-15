import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  login as loginRequest,
  getMe,
  getToken,
  setToken,
  clearToken,
} from "../api/adminApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    try {
      const profile = await getMe();
      setAdmin(profile);
    } catch {
      clearToken();
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function login(mail, password) {
    const result = await loginRequest(mail, password);
    setToken(result.token);
    await loadProfile();
    return result;
  }

  function logout() {
    clearToken();
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
