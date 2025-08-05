import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, Wallet, Bell, Home, Coins, Zap, Fish, Trophy, Spade, Bird, Gift, Users, MessageSquare, LogOut, UserCircle, Settings, ArrowDownToLine, ArrowUpFromLine, ChevronDown, Circle, Diamond, Heart, Anchor, Waves, Star, Cherry, Eye, Hash, Ticket } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { menuItems, MenuItem, MenuDropdownItem } from "@/utils/menuItems";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useGameLogin } from "@/hooks/useGameLogin";
import { useGameFrame } from "@/hooks/useGameFrame";
import AuthModal from "./AuthModal";
import TransactionModal from "./TransactionModal";
import { AuthButtons } from "./AuthButtons";
import casinoIcon from "@/assets/menu/casino-green.png";
import nohuIcon from "@/assets/menu/nohu-green.png";
import bancaIcon from "@/assets/menu/banca-green.png";
import thethaoIcon from "@/assets/menu/thethao-green.png";
import gamebaiIcon from "@/assets/menu/gamebai-green.png";
import dagaIcon from "@/assets/menu/daga-green.png";
// Lobby images
import evoLobby from "@/assets/lobbies/evo.png";
import microgamingLobby from "@/assets/lobbies/microgaming.png";
import netentLobby from "@/assets/lobbies/netent.jpg";
import playtechLobby from "@/assets/lobbies/playtech.png";
import pragmaticLobby from "@/assets/lobbies/pragmatic.png";
import sportsLobby from "@/assets/lobbies/sports.png";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'deposit' | 'withdrawal'>('deposit');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut, loading } = useAuth();
  const { isAdmin } = useRole();
  const { loginToGame, loginToSportsGame, loading: gameLoading, error: gameError } = useGameLogin();
  const { openGame } = useGameFrame();

  // Game lobbies data
  const gameLobbies = {
    casino: [
      { name: "Evolution Gaming", image: evoLobby, description: "Live Casino hàng đầu thế giới" },
      { name: "Pragmatic Play Live", image: pragmaticLobby, description: "Casino trực tuyến chất lượng cao" },
      { name: "Playtech", image: playtechLobby, description: "Nhà cung cấp game uy tín" },
    ],
    nohu: [
      { name: "Pragmatic Slots", image: pragmaticLobby, description: "Game slot đa dạng" },
      { name: "Microgaming", image: microgamingLobby, description: "Nổ hũ khủng" },
      { name: "NetEnt", image: netentLobby, description: "Slot hiện đại" },
    ],
    thethao: [
      { name: "Sports Betting", image: sportsLobby, description: "Cá cược thể thao" },
      { name: "Live Sports", image: sportsLobby, description: "Thể thao trực tiếp" },
      { name: "Virtual Sports", image: sportsLobby, description: "Thể thao ảo" },
    ],
    gamebai: [
      { name: "Evolution Gaming", image: evoLobby, description: "Game bài trực tuyến" },
      { name: "Pragmatic Play", image: pragmaticLobby, description: "Bài Việt Nam" },
    ],
    banca: [
      { name: "Fish Hunter", image: evoLobby, description: "Bắn cá siêu thị" },
      { name: "Ocean King", image: pragmaticLobby, description: "Vua đại dương" },
    ],
    daga: [
      { name: "Live Cockfight", image: evoLobby, description: "Đá gà trực tiếp" },
      { name: "SV388", image: pragmaticLobby, description: "Đá gà Philippines" },
    ]
  };

  // Helper function to render icons (FontAwesome, Lucide, or Image)
  const renderIcon = (iconName: string, size: number = 20, type?: string) => {
    // Handle image icons
    if (type === 'image' || iconName.startsWith('/') || iconName.startsWith('http')) {
      return (
        <img 
          src={iconName} 
          alt="Menu Icon" 
          className="w-5 h-5 object-contain"
          style={{ width: `${size}px`, height: `${size}px` }}
        />
      );
    }
    
    // Handle FontAwesome icons
    if (iconName.startsWith('fas fa-')) {
      return <i className={`${iconName} text-${size === 16 ? 'sm' : 'lg'}`} style={{ fontSize: `${size}px` }} />;
    }
    
    // Handle Lucide icons
    const IconComponent = (LucideIcons as any)[iconName];
    if (IconComponent) {
      return <IconComponent size={size} />;
    }
    return <Coins size={size} />; // Fallback icon
  };

  const handleAuthSuccess = () => {
    setIsAuthModalOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  const handleLobbyClick = (categoryPath: string, lobbyName: string) => {
    // Convert lobby name to URL-friendly slug
    const lobbySlug = lobbyName.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    
    // Navigate to common lobby route with query parameter
    navigate(`/lobby?sanh=${lobbySlug}`);
  };

  const handleDropdownItemClick = async (dropdownItem: MenuDropdownItem, categoryId: string) => {
    if (!user || !profile) {
      setIsAuthModalOpen(true);
      return;
    }

    const gpid = typeof dropdownItem.id === 'string' ? parseInt(dropdownItem.id) : dropdownItem.id;
    const isSports = categoryId === 'thethao';
    
    try {
      const gameUrl = isSports 
        ? await loginToSportsGame(gpid)
        : await loginToGame(gpid);
        
      if (gameUrl) {
        openGame(gameUrl);
      }
    } catch (error) {
      console.error('Failed to open game:', error);
    }
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      {/* Top Banner */}
      {/* Welcome Banner */}
      <section className="relative py-2 overflow-hidden bg-gradient-to-r from-primary via-secondary to-primary">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center overflow-hidden">
            <div className="animate-marquee whitespace-nowrap">
              <h1 className="text-xs md:text-base lg:text-lg font-black text-white inline-block">
                <span className="inline-block animate-pulse mr-1">🎉</span>
                 <span className="text-shadow-lg tracking-tight">
                   CHÀO MỪNG ĐẾN VỚI 
                    <span className="text-yellow-400 font-black mx-1 text-shadow-lg drop-shadow-lg">DINAMONDBET68</span>
                   - NHÀ CÁI UY TÍN HÀNG ĐẦU VIỆT NAM
                 </span>
                <span className="inline-block animate-pulse ml-1">🎉</span>
              </h1>
            </div>
          </div>
        </div>
      </section>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
           {/* Logo */}
           <Link to="/" className="flex items-center">
             <img 
               src="/lovable-uploads/5f8b7fab-93aa-4385-bb91-920f8493ebb9.png" 
               alt="DIAMONDBET68" 
               className="h-10 w-auto md:h-12 lg:h-14 object-contain"
             />
           </Link>

          {/* Desktop Navigation - only show on large screens */}
          <nav className="hidden lg:flex items-center space-x-2">
            {/* Home button */}
            <div className="relative">
              <Link
                to="/"
                className={`flex flex-col items-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-all duration-300 min-w-[70px] ${
                  location.pathname === "/"
                    ? "bg-primary text-primary-foreground casino-glow"
                    : "text-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <Home className="w-5 h-5" />
                <span className="text-center leading-tight whitespace-nowrap">TRANG CHỦ</span>
              </Link>
            </div>

            {/* Menu items with hover dropdowns */}
            {menuItems.map((item) => (
              <div key={item.id} className="relative group">
                <Link
                  to={item.path || '#'}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-all duration-300 min-w-[70px] ${
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground casino-glow"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {renderIcon(item.icon, 20, item.type)}
                  <span className="text-center leading-tight whitespace-nowrap">{item.text}</span>
                </Link>
                
                {/* Hover Dropdown */}
                {item.dropdown && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl p-4 min-w-[200px]">
                      <div className="text-sm font-semibold text-primary mb-3 text-center">
                        {item.text}
                      </div>
                      <div className="space-y-2">
                        {item.dropdown.map((dropdownItem) => (
                          <button
                            key={dropdownItem.id}
                            onClick={() => handleDropdownItemClick(dropdownItem, item.id)}
                            disabled={gameLoading}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-primary/10 transition-colors w-full text-left disabled:opacity-50"
                          >
                            {dropdownItem.type === 'image' ? (
                              <img src={dropdownItem.icon} alt={dropdownItem.text} className="w-5 h-5 object-contain" />
                            ) : (
                              renderIcon(dropdownItem.icon, 16)
                            )}
                            <span className="text-sm">{dropdownItem.text}</span>
                            {gameLoading && <div className="ml-auto w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {!loading && user && profile ? (
              <>
                {/* Logged in state - Desktop */}
                <div className="hidden lg:flex items-center space-x-3">
                  <div className="text-sm">
                    <div className="text-foreground font-medium">{profile.full_name}</div>
                    <div className="text-primary font-bold">{profile.balance.toLocaleString()} VND</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                          <AvatarFallback>
                            {profile.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {profile.username}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/taikhoan">
                          <UserCircle className="w-4 h-4 mr-2" />
                          Thông tin tài khoản
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setTransactionType('deposit');
                        setIsTransactionModalOpen(true);
                      }}>
                        <ArrowDownToLine className="w-4 h-4 mr-2" />
                        Nạp tiền
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        console.log('Withdrawal button clicked');
                        setTransactionType('withdrawal');
                        setIsTransactionModalOpen(true);
                      }}>
                        <ArrowUpFromLine className="w-4 h-4 mr-2" />
                        Rút tiền
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin">
                            <Settings className="w-4 h-4 mr-2" />
                            Quản trị
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Logged in state - Mobile */}
                <div className="lg:hidden flex items-center space-x-2">
                  <div className="text-xs">
                    <div className="text-primary font-bold">{profile.balance.toLocaleString()}</div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                          <AvatarFallback>
                            {profile.full_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/taikhoan">
                          <UserCircle className="w-4 h-4 mr-2" />
                          Thông tin tài khoản
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setTransactionType('deposit');
                        setIsTransactionModalOpen(true);
                      }}>
                        <ArrowDownToLine className="w-4 h-4 mr-2" />
                        Nạp tiền
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        setTransactionType('withdrawal');
                        setIsTransactionModalOpen(true);
                      }}>
                        <ArrowUpFromLine className="w-4 h-4 mr-2" />
                        Rút tiền
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin">
                            <Settings className="w-4 h-4 mr-2" />
                            Quản trị
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Đăng xuất
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              <>
                {/* Not logged in state - Auth buttons */}
                <div className="hidden lg:block">
                  <AuthButtons onAuthClick={() => setIsAuthModalOpen(true)} />
                </div>
              </>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 overflow-y-auto max-h-screen custom-scrollbar">
                 <div className="px-6 py-4 border-b border-border">
                   <div className="flex items-center justify-center">
                     <img 
                       src="/lovable-uploads/5f8b7fab-93aa-4385-bb91-920f8493ebb9.png" 
                       alt="DIAMONDBET68" 
                       className="h-10 w-auto object-contain"
                     />
                   </div>
                 </div>
                <nav className="p-6">
                  <div className="space-y-3">
                    {/* Home link */}
                    <Link
                      to="/"
                      className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                        location.pathname === "/"
                          ? "bg-primary text-primary-foreground casino-glow"
                          : "text-foreground hover:bg-primary/10 hover:text-primary"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="w-5 h-5" />
                      <span>TRANG CHỦ</span>
                    </Link>
                    
                    {/* Menu items */}
                    {menuItems.map((item) => (
                      <Link
                        key={item.id}
                        to={item.path || '#'}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                          location.pathname === item.path
                            ? "bg-primary text-primary-foreground casino-glow"
                            : "text-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {renderIcon(item.icon, 20, item.type)}
                        <span>{item.text}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    {!loading && user && profile ? (
                      <>
                        <div className="px-4 py-2 bg-muted rounded-md">
                          <div className="text-sm font-medium">{profile.full_name}</div>
                          <div className="text-primary font-bold">{profile.balance.toLocaleString()} VND</div>
                          <div className="text-xs text-muted-foreground">@{profile.username}</div>
                        </div>
                        <Button variant="outline" className="w-full justify-start" asChild>
                          <Link to="/taikhoan" onClick={() => setIsMobileMenuOpen(false)}>
                            <UserCircle className="w-4 h-4 mr-2" />
                            Thông tin tài khoản
                          </Link>
                        </Button>
                        <Button variant="gold" className="w-full justify-start" onClick={() => {
                          setTransactionType('deposit');
                          setIsTransactionModalOpen(true);
                          setIsMobileMenuOpen(false);
                        }}>
                          <ArrowDownToLine className="w-4 h-4 mr-2" />
                          Nạp Tiền
                        </Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => {
                          setTransactionType('withdrawal');
                          setIsTransactionModalOpen(true);
                          setIsMobileMenuOpen(false);
                        }}>
                          <ArrowUpFromLine className="w-4 h-4 mr-2" />
                          Rút Tiền
                        </Button>
                        {isAdmin && (
                          <Button variant="outline" className="w-full justify-start" asChild>
                            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                              <Settings className="w-4 h-4 mr-2" />
                              Quản trị
                            </Link>
                          </Button>
                        )}
                        <Button variant="destructive" className="w-full justify-start" onClick={handleSignOut}>
                          <LogOut className="w-4 h-4 mr-2" />
                          Đăng xuất
                        </Button>
                      </>
                     ) : (
                      <>
                        {/* Auth buttons for mobile menu */}
                        <div className="px-4 py-2 space-y-2">
                          <AuthButtons 
                            onAuthClick={() => {
                              setIsAuthModalOpen(true);
                              setIsMobileMenuOpen(false);
                            }} 
                            className="flex-col space-y-2"
                          />
                        </div>
                      </>
                     )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      
      <TransactionModal 
        isOpen={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)}
        initialTab={transactionType}
      />
    </header>
  );
};

export default Header;