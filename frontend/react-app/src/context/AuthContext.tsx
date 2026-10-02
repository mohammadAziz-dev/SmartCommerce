import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
} from "../api/authApi";
import type { AuthenticatedUser, LoginRequest } from "../api/authApi";
import { AuthContext } from "./auth-context";

interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(request: LoginRequest) {
    await loginRequest(request);

    const authenticatedUser = await getCurrentUser();
    setUser(authenticatedUser);
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
