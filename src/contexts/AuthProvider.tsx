import { useEffect, useState, type ReactNode } from "react";
import {
  login as authLogin,
  logout as authLogout,
  getCurrentUser,
  isAuthenticated,
  validateToken,
  type User,
  type LoginRequest,
} from "../services/authService";
import { getMyProfile } from "../services/userService";
import { AuthContext, type AuthContextType } from "./AuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      try {
        const hasLocalSession = isAuthenticated();
        const hasValidServerSession =
          hasLocalSession && (await validateToken());

        if (!cancelled) {
          setUser(hasValidServerSession ? getCurrentUser() : null);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    await authLogin(credentials);
    const currentUser = getCurrentUser();
    setUser(currentUser);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const refreshUser = async () => {
    const fresh = await getMyProfile();
    const updated = { ...fresh, role: fresh.role as User["role"] };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
