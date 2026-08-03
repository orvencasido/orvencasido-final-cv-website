import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      setIsLoading(true);
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || 'admin@orven.dev',
            role: 'admin',
          });
        }
      } else {
        // Mock Auth check
        const storedUser = localStorage.getItem('orven_admin_session');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem('orven_admin_session');
          }
        }
      }
      setIsLoading(false);
    }

    checkAuth();
  }, []);

  const login = async (email: string, pass: string, rememberMe: boolean = false) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error || !data.user) {
          setIsLoading(false);
          return { success: false, error: error?.message || 'Invalid credentials' };
        }

        const adminUser: User = {
          id: data.user.id,
          email: data.user.email || email,
          role: 'admin',
        };
        setUser(adminUser);
        setIsLoading(false);
        return { success: true };
      } else {
        // Local Demo Mode Authentication
        // Accepts admin@orven.dev, orvencasidop@gmail.com, or any valid email in demo mode
        if (!email || pass.length < 5) {
          setIsLoading(false);
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        const adminUser: User = {
          id: 'admin_usr_1',
          email: email,
          role: 'admin',
        };

        setUser(adminUser);
        if (rememberMe) {
          localStorage.setItem('orven_admin_session', JSON.stringify(adminUser));
        } else {
          sessionStorage.setItem('orven_admin_session', JSON.stringify(adminUser));
        }

        setIsLoading(false);
        return { success: true };
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    localStorage.removeItem('orven_admin_session');
    sessionStorage.removeItem('orven_admin_session');
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
