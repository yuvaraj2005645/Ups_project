import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";
const AuthContext = createContext(void 0);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("fleetops_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem("fleetops_token");
  });
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("fleetops_token");
      if (storedToken) {
        try {
          const freshUser = await authService.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem("fleetops_user", JSON.stringify(freshUser));
        } catch (error) {
          console.warn("Failed to refresh user profile:", error);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem("fleetops_token", res.token);
      localStorage.setItem("fleetops_user", JSON.stringify(res.user));
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("fleetops_token");
    localStorage.removeItem("fleetops_user");
  };
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("fleetops_user", JSON.stringify(updatedUser));
  };
  const hasRole = (role) => {
    if (!user) return false;
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    return user.role === role;
  };
  return <AuthContext.Provider
    value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token && !!user,
      hasRole,
      updateUser,
      isLoading
    }}
  >{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
