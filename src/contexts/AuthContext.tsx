import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, LoginRequest, AuthContextType } from '../types/auth';
import authService from '@services/authService';
import mockAuthService from '@services/mockAuthService';

// Select auth service via env flag
const useMockAuth = (import.meta.env.VITE_USE_MOCK_AUTH as string) === 'true';
const authServiceToUse = useMockAuth ? mockAuthService : authService;

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!(user && token);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      const storedToken = authServiceToUse.getCurrentToken();
      const storedUser = authServiceToUse.getCurrentUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        try {
          // Verify token with backend
          const updatedUser = await authServiceToUse.checkAuth();
          setUser(updatedUser);
        } catch (error) {
          console.warn('Token verification failed:', error);
          // For development, if backend is not available, keep the stored user
          // In production, you would want to clear auth data
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Auto token refresh effect
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkTokenExpiration = async () => {
      if (authServiceToUse.isTokenExpiring()) {
        try {
          const newToken = await authServiceToUse.refreshToken();
          setToken(newToken);
        } catch (error) {
          console.warn('Token refresh failed:', error);
          handleLogout();
        }
      }
    };

    // Check token expiration every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    
    try {
      const response = await authServiceToUse.login(credentials);
      setUser(response.user);
      setToken(response.token);
    } catch (error) {
      throw error; // Re-throw to let components handle the error
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    authServiceToUse.logout();
  };

  const handleLogout = (): void => {
    logout();
    // Redirect to login page
    window.location.href = '/login';
  };

  const refreshToken = async (): Promise<void> => {
    try {
      const newToken = await authServiceToUse.refreshToken();
      setToken(newToken);
    } catch (error) {
      handleLogout();
      throw error;
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      const updatedUser = await authServiceToUse.checkAuth();
      setUser(updatedUser);
    } catch (error) {
      handleLogout();
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshToken,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};