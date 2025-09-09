import { useState } from 'react';
import { useAuth } from './useAuth';
import { useLoading } from './useLoading';
import apiService from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface GameLoginResponse {
  success: boolean;
  gameUrl?: string;
  error?: string;
  message?: string;
}

export const useGameLogin = () => {
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const { showLoading, hideLoading, isLoading } = useLoading();

  const loginToGame = async (gpid: number, isSports: boolean = false): Promise<string | null> => {
    if (!user || !profile?.username) {
      setError('Vui lòng đăng nhập trước khi chơi game');
      toast({
        title: "Lỗi đăng nhập",
        description: "Vui lòng đăng nhập trước khi chơi game",
        variant: "destructive"
      });
      return null;
    }

    showLoading(
      "Đang đăng nhập game...",
      "Đang kết nối với server game và xác thực tài khoản của bạn"
    );
    setError(null);

    try {
      console.log('🎮 Starting game login process for GPID:', gpid);
      
      // Show loading toast
      toast({
        title: "Đang kết nối...",
        description: "Đang đăng nhập vào game, vui lòng chờ...",
      });

      const response = await apiService.gameLogin(gpid.toString());

      console.log('📤 Game login response:', response);

      if (!response.success) {
        console.error('❌ Game login error:', response.error);
        throw new Error(response.error || 'Lỗi kết nối đến server');
      }

      if (!response.data?.gameUrl) {
        const errorMessage = response.error || 'Không thể lấy URL game';
        console.error('❌ Game login failed:', errorMessage);
        setError(errorMessage);
        toast({
          title: "Lỗi đăng nhập game",
          description: errorMessage,
          variant: "destructive"
        });
        return null;
      }

      console.log('✅ Game login successful, URL:', response.data.gameUrl);
      toast({
        title: "Thành công!",
        description: "Đăng nhập game thành công, đang mở game...",
      });

      return response.data.gameUrl;

    } catch (err) {
      console.error('💥 Game login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Lỗi không xác định';
      setError(errorMessage);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server game. Vui lòng thử lại.",
        variant: "destructive"
      });
      return null;
    } finally {
      hideLoading();
    }
  };

  const loginToSportsGame = (gpid: number): Promise<string | null> => {
    return loginToGame(gpid, true);
  };

  return {
    loginToGame,
    loginToSportsGame,
    loading: isLoading,
    error
  };
};