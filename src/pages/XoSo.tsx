import React from 'react';
import { Ticket, Hash, Zap } from 'lucide-react';

export default function XoSo() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Ticket className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold text-gradient">XỔ SỐ</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Trò chơi xổ số hấp dẫn với nhiều phần thưởng giá trị
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-card border border-border rounded-lg p-6 hover:bg-card/80 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <Hash className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Keno</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Trò chơi xổ số nhanh với tỷ lệ trúng cao
            </p>
            <div className="text-center">
              <span className="text-sm text-primary">Đang phát triển...</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:bg-card/80 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <Hash className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Lotto</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Xổ số kiểu Tây với giải thưởng lớn
            </p>
            <div className="text-center">
              <span className="text-sm text-primary">Đang phát triển...</span>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-6 hover:bg-card/80 transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Powerball</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Xổ số quốc tế với jackpot khủng
            </p>
            <div className="text-center">
              <span className="text-sm text-primary">Đang phát triển...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}