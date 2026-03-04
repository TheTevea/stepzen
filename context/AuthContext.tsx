'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { UserRole } from '@/types';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Sync user to the Prisma User table via API route */
async function syncUserToDatabase(email: string, name: string) {
  try {
    await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
  } catch (err) {
    console.error('Failed to sync user to database:', err);
  }
}

/** Map a Supabase user object to our app's User shape */
async function mapSupabaseUser(su: SupabaseUser): Promise<User | null> {
  const email = su.email ?? '';
  const meta = su.user_metadata ?? {};
  const name =
    meta.name ??
    meta.full_name ??
    email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1);

  // Fetch the real role from the Prisma database
  let role: UserRole = 'SEEKER';
  try {
    const res = await fetch('/api/auth/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });
    if (res.ok) {
      const data = await res.json();
      // If user is banned, sign them out and return null
      if (data.user?.isBanned) {
        await supabase.auth.signOut();
        return null;
      }
      role = data.user?.role ?? 'SEEKER';
    }
  } catch {
    // Fall back to SEEKER if the API call fails
  }

  return { email, name, role };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch the current session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const mapped = await mapSupabaseUser(session.user);
        setUser(mapped); // null if banned — user will be signed out
      }
      setIsLoading(false);
    });

    // 2. Listen for auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const mapped = await mapSupabaseUser(session.user);
        setUser(mapped); // null if banned
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    // Ensure user exists in the Prisma User table & check ban status
    if (data.user) {
      const meta = data.user.user_metadata ?? {};
      const name = meta.name ?? email.split('@')[0];

      const res = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      if (res.ok) {
        const syncData = await res.json();
        if (syncData.user?.isBanned) {
          await supabase.auth.signOut();
          throw new Error('Your account has been banned. Please contact support for assistance.');
        }
      }
    }
  };

  const signup = async (email: string, name: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw new Error(error.message);

    // Create user record in the Prisma User table
    if (data.user) {
      await syncUserToDatabase(email, name);
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};