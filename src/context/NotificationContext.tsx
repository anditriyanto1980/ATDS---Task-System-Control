import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Notification } from '../types';
import { dbService } from '../services/db';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  reloadNotifications: () => void;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isManager } = useAuth();
  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const reloadNotifications = () => {
    setAllNotifications(dbService.getNotifications());
  };

  useEffect(() => {
    reloadNotifications();
    const interval = setInterval(reloadNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const notifications = useMemo(() => {
    return allNotifications.filter((n) => {
      if (isManager) return true; // Manager can view team alerts
      return n.userId === currentUser.id;
    });
  }, [allNotifications, currentUser.id, isManager]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = (id: string) => {
    dbService.markNotificationAsRead(id);
    reloadNotifications();
  };

  const markAllAsRead = () => {
    dbService.markAllNotificationsAsRead(currentUser.id);
    reloadNotifications();
  };

  const addToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        addToast,
        toasts,
        removeToast,
        reloadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
