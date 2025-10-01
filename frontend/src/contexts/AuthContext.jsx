import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('nextread_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      const userData = {
        email,
        name: email.split('@')[0],
        hasCompletedGoals: true
      };
      localStorage.setItem('nextread_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email, password, name) => {
    try {
      const userData = {
        email,
        name,
        hasCompletedGoals: false
      };
      localStorage.setItem('nextread_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = () => {
    localStorage.removeItem('nextread_user');
    setUser(null);
  };

  const updateUserGoals = (goals) => {
    const updatedUser = { ...user, hasCompletedGoals: true, goals };
    localStorage.setItem('nextread_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUserGoals }}>
      {children}
    </AuthContext.Provider>
  );
};
