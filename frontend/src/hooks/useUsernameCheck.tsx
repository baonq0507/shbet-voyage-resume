import { useState, useEffect } from 'react';
import apiService from '@/services/api';

interface UsernameCheckResult {
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
}

export const useUsernameCheck = (username: string, debounceMs: number = 500) => {
  const [result, setResult] = useState<UsernameCheckResult>({
    isChecking: false,
    isAvailable: null,
    error: null
  });

  useEffect(() => {
    // Reset state if username is empty or too short
    if (!username || username.length < 3) {
      setResult({
        isChecking: false,
        isAvailable: null,
        error: null
      });
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      setResult({
        isChecking: false,
        isAvailable: false,
        error: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'
      });
      return;
    }

    setResult(prev => ({ ...prev, isChecking: true, error: null }));

    // Debounce the API call
    const timeoutId = setTimeout(async () => {
      try {
        console.log('🔍 Checking username availability:', username);
        
        const response = await apiService.checkUsername(username);

        if (!response.success) {
          console.error('❌ Username check error:', response.error);
          setResult({
            isChecking: false,
            isAvailable: null,
            error: response.error || 'Không thể kiểm tra username'
          });
          return;
        }

        const isAvailable = response.data?.isAvailable === true;
        console.log('✅ Username check result:', { username, isAvailable });
        
        setResult({
          isChecking: false,
          isAvailable,
          error: response.data?.error ? String(response.data.error) : null
        });
      } catch (error) {
        console.error('❌ Username check failed:', error);
        setResult({
          isChecking: false,
          isAvailable: null,
          error: 'Lỗi kết nối'
        });
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [username, debounceMs]);

  return result;
};