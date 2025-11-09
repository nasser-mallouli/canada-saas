import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../lib/api';
import { UserProfile } from '../types';

interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  date_joined: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await api.get<{ user: User; profile: UserProfile | null }>('/api/auth/me');
      setUser(data.user);
      setProfile(data.profile);
    } catch (error) {
      // Not authenticated
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const response = await api.post<{
        user: User;
        profile: UserProfile;
        access: string;
        refresh: string;
      }>('/api/auth/register', {
        email,
        password,
        full_name: fullName,
      }, { skipAuth: true });

      api.setTokens(response.access, response.refresh);
      setUser(response.user);
      setProfile(response.profile);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post<{
        user: User;
        profile: UserProfile;
        access: string;
        refresh: string;
      }>('/api/auth/login', {
        email,
        password,
      }, { skipAuth: true });

      api.setTokens(response.access, response.refresh);
      setUser(response.user);
      setProfile(response.profile);
      return { error: null };
    } catch (error: any) {
      // Extract error message from Django Ninja response format
      const errorMessage = error?.response?.data?.detail || error?.message || 'Login failed';
      return { error: new Error(errorMessage) };
    }
  };

  const signOut = async () => {
    try {
      const tokens = api.getTokens();
      if (tokens.refresh) {
        await api.post('/api/auth/token/blacklist/', { refresh: tokens.refresh }, { skipAuth: true });
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      api.clearTokens();
      setUser(null);
      setProfile(null);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const updatedProfile = await api.patch<UserProfile>('/api/profile/', updates);
      setProfile(updatedProfile);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
