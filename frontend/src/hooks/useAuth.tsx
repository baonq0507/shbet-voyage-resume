import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import apiService from '@/services/api';
import webSocketService from '@/services/websocket';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  balance: number;
  role: string;
  lastLoginAt?: string;
  createdAt: string;
}

interface Profile {
  id: string;
  userId: string;
  fullName: string;
  phoneNumber?: string;
  username: string;
  balance: number;
  avatarUrl?: string;
  lastLoginAt?: string;
  lastLoginIp?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  signIn: (userData: User, profileData?: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  const refreshProfile = async () => {
    const profileData = await fetchProfile();
    setProfile(profileData);
  };

  const signIn = (userData: User, profileData?: Profile) => {
    setUser(userData);
    if (profileData) {
      setProfile(profileData);
    }
    // Join WebSocket room for real-time updates
    webSocketService.joinUserRoom(userData.id);
  };

  const signOut = async () => {
    try {
      await apiService.logout();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          // Ensure token is set in apiService before making API calls
          apiService.setToken(token);
          
          const response = await apiService.getCurrentUser();
          if (response.success && response.data) {
            const userData = response.data.user;
            setUser(userData);
            
            // Fetch profile data
            const profileData = await fetchProfile();
            setProfile(profileData);
            
            // Join WebSocket room for real-time updates
            webSocketService.joinUserRoom(userData.id);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        apiService.clearToken();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Set up real-time subscription for profile updates
  useEffect(() => {
    if (!user) return;

    // Listen for balance updates
    const handleBalanceUpdate = (data: { userId: string; balance: number }) => {
      if (data.userId === user.id) {
        setProfile(prev => prev ? { ...prev, balance: data.balance } : null);
      }
    };

    // Listen for profile updates
    const handleProfileUpdate = (data: { userId: string; profile: any }) => {
      if (data.userId === user.id) {
        setProfile(data.profile);
      }
    };

    webSocketService.on('balance-updated', handleBalanceUpdate);
    webSocketService.on('profile-updated', handleProfileUpdate);

    // Cleanup listeners
    return () => {
      webSocketService.off('balance-updated', handleBalanceUpdate);
      webSocketService.off('profile-updated', handleProfileUpdate);
    };
  }, [user]);

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
    setUser,
    setProfile,
    signIn
  };

  return (
    <AuthContext.Provider value={value}>
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