'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole, OnlineUserPresence } from '@/types';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { DEMO_ADMIN_USER, DEMO_REGULAR_USER } from '@/lib/supabase/mock-store';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAdmin: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password?: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; message?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; message?: string }>;
  updateProfile: (fullName: string, avatarUrl?: string) => Promise<{ error?: string }>;
  deleteAccount: () => Promise<{ error?: string }>;
  switchDemoRole: (role: UserRole) => void;
  onlineUsers: OnlineUserPresence[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY_USER = 'cryptopulse_user';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUserPresence[]>([]);
  const isConfigured = isSupabaseConfigured();

  // Initialize auth state
  useEffect(() => {
    async function initAuth() {
      if (isConfigured) {
        const supabase = createClient();
        if (supabase) {
          try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
              const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

              if (profile) {
                setUser(profile as UserProfile);
                setIsLoading(false);
                return;
              }
            }
          } catch (err) {
            console.warn('Supabase auth load failed, falling back to local session', err);
          }
        }
      }

      // Check localStorage for demo session
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY_USER);
        if (stored) {
          try {
            setUser(JSON.parse(stored));
          } catch {
            setUser(DEMO_ADMIN_USER);
          }
        } else {
          // Default to Admin demo user for frictionless immediate testing
          setUser(DEMO_ADMIN_USER);
          localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(DEMO_ADMIN_USER));
        }
      }
      setIsLoading(false);
    }

    initAuth();
  }, [isConfigured]);

  // Set up Realtime Presence
  useEffect(() => {
    if (!user) return;

    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        const room = supabase.channel('online_presence', {
          config: { presence: { key: user.id } },
        });

        room
          .on('presence', { event: 'sync' }, () => {
            const state = room.presenceState();
            const presenceList: OnlineUserPresence[] = [];
            for (const key in state) {
              const presenceArr = state[key] as any[];
              if (presenceArr && presenceArr[0]) {
                presenceList.push(presenceArr[0]);
              }
            }
            setOnlineUsers(presenceList);
          })
          .subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
              await room.track({
                user_id: user.id,
                email: user.email,
                full_name: user.full_name || user.email.split('@')[0],
                role: user.role,
                online_at: new Date().toISOString(),
              });
            }
          });

        return () => {
          supabase.removeChannel(room);
        };
      }
    }

    // Local presence simulator
    const mockPresence: OnlineUserPresence[] = [
      {
        user_id: user.id,
        email: user.email,
        full_name: user.full_name || user.email.split('@')[0],
        role: user.role,
        online_at: new Date().toISOString(),
      },
      {
        user_id: 'usr-sim-01',
        email: 'elena.rostova@crypto.net',
        full_name: 'Elena Rostova',
        role: 'user',
        online_at: new Date(Date.now() - 4 * 60000).toISOString(),
      },
      {
        user_id: 'usr-sim-02',
        email: 'kenji.t@blocklabs.io',
        full_name: 'Kenji Takahashi',
        role: 'user',
        online_at: new Date(Date.now() - 12 * 60000).toISOString(),
      },
    ];
    setOnlineUsers(mockPresence);
  }, [user, isConfigured]);

  const signIn = async (email: string, password?: string) => {
    setIsLoading(true);
    if (isConfigured) {
      const supabase = createClient();
      if (supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            if (profile.is_disabled) {
              await supabase.auth.signOut();
              setIsLoading(false);
              return { error: 'Your account has been deactivated by an administrator.' };
            }
            setUser(profile as UserProfile);
            setIsLoading(false);
            return {};
          }
        }
      }
    }

    // Demo Mode Sign In
    const isAlex = email.toLowerCase().includes('admin');
    const signedUser: UserProfile = isAlex ? DEMO_ADMIN_USER : {
      ...DEMO_REGULAR_USER,
      email,
      full_name: email.split('@')[0].toUpperCase(),
    };
    setUser(signedUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(signedUser));
    setIsLoading(false);
    toast.success(`Signed in successfully as ${signedUser.full_name}`);
    return {};
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/callback`,
          },
        });
        if (error) {
          setIsLoading(false);
          return { error: error.message };
        }
        setIsLoading(false);
        return { message: 'Confirmation email sent! Please verify your inbox.' };
      }
    }

    // Demo Mode Sign Up
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      full_name: fullName,
      avatar_url: null,
      role: 'user',
      is_disabled: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    setIsLoading(false);
    toast.success('Account created successfully!');
    return {};
  };

  const signOut = async () => {
    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        await supabase.auth.signOut();
      }
    }
    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
    toast.info('Signed out');
  };

  const resetPassword = async (email: string) => {
    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) return { error: error.message };
        return { message: 'Password reset link sent to your email.' };
      }
    }
    return { message: 'Password reset email simulated. (Check your inbox)' };
  };

  const updateProfile = async (fullName: string, avatarUrl?: string) => {
    if (!user) return { error: 'Not authenticated' };

    const updated = {
      ...user,
      full_name: fullName,
      avatar_url: avatarUrl !== undefined ? avatarUrl : user.avatar_url,
      updated_at: new Date().toISOString(),
    };

    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ full_name: fullName, avatar_url: avatarUrl })
          .eq('id', user.id);
        if (error) return { error: error.message };
      }
    }

    setUser(updated);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    toast.success('Profile updated successfully');
    return {};
  };

  const deleteAccount = async () => {
    if (!user) return { error: 'Not authenticated' };

    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        // Cascades deletion through auth.users and profiles
        const { error } = await supabase.from('profiles').delete().eq('id', user.id);
        if (error) return { error: error.message };
        await supabase.auth.signOut();
      }
    }

    localStorage.removeItem(STORAGE_KEY_USER);
    setUser(null);
    toast.success('Account deleted successfully.');
    return {};
  };

  const switchDemoRole = (role: UserRole) => {
    const newUser = role === 'admin' ? DEMO_ADMIN_USER : DEMO_REGULAR_USER;
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    toast.success(`Switched role to ${role.toUpperCase()}`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'user',
        isAdmin: user?.role === 'admin',
        isLoading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile,
        deleteAccount,
        switchDemoRole,
        onlineUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
