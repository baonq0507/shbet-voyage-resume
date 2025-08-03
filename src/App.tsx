import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Casino from "./pages/Casino";
import NoHu from "./pages/NoHu";
import BanCa from "./pages/BanCa";
import TheThao from "./pages/TheThao";
import GameBai from "./pages/GameBai";
import DaGa from "./pages/DaGa";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/casino" element={<Casino />} />
          <Route path="/nohu" element={<NoHu />} />
          <Route path="/banca" element={<BanCa />} />
          <Route path="/thethao" element={<TheThao />} />
          <Route path="/gamebai" element={<GameBai />} />
          <Route path="/daga" element={<DaGa />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
