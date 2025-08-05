import React from 'react';
import { Button } from "@/components/ui/button";
import { LogIn, UserPlus } from "lucide-react";

interface AuthButtonsProps {
  onAuthClick: () => void;
  variant?: 'hero' | 'header';
  className?: string;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({ 
  onAuthClick, 
  variant = 'header',
  className = ''
}) => {
  if (variant === 'hero') {
    return (
      <div className={`flex flex-col md:flex-row gap-3 md:gap-3 lg:gap-6 pt-2 md:pt-3 lg:pt-4 ${className}`}>
        <Button 
          variant="casino" 
          size="sm" 
          className="text-xs sm:text-sm md:text-sm lg:text-xl px-4 sm:px-8 md:px-8 lg:px-12 py-3 md:py-3 lg:py-6 font-bold casino-glow hover:scale-105 transition-all duration-300"
          onClick={onAuthClick}
        >
          <LogIn className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-7 lg:h-7" />
          Đăng Nhập
        </Button>
        <Button 
          variant="gold" 
          size="sm" 
          className="text-xs sm:text-sm md:text-sm lg:text-xl px-4 sm:px-8 md:px-8 lg:px-12 py-3 md:py-3 lg:py-6 font-bold gold-glow hover:scale-105 transition-all duration-300"
          onClick={onAuthClick}
        >
          <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-7 lg:h-7" />
          Đăng Ký
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button 
        variant="outline" 
        size="sm"
        className="text-xs px-3 py-2 font-medium"
        onClick={onAuthClick}
      >
        <LogIn className="w-3 h-3 mr-1" />
        Đăng Nhập
      </Button>
      <Button 
        variant="casino" 
        size="sm"
        className="text-xs px-3 py-2 font-medium"
        onClick={onAuthClick}
      >
        <UserPlus className="w-3 h-3 mr-1" />
        Đăng Ký
      </Button>
    </div>
  );
};