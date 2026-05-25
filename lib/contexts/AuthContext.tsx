'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Technician' | 'Supervisor' | 'Administrator';

interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  hasPermission: (action: string) => boolean;
}

const defaultUsers: User[] = [
  { id: 'u1', name: 'Tech Jones', role: 'Technician' },
  { id: 'u2', name: 'Sarah Supervisor', role: 'Supervisor' },
  { id: 'u3', name: 'Admin Anne', role: 'Administrator' }
];

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  hasPermission: () => false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(defaultUsers[0]);

  // Load from local storage for persistence across reloads
  useEffect(() => {
    const saved = localStorage.getItem('demo_user_role');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCurrentUser(parsed);
      } catch(e) {}
    }
  }, []);

  const handleSetUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('demo_user_role', JSON.stringify(user));
  };

  const hasPermission = (action: string) => {
    const role = currentUser.role;
    
    switch (action) {
      case 'create_work_order':
        // Everyone can create WO
        return true;
      case 'delete_work_order':
        return role === 'Administrator' || role === 'Supervisor';
      case 'edit_work_order':
      case 'edit_equipment':
        return role === 'Administrator' || role === 'Supervisor' || role === 'Technician';
      case 'add_equipment':
        return role === 'Administrator' || role === 'Supervisor';
      case 'delete_equipment':
        return role === 'Administrator';
      case 'view_reports':
      case 'manage_users':
        return role === 'Administrator' || role === 'Supervisor';
      case 'reassign_work_order':
        return role === 'Administrator' || role === 'Supervisor';
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser: handleSetUser, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const DEMO_USERS = defaultUsers;
