import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  title: string;
  description: string;
  showLoading: (title?: string, description?: string) => void;
  hideLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider = ({ children }: LoadingProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('Đang xử lý...');
  const [description, setDescription] = useState('Vui lòng chờ trong giây lát');

  const showLoading = (
    newTitle: string = 'Đang xử lý...',
    newDescription: string = 'Vui lòng chờ trong giây lát'
  ) => {
    setTitle(newTitle);
    setDescription(newDescription);
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  const value: LoadingContextType = {
    isLoading,
    title,
    description,
    showLoading,
    hideLoading
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};