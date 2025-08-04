import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, Wallet, Bell, Home, Coins, Zap, Fish, Trophy, Spade, Bird, Gift, Users, MessageSquare, LogOut, UserCircle, Settings, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import AuthModal from "./AuthModal";
import TransactionModal from "./TransactionModal";
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

  const navItems = [
    { path: "/", label: "TRANG CHỦ", icon: Home },
    { path: "/casino", label: "CASINO", icon: Coins, hasDropdown: true, lobbies: gameLobbies.casino },
    { path: "/nohu", label: "NỔ HŨ", icon: Zap, hasDropdown: true, lobbies: gameLobbies.nohu },
    { path: "/banca", label: "BẮN CÁ", icon: Fish, hasDropdown: true, lobbies: gameLobbies.banca },
    { path: "/thethao", label: "THỂ THAO", icon: Trophy, hasDropdown: true, lobbies: gameLobbies.thethao },
    { path: "/gamebai", label: "GAME BÀI", icon: Spade, hasDropdown: true, lobbies: gameLobbies.gamebai },
    { path: "/daga", label: "ĐÁ GÀ", icon: Bird, hasDropdown: true, lobbies: gameLobbies.daga },
    { path: "/khuyenmai", label: "KHUYẾN MẠI", icon: Gift },
    { path: "/daily", label: "ĐẠI LÝ", icon: Users },
  ];

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
                  <span className="text-yellow-300 mx-1 font-extrabold text-xs md:text-lg lg:text-xl">
                    DINAMONDBET68
                  </span>
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
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-primary rounded-lg flex items-center justify-center casino-glow">
              <span className="text-white font-bold text-lg lg:text-xl">D68</span>
            </div>
            <div className="text-gradient font-bold text-sm lg:text-xl">DINAMONDBET68</div>
          </Link>

          {/* Desktop Navigation - only show on large screens */}
          <nav className="hidden lg:flex items-center space-x-2">
            {navItems.map((item) => (
              <div key={item.path} className="relative group">
                <Link
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-md text-xs font-medium transition-all duration-300 min-w-[70px] ${
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground casino-glow"
                      : "text-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {item.icon && (
                    <item.icon className="w-5 h-5" />
                  )}
                  <span className="text-center leading-tight whitespace-nowrap">{item.label}</span>
                </Link>

                {/* Dropdown Menu on Hover */}
                {item.hasDropdown && item.lobbies && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                    <div className="bg-card border border-border rounded-lg shadow-2xl p-4 min-w-[320px] backdrop-blur-sm animate-fade-in">
                      <div className="text-sm font-semibold text-primary mb-3 text-center">
                        Chọn sảnh {item.label.toLowerCase()}
                      </div>
                      <div className="grid gap-3">
                        {item.lobbies.map((lobby, index) => (
                          <div
                            key={index}
                            onClick={() => handleLobbyClick(item.path, lobby.name)}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary/5 transition-all duration-200 cursor-pointer hover-scale group/lobby"
                          >
                            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 casino-glow">
                              <img
                                src={lobby.image}
                                alt={lobby.name}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/lobby:scale-110"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground mb-1 truncate">
                                {lobby.name}
                              </div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {lobby.description}
                              </div>
                            </div>
                            <div className="w-2 h-2 bg-primary rounded-full opacity-0 group-hover/lobby:opacity-100 transition-opacity duration-200"></div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-border">
                        <Link
                          to={item.path}
                          className="block text-center text-xs text-primary hover:text-primary/80 font-medium transition-colors duration-200"
                        >
                          Xem tất cả →
                        </Link>
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
                {/* Not logged in state - No buttons, just mobile menu */}
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
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center casino-glow">
                      <span className="text-white font-bold text-lg">D68</span>
                    </div>
                    <div className="text-gradient font-bold text-lg">DINAMONDBET68</div>
                  </div>
                </div>
                <nav className="p-6">
                  <div className="space-y-3">
                    {navItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                          location.pathname === item.path
                            ? "bg-primary text-primary-foreground casino-glow"
                            : "text-foreground hover:bg-primary/10 hover:text-primary"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.icon && (
                          <item.icon className="w-5 h-5" />
                        )}
                        <span>{item.label}</span>
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
                        {/* Empty section for non-logged in users */}
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