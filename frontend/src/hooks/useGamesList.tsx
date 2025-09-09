import { useState, useEffect } from 'react';
import apiService from '@/services/api';

export interface Game {
  id: string;
  name: string;
  image: string;
  type: string;
  category: string;
  isActive: boolean;
  provider: string;
  rank: number;
  gpid: number;
}

interface GamesResponse {
  success: boolean;
  data: Game[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  fallback?: boolean;
  error?: string;
  apiUsed?: boolean;
}

export const useGamesList = (page: number = 1, pageSize: number = 10, category: string = 'all', gpids?: number[]) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });
  const [apiUsed, setApiUsed] = useState(false);

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      // Map frontend categories to backend categories for fallback data
      let mappedCategory = category;
      if (category === 'casino') mappedCategory = 'casino';
      else if (category === 'slots') mappedCategory = 'slots'; 
      else if (category === 'sports') mappedCategory = 'sports';
      else if (category === 'fishing') mappedCategory = 'fishing';
      else if (category === 'card-games') mappedCategory = 'card-games';
      else if (category === 'cockfight') mappedCategory = 'cockfight';
      else if (category === 'lottery') mappedCategory = 'lottery';

      const response = await apiService.getGamesByCategory(mappedCategory, {
        page,
        limit: pageSize
      });

      if (response.success) {
        setGames(response.data.games);
        setPagination(response.data.pagination);
        setApiUsed(false); // Always using API now
        
        console.log('✅ Games fetched successfully:', response.data.games.length);
      } else {
        throw new Error(response.error || 'Failed to fetch games');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching games:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [category, JSON.stringify(gpids)]);

  return {
    games,
    loading,
    error,
    pagination,
    apiUsed,
    refetch: fetchGames
  };
};