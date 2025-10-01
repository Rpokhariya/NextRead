import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';

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
    const token = localStorage.getItem('nextread_token');
    const storedUser = localStorage.getItem('nextread_user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('nextread_token');
        localStorage.removeItem('nextread_user');
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email, password) => {
    try {
      const result = await authAPI.login(email, password);

      if (result.success) {
        const userData = {
          email,
          hasCompletedGoals: true
        };
        localStorage.setItem('nextread_user', JSON.stringify(userData));
        setUser(userData);
        toast.success('Welcome back!');
        return { success: true };
      } else {
        toast.error(result.error || 'Login failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('An error occurred during login');
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email, password) => {
    try {
      const result = await authAPI.register(email, password);

      if (result.success) {
        const loginResult = await authAPI.login(email, password);

        if (loginResult.success) {
          const userData = {
            email,
            hasCompletedGoals: false
          };
          localStorage.setItem('nextread_user', JSON.stringify(userData));
          setUser(userData);
          toast.success('Account created successfully!');
          return { success: true };
        }
      } else {
        toast.error(result.error || 'Registration failed');
        return { success: false, error: result.error };
      }
    } catch (error) {
      toast.error('An error occurred during registration');
      return { success: false, error: error.message };
    }
  };

  const signOut = () => {
    localStorage.removeItem('nextread_token');
    localStorage.removeItem('nextread_user');
    setUser(null);
    toast.info('Signed out successfully');
  };

  const updateUserGoals = () => {
    const updatedUser = { ...user, hasCompletedGoals: true };
    localStorage.setItem('nextread_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateUserGoals }}>
      {children}
    </AuthContext.Provider>
  );
};
