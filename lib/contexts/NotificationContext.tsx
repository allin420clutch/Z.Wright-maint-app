'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: number;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearAll: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('demo_notifications');
    if (saved) {
      try {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotifications(JSON.parse(saved));
      } catch (e) {}
    } else {
      // Add initial demo notifications
      const initial: AppNotification[] = [
        {
          id: 'n1',
          title: 'New Work Order Assigned',
          message: 'You have been assigned to WO-1024',
          type: 'info',
          read: false,
          createdAt: Date.now() - 1000 * 60 * 30, // 30 mins ago
        },
        {
          id: 'n2',
          title: 'Preventive Maintenance Due',
          message: 'HVAC Unit Roof-1 requires monthly filter replacement',
          type: 'warning',
          read: false,
          createdAt: Date.now() - 1000 * 60 * 24 * 60, // 1 day ago
        }
      ];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications(initial);
      localStorage.setItem('demo_notifications', JSON.stringify(initial));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('demo_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (notification: Omit<AppNotification, 'id' | 'read' | 'createdAt'>) => {
    const newNotif: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      read: false,
      createdAt: Date.now(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
}
