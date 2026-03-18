import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();
const ADMIN_CREDENTIALS = {
  email: 'admin@easycart.com',
  password: 'Admin@123',
  name: 'Admin'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (email, password) => {
    setIsLoading(true);

    const normalizedEmail = String(email).trim().toLowerCase();

    if (
      normalizedEmail === ADMIN_CREDENTIALS.email &&
      password === ADMIN_CREDENTIALS.password
    ) {
      const adminUser = {
        id: 'admin-user',
        email: ADMIN_CREDENTIALS.email,
        role: 'admin',
        name: ADMIN_CREDENTIALS.name,
        createdAt: new Date().toISOString()
      };
      setUser(adminUser);
      localStorage.setItem('user', JSON.stringify(adminUser));
      setIsLoading(false);
      return { success: true, user: adminUser };
    }

    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const matchedUser = registeredUsers.find(
      (item) => String(item.email).trim().toLowerCase() === normalizedEmail && item.password === password
    );

    if (!matchedUser) {
      setIsLoading(false);
      return { success: false, message: 'Invalid email or password' };
    }

    const userData = {
      id: matchedUser.id,
      email: matchedUser.email,
      role: matchedUser.role || 'user',
      name: matchedUser.name || matchedUser.email.split('@')[0],
      createdAt: matchedUser.createdAt || new Date().toISOString()
    };

    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsLoading(false);
    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = (email, password, name) => {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const normalizedEmail = String(email).trim().toLowerCase();

    const alreadyExists = registeredUsers.some(
      (item) => String(item.email).trim().toLowerCase() === normalizedEmail
    );

    if (alreadyExists) {
      return { success: false, message: 'This email is already registered' };
    }

    const nextUsers = [
      ...registeredUsers,
      {
        id: Math.random().toString(36).substr(2, 9),
        email: normalizedEmail,
        name,
        password,
        role: 'user',
        createdAt: new Date().toISOString()
      }
    ];

    localStorage.setItem('registeredUsers', JSON.stringify(nextUsers));
    return { success: true };
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
