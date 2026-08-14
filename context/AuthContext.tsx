'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Role, User } from '@/lib/types';
import { db } from '@/lib/db';
import { APP_CONFIG } from '@/lib/config';

interface AuthContextType {
  currentUser: User | null;
  role: Role;
  loginWithPin: (pin: string) => boolean;
  switchRoleDirect: (role: Role) => void;
  logout: () => void;
  hasAccess: (allowedRoles: Role[]) => boolean;
}

const customerUser: User = {
  id: 'guest-customer',
  name: 'Guest Customer',
  role: 'customer',
  pin: '',
  active: true,
  createdAt: '2026-08-01',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(customerUser);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedUserId = localStorage.getItem('smol_auth_user_id');
    if (savedUserId) {
      const users = db.getUsers();
      const found = users.find((u) => u.id === savedUserId && u.active);
      if (found) {
        setCurrentUser(found);
        return;
      }
    }
  }, []);

  const loginWithPin = (pin: string): boolean => {
    const users = db.getUsers();
    const found = users.find((u) => u.pin === pin && u.active);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('smol_auth_user_id', found.id);
      return true;
    }
    return false;
  };

  const switchRoleDirect = (targetRole: Role) => {
    if (targetRole === 'customer') {
      setCurrentUser(customerUser);
      localStorage.removeItem('smol_auth_user_id');
      return;
    }
    const users = db.getUsers();
    const found = users.find((u) => u.role === targetRole && u.active);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('smol_auth_user_id', found.id);
    } else {
      // Fallback demo user generator if role not found
      const demoUser = APP_CONFIG.demoUsers.find((u) => u.role === targetRole) || customerUser;
      setCurrentUser(demoUser as User);
    }
  };

  const logout = () => {
    setCurrentUser(customerUser);
    localStorage.removeItem('smol_auth_user_id');
  };

  const hasAccess = (allowedRoles: Role[]): boolean => {
    if (!currentUser) return allowedRoles.includes('customer');
    if (currentUser.role === 'super_admin') return true; // Super admin has access to everything
    return allowedRoles.includes(currentUser.role);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser: mounted ? currentUser : customerUser,
        role: mounted && currentUser ? currentUser.role : 'customer',
        loginWithPin,
        switchRoleDirect,
        logout,
        hasAccess,
      }}
    >
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
