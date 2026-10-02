import { createContext } from "react";
import type { AuthenticatedUser, LoginRequest } from "../api/authApi";

export interface AuthContextValue {
  user: AuthenticatedUser | null;
  loading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);
