import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import issueService from '../services/issueService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await authService.getCurrentUser();
          if (profile.success) {
            setUser(profile);
            // Fetch notifications
            await refreshNotifications();
          } else {
            authService.logout();
          }
        } catch (error) {
          console.error('Auth initialization failed:', error.message);
          authService.logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const refreshNotifications = async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const res = await issueService.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadNotificationsCount(res.data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Failed to sync notifications:', error.message);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      const res = await issueService.markNotificationRead(id);
      if (res.success) {
        await refreshNotifications();
      }
    } catch (error) {
      console.error('Failed to clear notification:', error.message);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login(email, password);
      if (data.success) {
        setUser(data);
        await refreshNotifications();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'citizen') => {
    setLoading(true);
    try {
      const data = await authService.register(name, email, password, role);
      if (data.success) {
        setUser(data);
        await refreshNotifications();
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Please try again.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setNotifications([]);
    setUnreadNotificationsCount(0);
  };

  const refreshUserProfile = async () => {
    try {
      const profile = await authService.getCurrentUser();
      if (profile.success) {
        setUser(profile);
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error.message);
    }
  };

  const value = {
    user,
    loading,
    notifications,
    unreadNotificationsCount,
    login,
    register,
    logout,
    refreshNotifications,
    markNotificationAsRead,
    refreshUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
