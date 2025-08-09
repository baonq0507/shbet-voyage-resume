import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Gift, Plus, Edit, Trash, Calendar, Users, DollarSign, ArrowUpDown } from 'lucide-react';
import { PromotionForm, PromotionFormData } from '@/components/PromotionForm';
import AdminLayout from '@/components/AdminLayout';

interface Promotion {
  id: string;
  title: string;
  description?: string;
  promotion_type: 'first_deposit' | 'time_based' | 'code_based';
  bonus_percentage?: number;
  bonus_amount?: number;
  min_deposit?: number;
  max_uses?: number;
  current_uses: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  promotion_code?: string;
  is_first_deposit_only: boolean;
  image_url?: string;
  created_at: string;
}

const Promotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [promotionLoading, setPromotionLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  type SortKey = 'title' | 'promotion_type' | 'is_active' | 'current_uses' | 'start_date' | 'end_date';
  const [sortKey, setSortKey] = useState<SortKey>('start_date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const { toast } = useToast();

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions(data as any || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách khuyến mãi',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePromotion = async (data: PromotionFormData) => {
    try {
      setPromotionLoading(true);
      const { error } = await supabase
        .from('promotions')
        .insert({
          title: data.title,
          description: data.description,
          promotion_type: data.promotionType,
          bonus_percentage: data.bonusType === 'percentage' ? data.bonusPercentage : null,
          bonus_amount: data.bonusType === 'amount' ? data.bonusAmount : null,
          min_deposit: data.minDeposit,
          max_uses: data.maxUses,
          start_date: data.startDate,
          end_date: data.endDate,
          is_active: data.isActive,
          is_first_deposit_only: data.isFirstDepositOnly,
          promotion_code: data.promotionCode,
          image_url: data.image_url,
          current_uses: 0,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Khuyến mãi đã được tạo',
      });

      setIsPromotionDialogOpen(false);
      fetchPromotions();
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo khuyến mãi',
        variant: 'destructive',
      });
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleUpdatePromotion = async (data: PromotionFormData) => {
    if (!editingPromotion) return;

    try {
      setPromotionLoading(true);
      const { error } = await supabase
        .from('promotions')
        .update({
          title: data.title,
          description: data.description,
          promotion_type: data.promotionType,
          bonus_percentage: data.bonusType === 'percentage' ? data.bonusPercentage : null,
          bonus_amount: data.bonusType === 'amount' ? data.bonusAmount : null,
          min_deposit: data.minDeposit,
          max_uses: data.maxUses,
          start_date: data.startDate,
          end_date: data.endDate,
          is_active: data.isActive,
          is_first_deposit_only: data.isFirstDepositOnly,
          promotion_code: data.promotionCode,
          image_url: data.image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingPromotion.id);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Khuyến mãi đã được cập nhật',
      });

      setIsPromotionDialogOpen(false);
      setEditingPromotion(null);
      fetchPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật khuyến mãi',
        variant: 'destructive',
      });
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;

    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', promotionId);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Khuyến mãi đã được xóa',
      });

      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa khuyến mãi',
        variant: 'destructive',
      });
    }
  };

  const openCreatePromotionDialog = () => {
    setEditingPromotion(null);
    setIsPromotionDialogOpen(true);
  };

  const openEditPromotionDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsPromotionDialogOpen(true);
  };

  const activePromotions = promotions.filter(p => p.is_active);
  const totalUses = promotions.reduce((sum, p) => sum + p.current_uses, 0);

  const filteredPromotions = promotions.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.promotion_code || '').toLowerCase().includes(q)
    );
  });

  const sortedPromotions = React.useMemo(() => {
    const arr = [...filteredPromotions];
    const getVal = (p: Promotion, key: SortKey): string | number => {
      switch (key) {
        case 'title':
          return (p.title || '').toLowerCase();
        case 'promotion_type':
          return p.promotion_type;
        case 'is_active':
          return p.is_active ? 1 : 0;
        case 'current_uses':
          return Number(p.current_uses) || 0;
        case 'start_date':
          return new Date(p.start_date).getTime();
        case 'end_date':
          return new Date(p.end_date).getTime();
        default:
          return 0;
      }
    };
    arr.sort((a, b) => {
      const va = getVal(a, sortKey);
      const vb = getVal(b, sortKey);
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
      else cmp = String(va).localeCompare(String(vb));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredPromotions, sortKey, sortDir]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý khuyến mãi</h1>
            <p className="text-gray-600">Tạo và quản lý các chương trình khuyến mãi</p>
          </div>
          <Button onClick={openCreatePromotionDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo khuyến mãi
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng khuyến mãi</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{promotions.length}</div>
              <p className="text-xs text-muted-foreground">
                Tất cả khuyến mãi
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khuyến mãi đang chạy</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePromotions.length}</div>
              <p className="text-xs text-muted-foreground">
                Đang hoạt động
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng lượt sử dụng</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUses}</div>
              <p className="text-xs text-muted-foreground">
                Lượt sử dụng
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Promotions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách khuyến mãi</CardTitle>
            <CardDescription>
              Tất cả khuyến mãi trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg">Đang tải...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="mb-4">
                  <Input
                    placeholder="Tìm theo tiêu đề, mô tả, mã khuyến mãi"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleSort('title')}>
                          Tiêu đề <ArrowUpDown className="ml-1 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleSort('promotion_type')}>
                          Loại <ArrowUpDown className="ml-1 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Phần thưởng</TableHead>
                      <TableHead>
                        <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleSort('is_active')}>
                          Trạng thái <ArrowUpDown className="ml-1 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleSort('current_uses')}>
                          Lượt sử dụng <ArrowUpDown className="ml-1 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleSort('start_date')}>
                            Bắt đầu <ArrowUpDown className="ml-1 h-4 w-4" />
                          </Button>
                          <span>/</span>
                          <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleSort('end_date')}>
                            Kết thúc <ArrowUpDown className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPromotions.map((promotion) => (
                      <TableRow key={promotion.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{promotion.title}</div>
                            {promotion.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {promotion.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {promotion.promotion_type === 'first_deposit' ? 'Nạp lần đầu' :
                             promotion.promotion_type === 'time_based' ? 'Theo thời gian' : 'Mã code'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {promotion.bonus_percentage && (
                              <div className="text-sm font-medium text-green-600">
                                {promotion.bonus_percentage}%
                              </div>
                            )}
                            {promotion.bonus_amount && (
                              <div className="text-sm font-medium text-green-600">
                                {promotion.bonus_amount.toLocaleString()} VND
                              </div>
                            )}
                            {promotion.min_deposit && (
                              <div className="text-xs text-gray-500">
                                Tối thiểu: {promotion.min_deposit.toLocaleString()} VND
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={promotion.is_active ? "default" : "secondary"}>
                            {promotion.is_active ? 'Đang chạy' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {promotion.current_uses}
                            {promotion.max_uses && (
                              <span className="text-gray-500"> / {promotion.max_uses}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm space-y-1">
                            <div>Từ: {new Date(promotion.start_date).toLocaleDateString('vi-VN')}</div>
                            <div>Đến: {new Date(promotion.end_date).toLocaleDateString('vi-VN')}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditPromotionDialog(promotion)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePromotion(promotion.id)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Promotion Form Dialog */}
      <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? 'Chỉnh sửa khuyến mại' : 'Tạo khuyến mại mới'}
            </DialogTitle>
            <DialogDescription>
              {editingPromotion ? 'Cập nhật thông tin khuyến mại' : 'Điền thông tin để tạo khuyến mại mới'}
            </DialogDescription>
          </DialogHeader>
          <PromotionForm
            onSubmit={editingPromotion ? handleUpdatePromotion : handleCreatePromotion}
            initialData={editingPromotion ? {
              title: editingPromotion.title,
              description: editingPromotion.description || '',
              promotionType: editingPromotion.promotion_type,
              bonusType: editingPromotion.bonus_percentage ? 'percentage' : 'amount',
              bonusPercentage: editingPromotion.bonus_percentage || undefined,
              bonusAmount: editingPromotion.bonus_amount || undefined,
              minDeposit: editingPromotion.min_deposit || undefined,
              maxUses: editingPromotion.max_uses || undefined,
              startDate: editingPromotion.start_date ? new Date(editingPromotion.start_date).toISOString().slice(0, 16) : '',
              endDate: editingPromotion.end_date ? new Date(editingPromotion.end_date).toISOString().slice(0, 16) : '',
              isActive: editingPromotion.is_active,
              isFirstDepositOnly: editingPromotion.is_first_deposit_only || false,
              promotionCode: editingPromotion.promotion_code || '',
              image_url: editingPromotion.image_url || null,
            } : undefined}
            isLoading={promotionLoading}
          />
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Promotions; 