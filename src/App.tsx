import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { GameFrameProvider } from "@/hooks/useGameFrame";
import { LoadingProvider } from "@/hooks/useLoading";
import GameFrame from "./components/GameFrame";
import GlobalLoadingOverlay from "./components/GlobalLoadingOverlay";
import Index from "./pages/Index";
import Casino from "./pages/Casino";
import NoHu from "./pages/NoHu";
import BanCa from "./pages/BanCa";
import TheThao from "./pages/TheThao";
import GameBai from "./pages/GameBai";
import DaGa from "./pages/DaGa";
import KhuyenMai from "./pages/KhuyenMai";
import DaiLy from "./pages/DaiLy";
import ThongBao from "./pages/ThongBao";
import TaiKhoan from "./pages/TaiKhoan";
import XoSo from "./pages/XoSo";
import Admin from "./pages/Admin";
import Lobby from "./pages/Lobby";
import NotFound from "./pages/NotFound";
import MobileFooter from "./components/MobileFooter";
import MobileNavigation from "./components/MobileNavigation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LoadingProvider>
        <GameFrameProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <div className="pb-16 lg:pb-0">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/casino" element={<Casino />} />
                <Route path="/nohu" element={<NoHu />} />
                <Route path="/banca" element={<BanCa />} />
                <Route path="/thethao" element={<TheThao />} />
                <Route path="/gamebai" element={<GameBai />} />
                <Route path="/daga" element={<DaGa />} />
                <Route path="/khuyenmai" element={<KhuyenMai />} />
                <Route path="/daily" element={<DaiLy />} />
                <Route path="/thongbao" element={<ThongBao />} />
                <Route path="/taikhoan" element={<TaiKhoan />} />
                <Route path="/xoso" element={<XoSo />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/lobby" element={<Lobby />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <MobileFooter />
            <GameFrame />
            <GlobalLoadingOverlay />
          </BrowserRouter>
        </TooltipProvider>
      </GameFrameProvider>
    </LoadingProvider>
  </AuthProvider>
</QueryClientProvider>
);

export default App;
