import { useState, createContext, useContext, ReactNode } from 'react';

interface GameFrameContextType {
  gameUrl: string | null;
  isGameActive: boolean;
  openGame: (url: string) => void;
  closeGame: () => void;
}

const GameFrameContext = createContext<GameFrameContextType | undefined>(undefined);

interface GameFrameProviderProps {
  children: ReactNode;
}

export const GameFrameProvider = ({ children }: GameFrameProviderProps) => {
  const [gameUrl, setGameUrl] = useState<string | null>(null);

  const openGame = (url: string) => {
    console.log('Opening game with URL:', url);
    setGameUrl(url);
  };

  const closeGame = () => {
    console.log('Closing game');
    setGameUrl(null);
  };

  const isGameActive = gameUrl !== null;

  const value: GameFrameContextType = {
    gameUrl,
    isGameActive,
    openGame,
    closeGame
  };

  return (
    <GameFrameContext.Provider value={value}>
      {children}
    </GameFrameContext.Provider>
  );
};

export const useGameFrame = () => {
  const context = useContext(GameFrameContext);
  if (context === undefined) {
    throw new Error('useGameFrame must be used within a GameFrameProvider');
  }
  return context;
};