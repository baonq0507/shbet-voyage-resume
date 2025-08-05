import { useState } from 'react';
import { useAuth } from './useAuth';
import { useLoading } from './useLoading';
import { supabase } from '@/integrations/supabase/client';
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

  const detectDevice = (): 'm' | 'd' => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      return isMobile ? 'm' : 'd';
    }
    return 'd';
  };

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

      // Prepare game login data
      const gameLoginData = {
        Username: profile.username,
        IsWapSports: isSports,
        CompanyKey: 'C6012BA39EB643FEA4F5CD49AF138B02',
        Portfolio: isSports ? 'ThirdPartySportsBook' : 'SeamlessGame',
        ServerId: '206.206.126.141'
      };

      console.log('🚀 Calling game API with data:', gameLoginData);

      // Call game login API directly
      const response = await fetch('http://206.206.126.141/web-root/restricted/player/login.aspx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameLoginData)
      });

      console.log('📞 Game API response status:', response.status);

      if (response.status !== 200) {
        throw new Error('Không thể kết nối đến game server');
      }

      const result = await response.json();
      console.log('📤 Game API response data:', result);

      if (!result.url) {
        throw new Error('Game server không trả về URL hợp lệ');
      }

      // Detect device type and construct final game URL
      const device = detectDevice();
      const gameUrl = `https://${result.url}&gpid=${gpid}&gameid=0&device=${device}&lang=vi-VN`;
      console.log('🎯 Final game URL constructed:', gameUrl);

      toast({
        title: "Thành công!",
        description: "Đăng nhập game thành công, đang mở game...",
      });

      return gameUrl;

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