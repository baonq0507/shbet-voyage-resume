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
    <header className="h-16 lg:h-18 border-b border-sidebar-border/20 bg-sidebar/80 backdrop-blur-xl supports-[backdrop-filter]:bg-sidebar/60 sticky top-0 z-50 transition-all duration-300">
      <div className="flex h-full items-center justify-between px-4 lg:px-6 max-w-full w-full mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-3 lg:gap-4 min-w-0">
          <SidebarTrigger className="hover:bg-sidebar-accent transition-colors duration-200" />
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo/Icon */}
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-primary shadow-md">
              <Crown className="h-4 w-4 text-white" />
            </div>
            
            {/* Title */}
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <div className="min-w-0">
                <h1 className="text-lg lg:text-xl font-bold text-sidebar-foreground truncate">
                  Admin CMS
                </h1>
                <p className="hidden lg:block text-xs text-sidebar-foreground/60 truncate">
                  Casino Management System
                </p>
              </div>
              
              {/* Status Badge */}
              <Badge variant="outline" className="hidden md:flex items-center gap-1 bg-green-500/10 text-green-400 border-green-500/20">
                <Activity className="h-3 w-3" />
                <span className="text-xs">Online</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 lg:gap-4">
          {/* Quick Actions - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-sidebar-primary/20 transition-all duration-200">
                <Avatar className="h-9 w-9 ring-2 ring-sidebar-border/30">
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full ring-2 ring-sidebar border-sidebar animate-pulse" />
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-64 bg-popover/95 backdrop-blur-xl border-sidebar-border/30" align="end" forceMount>
              {/* User Info */}
              <div className="flex items-center gap-3 p-4 border-b border-sidebar-border/20">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gradient-primary text-white">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 min-w-0">
                  <p className="font-medium text-sm text-popover-foreground truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs px-2 py-0.5">
                      <Crown className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Menu Items */}
              <div className="py-2">
                <DropdownMenuItem className="hover:bg-sidebar-accent transition-colors duration-200">
                  <User className="mr-3 h-4 w-4" />
                  <span>Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-sidebar-accent transition-colors duration-200">
                  <Settings className="mr-3 h-4 w-4" />
                  <span>Cài đặt</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-sidebar-border/30" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors duration-200"
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}