import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'user';

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

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('role', { ascending: false }); // admin comes before user alphabetically when descending

      if (error) {
        console.error('Error fetching user role:', error);
        setRole('user'); // Default to user role
      } else {
        // Get the highest priority role (admin > user)
        const roles = data || [];
        const hasAdmin = roles.some(r => r.role === 'admin');
        setRole(hasAdmin ? 'admin' : (roles[0]?.role || 'user'));
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