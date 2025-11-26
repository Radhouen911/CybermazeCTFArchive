import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const userData = await api.checkAuth();
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const login = async (name, password) => {
    try {
      const response = await api.login(name, password);
      if (response.success && response.data) {
        // Re-check auth to get admin status
        const userData = await api.checkAuth();
        setUser(userData || response.data);
        setIsAuthenticated(true);
        return response;
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, registrationCode) => {
    try {
      const response = await api.register(
        name,
        email,
        password,
        registrationCode
      );
      if (response.success && response.data) {
        // Re-check auth to get full user data
        const userData = await api.checkAuth();
        setUser(userData || response.data);
        setIsAuthenticated(true);
        return response;
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.logout();
      // Clear local user state
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
      // Clear state anyway
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
