import { useState } from 'react';
import { useAuth } from './useAuth';

interface GameLoginData {
  Username: string;
  IsWapSports: boolean;
  CompanyKey: string;
  Portfolio: string;
  ServerId: string;
}

interface GameLoginResponse {
  url: string;
}

export const useGameLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { profile } = useAuth();

  const detectDevice = (): 'm' | 'd' => {
    if (typeof window !== 'undefined') {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      return isMobile ? 'm' : 'd';
    }
    return 'd';
  };

  const loginToGame = async (gpid: number, isSports: boolean = false): Promise<string | null> => {
    if (!profile?.username) {
      setError('Vui lòng đăng nhập trước khi chơi game');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const loginData: GameLoginData = {
        Username: profile.username,
        IsWapSports: isSports,
        CompanyKey: 'C6012BA39EB643FEA4F5CD49AF138B02',
        Portfolio: isSports ? 'ThirdPartySportsBook' : 'SeamlessGame',
        ServerId: '206.206.126.141'
      };

      console.log('Sending game login request:', loginData);

      const response = await fetch('https://ex-api-yy5.tw946.com/web-root/restricted/player/login.aspx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      console.log('Game login response status:', response.status);

      if (response.status === 200) {
        const result: GameLoginResponse = await response.json();
        console.log('Game login response data:', result);
        
        if (result.url) {
          const device = detectDevice();
          const gameUrl = `https://${result.url}&gpid=${gpid}&gameid=0&device=${device}&lang=vi-VN`;
          console.log('Constructed game URL:', gameUrl);
          return gameUrl;
        }
      }

      setError('Không thể kết nối đến game. Vui lòng thử lại.');
      return null;
    } catch (err) {
      console.error('Game login error:', err);
      setError('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loginToSportsGame = (gpid: number): Promise<string | null> => {
    return loginToGame(gpid, true);
  };

  return {
    loginToGame,
    loginToSportsGame,
    loading,
    error
  };
};