import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Eye, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'bonus';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  bank_id?: string;
  proof_image_url?: string;
  admin_note?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    username: string;
    balance: number;
  };
  bank?: {
    bank_name: string;
    account_number: string;
  };
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [isAddBalanceDialogOpen, setIsAddBalanceDialogOpen] = useState(false);
  const [actionNote, setActionNote] = useState('');
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
  const [addBalanceNote, setAddBalanceNote] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [isUserTransactionsDialogOpen, setIsUserTransactionsDialogOpen] = useState(false);

  // Search filters
  const [searchTransactionType, setSearchTransactionType] = useState('');
  const [searchAmountMin, setSearchAmountMin] = useState('');
  const [searchAmountMax, setSearchAmountMax] = useState('');
  const [searchDateFrom, setSearchDateFrom] = useState('');
  const [searchDateTo, setSearchDateTo] = useState('');
  const [searchUserInfo, setSearchUserInfo] = useState('');

  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles (
            full_name,
            username,
            balance
          ),
          bank (
            bank_name,
            account_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách giao dịch',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAction = async (transactionId: string, status: 'approved' | 'rejected', note?: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status,
          admin_note: note,
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (error) throw error;

      // If approved, update user balance for deposits
      if (status === 'approved') {
        const transaction = transactions.find(t => t.id === transactionId);
        if (transaction && transaction.type === 'deposit') {
          const { error: balanceError } = await supabase
            .from('profiles')
            .update({
              balance: transaction.profiles!.balance + transaction.amount
            })
            .eq('user_id', transaction.user_id);

          if (balanceError) {
            console.error('Error updating balance:', balanceError);
          }
        }
      }

      toast({
        title: 'Thành công',
        description: `Giao dịch đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}`,
      });

      setIsActionDialogOpen(false);
      setSelectedTransaction(null);
      setActionNote('');
      fetchTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật giao dịch',
        variant: 'destructive',
      });
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUserId || !addBalanceAmount) return;

    try {
      const amount = parseFloat(addBalanceAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: 'Lỗi',
          description: 'Số tiền không hợp lệ',
          variant: 'destructive',
        });
        return;
      }

      // Get current user balance
      const { data: userData } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', selectedUserId)
        .single();

      if (!userData) {
        toast({
          title: 'Lỗi',
          description: 'Không tìm thấy người dùng',
          variant: 'destructive',
        });
        return;
      }

      // Update balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: userData.balance + amount
        })
        .eq('user_id', selectedUserId);

      if (balanceError) throw balanceError;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedUserId,
          type: 'bonus',
          amount,
          status: 'approved',
          admin_note: addBalanceNote || 'Admin cộng tiền',
          created_at: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      toast({
        title: 'Thành công',
        description: `Đã cộng ${amount.toLocaleString()} VND vào tài khoản`,
      });

      setIsAddBalanceDialogOpen(false);
      setSelectedUserId('');
      setAddBalanceAmount('');
      setAddBalanceNote('');
      fetchTransactions();
    } catch (error) {
      console.error('Error adding balance:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cộng tiền',
        variant: 'destructive',
      });
    }
  };

  const fetchUserTransactions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles (
            full_name,
            username,
            balance
          ),
          bank (
            bank_name,
            account_number
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserTransactions(data || []);
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải lịch sử giao dịch',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Từ chối';
      default: return 'Không xác định';
    }
  };

  const clearTransactionFilters = () => {
    setSearchTransactionType('');
    setSearchAmountMin('');
    setSearchAmountMax('');
    setSearchDateFrom('');
    setSearchDateTo('');
    setSearchUserInfo('');
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    // Transaction type filter
    if (searchTransactionType && transaction.type !== searchTransactionType) {
      return false;
    }

    // Amount range filter
    if (searchAmountMin && transaction.amount < parseFloat(searchAmountMin)) {
      return false;
    }
    if (searchAmountMax && transaction.amount > parseFloat(searchAmountMax)) {
      return false;
    }

    // Date range filter
    if (searchDateFrom) {
      const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
      if (transactionDate < searchDateFrom) {
        return false;
      }
    }
    if (searchDateTo) {
      const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
      if (transactionDate > searchDateTo) {
        return false;
      }
    }

    // User info filter
    if (searchUserInfo) {
      const userInfo = searchUserInfo.toLowerCase();
      const fullName = transaction.profiles?.full_name?.toLowerCase() || '';
      const username = transaction.profiles?.username?.toLowerCase() || '';
      
      if (!fullName.includes(userInfo) && !username.includes(userInfo)) {
        return false;
      }
    }

    return true;
  });

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý giao dịch</h1>
          <p className="text-gray-600">Quản lý tất cả giao dịch nạp/rút tiền của người dùng</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giao dịch chờ duyệt</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTransactions.length}</div>
              <p className="text-xs text-muted-foreground">
                Cần xử lý ngay
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng nạp tiền</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDeposits.toLocaleString()} VND</div>
              <p className="text-xs text-muted-foreground">
                Tổng tiền đã nạp
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng rút tiền</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWithdrawals.toLocaleString()} VND</div>
              <p className="text-xs text-muted-foreground">
                Tổng tiền đã rút
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm giao dịch</CardTitle>
            <CardDescription>
              Sử dụng các bộ lọc để tìm kiếm giao dịch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search-transaction-type">Loại giao dịch</Label>
                <Select value={searchTransactionType} onValueChange={setSearchTransactionType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại giao dịch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="deposit">Nạp tiền</SelectItem>
                    <SelectItem value="withdrawal">Rút tiền</SelectItem>
                    <SelectItem value="bonus">Bonus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="search-amount-min">Số tiền từ (VND)</Label>
                <Input
                  id="search-amount-min"
                  type="number"
                  placeholder="Số tiền tối thiểu"
                  value={searchAmountMin}
                  onChange={(e) => setSearchAmountMin(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="search-amount-max">Số tiền đến (VND)</Label>
                <Input
                  id="search-amount-max"
                  type="number"
                  placeholder="Số tiền tối đa"
                  value={searchAmountMax}
                  onChange={(e) => setSearchAmountMax(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="search-date-from">Từ ngày</Label>
                <Input
                  id="search-date-from"
                  type="date"
                  value={searchDateFrom}
                  onChange={(e) => setSearchDateFrom(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="search-date-to">Đến ngày</Label>
                <Input
                  id="search-date-to"
                  type="date"
                  value={searchDateTo}
                  onChange={(e) => setSearchDateTo(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="search-user-info">Tìm người dùng</Label>
                <Input
                  id="search-user-info"
                  placeholder="Tên, email hoặc SĐT"
                  value={searchUserInfo}
                  onChange={(e) => setSearchUserInfo(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" onClick={clearTransactionFilters}>
                Xóa bộ lọc
              </Button>
              <div className="text-sm text-muted-foreground flex items-center">
                Tìm thấy {filteredTransactions.length} giao dịch
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách giao dịch</CardTitle>
            <CardDescription>
              Tất cả giao dịch trong hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-lg">Đang tải...</div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.profiles?.full_name}</div>
                            <div className="text-sm text-gray-500">{transaction.profiles?.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.type === 'deposit' ? 'default' : transaction.type === 'withdrawal' ? 'destructive' : 'secondary'}>
                            {transaction.type === 'deposit' ? 'Nạp tiền' : 
                             transaction.type === 'withdrawal' ? 'Rút tiền' : 'Bonus'}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {transaction.amount.toLocaleString()} VND
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {getStatusText(transaction.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                fetchUserTransactions(transaction.user_id);
                                setIsUserTransactionsDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {transaction.status === 'pending' && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setIsActionDialogOpen(true);
                                  }}
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setIsActionDialogOpen(true);
                                  }}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
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

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xử lý giao dịch</DialogTitle>
            <DialogDescription>
              {selectedTransaction && (
                <div className="space-y-2">
                  <p><strong>Người dùng:</strong> {selectedTransaction.profiles?.full_name}</p>
                  <p><strong>Số tiền:</strong> {selectedTransaction.amount.toLocaleString()} VND</p>
                  <p><strong>Loại:</strong> {selectedTransaction.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="action-note">Ghi chú (tùy chọn)</Label>
              <Textarea
                id="action-note"
                placeholder="Nhập ghi chú..."
                value={actionNote}
                onChange={(e) => setActionNote(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleTransactionAction(selectedTransaction!.id, 'approved', actionNote)}
                className="flex-1"
              >
                <Check className="w-4 h-4 mr-2" />
                Duyệt
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleTransactionAction(selectedTransaction!.id, 'rejected', actionNote)}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Từ chối
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Transactions Dialog */}
      <Dialog open={isUserTransactionsDialogOpen} onOpenChange={setIsUserTransactionsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Lịch sử giao dịch người dùng</DialogTitle>
            <DialogDescription>
              {selectedTransaction && (
                <div>
                  <p><strong>Người dùng:</strong> {selectedTransaction.profiles?.full_name}</p>
                  <p><strong>Username:</strong> {selectedTransaction.profiles?.username}</p>
                  <p><strong>Số dư hiện tại:</strong> {selectedTransaction.profiles?.balance.toLocaleString()} VND</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Ghi chú</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <Badge variant={transaction.type === 'deposit' ? 'default' : transaction.type === 'withdrawal' ? 'destructive' : 'secondary'}>
                        {transaction.type === 'deposit' ? 'Nạp tiền' : 
                         transaction.type === 'withdrawal' ? 'Rút tiền' : 'Bonus'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {transaction.amount.toLocaleString()} VND
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(transaction.status)}>
                        {getStatusText(transaction.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.admin_note || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Transactions; 