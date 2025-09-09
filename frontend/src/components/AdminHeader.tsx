import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, Settings, Crown, Activity } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function AdminHeader() {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-16 lg:h-18 border-b border-border/20 bg-gradient-to-r from-card/80 via-background/90 to-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/40 sticky top-0 z-50 transition-all duration-300 shadow-sm">
      <div className="flex h-full items-center justify-between px-4 lg:px-6 max-w-full w-full mx-auto relative">
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
        
        {/* Left Section */}
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1 relative z-10">
          <SidebarTrigger className="hover:bg-accent/50 hover:scale-105 transition-all duration-200 flex-shrink-0 rounded-lg p-2" />
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Logo/Icon with enhanced styling */}
            <div className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-primary shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex-shrink-0">
              <Crown className="h-4 w-4 text-white drop-shadow-sm" />
            </div>
            
            {/* Title with enhanced typography */}
            <div className="min-w-0 flex-1">
              <h1 className="text-lg lg:text-xl font-bold text-foreground truncate bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Admin CMS
              </h1>
              <p className="hidden xl:block text-xs text-muted-foreground/80 truncate font-medium">
                Casino Management System
              </p>
            </div>
            
            {/* Enhanced Status Badge */}
            <Badge variant="outline" className="hidden lg:flex items-center gap-1.5 bg-green-500/10 text-green-400 border-green-500/30 px-3 py-1.5 flex-shrink-0 hover:bg-green-500/20 transition-colors duration-200 font-medium">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-sm" />
              <Activity className="h-3 w-3 drop-shadow-sm" />
              <span className="text-xs font-semibold">Online</span>
            </Badge>
          </div>
        </div>

        {/* Right Section with enhanced styling */}
        <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
          {/* Quick Actions - Removed to save space */}
          
          {/* Enhanced User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-border/30 hover:ring-primary/40 transition-all duration-300 hover:scale-105 group">
                <Avatar className="h-8 w-8 ring-2 ring-background shadow-md group-hover:shadow-lg transition-shadow duration-300">
                  <AvatarFallback className="bg-gradient-primary text-white font-bold text-sm shadow-inner">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                {/* Enhanced Online indicator */}
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full ring-2 ring-background animate-pulse shadow-sm" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-72 bg-card/95 backdrop-blur-xl border-border/30 shadow-xl" align="end" forceMount>
              {/* Enhanced User Info */}
              <div className="flex items-center gap-3 p-4 border-b border-border/20 bg-gradient-to-r from-primary/5 to-secondary/5">
                <Avatar className="h-12 w-12 ring-2 ring-primary/20 shadow-md">
                  <AvatarFallback className="bg-gradient-primary text-white font-bold text-lg">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 min-w-0 flex-1">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-gradient-to-r from-primary/20 to-secondary/20 border-primary/30">
                      <Crown className="h-3 w-3 mr-1" />
                      Administrator
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-green-400">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      Active
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Enhanced Menu Items */}
              <div className="py-2">
                <DropdownMenuItem className="hover:bg-accent/50 transition-all duration-200 group cursor-pointer">
                  <User className="mr-3 h-4 w-4 group-hover:text-primary transition-colors" />
                  <span className="font-medium">Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-accent/50 transition-all duration-200 group cursor-pointer">
                  <Settings className="mr-3 h-4 w-4 group-hover:text-primary transition-colors" />
                  <span className="font-medium">Cài đặt hệ thống</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/30" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group cursor-pointer"
                >
                  <LogOut className="mr-3 h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Đăng xuất</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}