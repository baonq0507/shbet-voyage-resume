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
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 flex-1">
          <SidebarTrigger className="hover:bg-sidebar-accent transition-colors duration-200 flex-shrink-0" />
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Logo/Icon */}
            <div className="hidden sm:flex items-center justify-center w-7 h-7 rounded-md bg-gradient-primary shadow-sm flex-shrink-0">
              <Crown className="h-3.5 w-3.5 text-white" />
            </div>
            
            {/* Title - Compact */}
            <div className="min-w-0 flex-1">
              <h1 className="text-base lg:text-lg font-bold text-sidebar-foreground truncate">
                Admin CMS
              </h1>
              <p className="hidden xl:block text-xs text-sidebar-foreground/60 truncate">
                Casino Management
              </p>
            </div>
            
            {/* Status Badge - More compact */}
            <Badge variant="outline" className="hidden lg:flex items-center gap-1 bg-green-500/10 text-green-400 border-green-500/20 px-2 py-1 flex-shrink-0">
              <Activity className="h-2.5 w-2.5" />
              <span className="text-xs">Online</span>
            </Badge>
          </div>
        </div>

        {/* Right Section - Compact */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Quick Actions - Removed to save space */}
          
          {/* User Menu - Compact */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full ring-2 ring-transparent hover:ring-sidebar-primary/20 transition-all duration-200">
                <Avatar className="h-7 w-7 ring-1 ring-sidebar-border/30">
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold text-xs">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator - Smaller */}
                <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full ring-1 ring-sidebar animate-pulse" />
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