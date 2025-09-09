import { useState, useEffect } from 'react';
import apiService from '@/services/api';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'agent' | 'user';

interface UseRoleReturn {
  role: UserRole | null;
  isAdmin: boolean;
  isLoading: boolean;
  refreshRole: () => Promise<void>;
}

export const useRole = (): UseRoleReturn => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchRole = async () => {
    if (!user) {
      setRole(null);
      setIsLoading(false);
      return;
    }

    // Check if token exists before making API call
    const token = localStorage.getItem('auth_token');
    if (!token) {
      setRole('user');
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiService.getUserRole();
      
      if (response.success && response.data) {
        setRole(response.data.role);
      } else {
        console.error('Error fetching user role:', response.message);
        setRole('user'); // Default to user role
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole('user');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRole = async () => {
    setIsLoading(true);
    await fetchRole();
  };

  useEffect(() => {
    fetchRole();
  }, [user]);

  return {
    role,
    isAdmin: role === 'admin',
    isLoading,
    refreshRole,
  };
};