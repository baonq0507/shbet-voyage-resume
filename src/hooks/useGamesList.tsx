import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Game {
  id: string;
  name: string;
  image: string;
  type: string;
  category: string;
  isActive: boolean;
  provider: string;
  rank: number;
  gpid?: number;
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

      const { data, error: functionError } = await supabase.functions.invoke('get-games-list', {
        body: {
          category: mappedCategory,
          gpids
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      const response = data as GamesResponse;
      
      if (response.success) {
        setGames(response.data);
        setPagination(response.pagination);
        setApiUsed(response.apiUsed || false);
        
        if (response.fallback) {
          console.warn('Using fallback data - API may be unavailable');
        }
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