"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";


const AUTH_API = process.env.NODE_ENV === 'production' 
  ? 'https:
  : 'http:

interface User {
  id: number;
  email: string;
  name: string;
  plan: "starter" | "pro" | "enterprise";
  
  displayName?: string;
  firstName?: string;
  bybit?: {
    connected: boolean;
    balance?: number;
  };
}

interface AccessCheck {
  allowed: boolean;
  reason?: string;
  redirectTo?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasExchangeConnected: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAccess: (path: string) => Promise<AccessCheck>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${AUTH_API}/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  
  const checkAccess = useCallback(async (path: string): Promise<AccessCheck> => {
    try {
      const res = await fetch(`${AUTH_API}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ path }),
      });
      
      if (res.ok) {
        const data = await res.json();
        
        if (data.user) {
          setUser(data.user);
        } else if (data.authenticated === false) {
          setUser(null);
        }
        return data.access;
      }
      return { allowed: true };
    } catch (error) {
      console.error('Access check error:', error);
      return { allowed: true };
    }
  }, []);

  
  useEffect(() => {
    if (isLoading) return;
    
    const check = async () => {
      const access = await checkAccess(pathname);
      if (!access.allowed && access.redirectTo) {
        router.replace(access.redirectTo);
      }
    };
    
    check();
  }, [pathname, isLoading, checkAccess, router]);

  
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${AUTH_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const register = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${AUTH_API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${AUTH_API}/logout`, { 
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      isAuthenticated: !!user,
      hasExchangeConnected: !!user?.bybit?.connected,
      login, 
      register, 
      logout,
      checkAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
