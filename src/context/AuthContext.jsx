import React, { createContext, useState, useContext, useEffect } from 'react';
import { getMeApi, loginApi, registerApi } from '../services/authService';

const AuthContext = createContext();
const AUTH_TOKEN_KEY =
  process.env.REACT_APP_AUTH_TOKEN_KEY || 'easycart_auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      const savedUser = localStorage.getItem('user');

      if (!token || !savedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getMeApi();
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } catch (_error) {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);

    try {
      const response = await loginApi({ email, password });
      localStorage.setItem(AUTH_TOKEN_KEY, response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      return { success: true, user: response.user };
    } catch (error) {
      let message = error?.response?.data?.message;

      if (!message && !error?.response) {
        message = 'Unable to connect to server. Please start backend server on port 5000.';
      }

      if (!message) {
        message = 'Invalid email or password';
      }

      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('user');
  };

  const register = async (email, password, name) => {
    setIsLoading(true);

    try {
      await registerApi({ name, email, password });
      return { success: true };
    } catch (error) {
      let message = error?.response?.data?.message;

      if (!message && !error?.response) {
        message = 'Unable to connect to server. Please start backend server on port 5000.';
      }

      if (!message) {
        message = 'Registration failed';
      }

      return { success: false, message };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      logout,
      register
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
