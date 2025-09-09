import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNavigation from "@/components/MobileNavigation";
import { PromotionSection } from "@/components/PromotionSection";

const KhuyenMai = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
              🎁 KHUYẾN MẠI HOT 🎁
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Tham gia ngay các chương trình khuyến mãi hấp dẫn từ admin và nhận thưởng khủng
            </p>
          </div>
        </div>
      </section>

      {/* Dynamic Promotions from Admin */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <PromotionSection variant="full" />
        </div>
      </section>

      {/* Terms Section */}
      <section className="py-12 bg-card/50">
        <div className="container mx-auto px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">Điều Kiện & Điều Khoản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Điều kiện chung:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Chỉ áp dụng cho thành viên đã xác thực tài khoản</li>
                    <li>• Mỗi tài khoản chỉ được tham gia một lần</li>
                    <li>• Bonus phải được sử dụng trong vòng 30 ngày</li>
                    <li>• Yêu cầu cược tối thiểu 10x số tiền bonus</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Quy định rút tiền:</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Hoàn thành điều kiện cược trước khi rút</li>
                    <li>• Thời gian xử lý: 5-15 phút</li>
                    <li>• Hỗ trợ 24/7 qua Live Chat</li>
                    <li>• Tuân thủ chính sách chống rửa tiền</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default KhuyenMai;