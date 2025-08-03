import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Users, DollarSign, TrendingUp, AlertCircle, Check, X, Eye } from 'lucide-react';

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

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  balance: number;
  phone_number?: string;
  created_at: string;
  last_login_at?: string;
}

const AdminPage = () => {
  const { isAdmin, isLoading: roleLoading } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [balanceToAdd, setBalanceToAdd] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isUserTransactionDialogOpen, setIsUserTransactionDialogOpen] = useState(false);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  
  // Search states
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [searchBalanceMin, setSearchBalanceMin] = useState('');
  const [searchBalanceMax, setSearchBalanceMax] = useState('');
  const [searchCreatedDate, setSearchCreatedDate] = useState('');
  const [searchDepositType, setSearchDepositType] = useState('');

  // Move all hooks before any conditional returns
  useEffect(() => {
    if (isAdmin && !roleLoading) {
      fetchTransactions();
      fetchUsers();
      
      // Set up real-time subscription for transactions
      const channel = supabase
        .channel('admin-transactions')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'transactions'
          },
          (payload) => {
            console.log('Real-time transaction update:', payload);
            
            // Refresh transactions and users data when any transaction changes
            fetchTransactions();
            fetchUsers();
            
            // Show toast notification for real-time updates
            if (payload.eventType === 'INSERT') {
              const transaction = payload.new as any;
              toast({
                title: "Giao dịch mới",
                description: `${transaction.type === 'deposit' ? 'Nạp tiền' : 
                              transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'} - ${transaction.amount?.toLocaleString()} VND`,
              });
            } else if (payload.eventType === 'UPDATE') {
              const transaction = payload.new as any;
              if (transaction.status === 'approved') {
                toast({
                  title: "Giao dịch được duyệt",
                  description: `${transaction.type === 'deposit' ? 'Nạp tiền' : 
                                transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'} - ${transaction.amount?.toLocaleString()} VND`,
                });
              } else if (transaction.status === 'rejected') {
                toast({
                  title: "Giao dịch bị từ chối",
                  description: `${transaction.type === 'deposit' ? 'Nạp tiền' : 
                                transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'} - ${transaction.amount?.toLocaleString()} VND`,
                  variant: "destructive",
                });
              }
            }
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin, roleLoading, toast]);

  const fetchTransactions = async () => {
    try {
      // Fetch transactions first
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch profiles for each unique user_id
      const userIds = [...new Set(transactionData?.map(t => t.user_id) || [])];
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, balance')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      // Fetch banks for each unique bank_id
      const bankIds = [...new Set(transactionData?.map(t => t.bank_id).filter(Boolean) || [])];
      let bankData = [];
      if (bankIds.length > 0) {
        const { data: banks, error: bankError } = await supabase
          .from('bank')
          .select('id, bank_name, account_number')
          .in('id', bankIds);
        
        if (bankError) throw bankError;
        bankData = banks || [];
      }

      // Combine data
      const enrichedTransactions = transactionData?.map(transaction => {
        const profile = profileData?.find(p => p.user_id === transaction.user_id);
        const bank = bankData?.find(b => b.id === transaction.bank_id);
        
        return {
          ...transaction,
          profiles: profile,
          bank: bank
        };
      }) || [];

      setTransactions(enrichedTransactions as any);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giao dịch",
        variant: "destructive",
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAction = async (transactionId: string, status: 'approved' | 'rejected', note?: string) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status,
          admin_note: note || null,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // If approving a deposit, update user balance
      if (status === 'approved' && transaction.type === 'deposit') {
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({
            balance: (transaction.profiles?.balance || 0) + transaction.amount
          })
          .eq('user_id', transaction.user_id);

        if (balanceError) throw balanceError;
      }

      // If approving a withdrawal, deduct from user balance
      if (status === 'approved' && transaction.type === 'withdrawal') {
        const currentBalance = transaction.profiles?.balance || 0;
        if (currentBalance >= transaction.amount) {
          const { error: balanceError } = await supabase
            .from('profiles')
            .update({
              balance: currentBalance - transaction.amount
            })
            .eq('user_id', transaction.user_id);

          if (balanceError) throw balanceError;
        } else {
          toast({
            title: "Lỗi",
            description: "Số dư không đủ để thực hiện giao dịch rút tiền",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Thành công",
        description: `Giao dịch đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}`,
      });

      // Close modal after successful action
      setIsTransactionDialogOpen(false);
      setSelectedTransaction(null);
      setAdminNote('');

      fetchTransactions();
      fetchUsers();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật giao dịch",
        variant: "destructive",
      });
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUser || !balanceToAdd || isNaN(parseFloat(balanceToAdd))) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền hợp lệ",
        variant: "destructive",
      });
      return;
    }

    try {
      const amountToAdd = parseFloat(balanceToAdd);
      
      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: selectedUser.balance + amountToAdd
        })
        .eq('id', selectedUser.id);

      if (balanceError) throw balanceError;

      // Create bonus transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedUser.user_id,
          type: 'bonus',
          amount: amountToAdd,
          status: 'approved',
          admin_note: `Admin cộng tiền bonus: ${amountToAdd.toLocaleString()} VND`,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Thành công",
        description: `Đã cộng ${amountToAdd.toLocaleString()} VND vào tài khoản và lưu vào lịch sử giao dịch`,
      });

      setBalanceToAdd('');
      setSelectedUser(null);
      fetchUsers();
      fetchTransactions();
    } catch (error) {
      console.error('Error adding balance:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cộng tiền vào tài khoản",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang chờ';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  const fetchUserTransactions = async (userId: string) => {
    try {
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch banks for each unique bank_id
      const bankIds = [...new Set(transactionData?.map(t => t.bank_id).filter(Boolean) || [])];
      let bankData = [];
      if (bankIds.length > 0) {
        const { data: banks, error: bankError } = await supabase
          .from('bank')
          .select('id, bank_name, account_number')
          .in('id', bankIds);
        
        if (bankError) throw bankError;
        bankData = banks || [];
      }

      // Combine data
      const enrichedTransactions = transactionData?.map(transaction => {
        const bank = bankData?.find(b => b.id === transaction.bank_id);
        return {
          ...transaction,
          bank: bank
        };
      }) || [];

      setUserTransactions(enrichedTransactions as any);
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giao dịch người dùng",
        variant: "destructive",
      });
    }
  };

  const getUserDepositStats = (userId: string) => {
    const userTransactions = transactions.filter(t => t.user_id === userId && t.type === 'deposit' && t.status === 'approved');
    const totalDeposited = userTransactions.reduce((sum, t) => sum + t.amount, 0);
    return { count: userTransactions.length, total: totalDeposited };
  };

  const filteredUsers = users.filter(user => {
    // Name filter
    if (searchName && !user.full_name.toLowerCase().includes(searchName.toLowerCase()) && 
        !user.username.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }

    // Email filter (using username as email equivalent)
    if (searchEmail && !user.username.toLowerCase().includes(searchEmail.toLowerCase())) {
      return false;
    }

    // Balance range filter
    if (searchBalanceMin && user.balance < parseFloat(searchBalanceMin)) {
      return false;
    }
    if (searchBalanceMax && user.balance > parseFloat(searchBalanceMax)) {
      return false;
    }

    // Created date filter
    if (searchCreatedDate) {
      const userDate = new Date(user.created_at).toISOString().split('T')[0];
      if (userDate !== searchCreatedDate) {
        return false;
      }
    }

    // Deposit amount filter
    if (searchDepositType) {
      const { total } = getUserDepositStats(user.user_id);
      
      if (searchDepositType === 'highest') {
        const allDepositTotals = users.map(u => getUserDepositStats(u.user_id).total);
        const maxDeposit = Math.max(...allDepositTotals);
        if (total !== maxDeposit || total === 0) return false;
      } else if (searchDepositType === 'lowest') {
        const usersWithDeposits = users.filter(u => getUserDepositStats(u.user_id).total > 0);
        if (usersWithDeposits.length === 0) return false;
        const depositTotals = usersWithDeposits.map(u => getUserDepositStats(u.user_id).total);
        const minDeposit = Math.min(...depositTotals);
        if (total !== minDeposit || total === 0) return false;
      } else if (searchDepositType === 'none') {
        if (total > 0) return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSearchName('');
    setSearchEmail('');
    setSearchRole('');
    setSearchBalanceMin('');
    setSearchBalanceMax('');
    setSearchCreatedDate('');
    setSearchDepositType('');
  };

  // Conditional returns AFTER all hooks
  if (roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bảng điều khiển Admin</h1>
        <Badge variant="secondary" className="px-3 py-1">
          <Users className="w-4 h-4 mr-1" />
          Quản trị viên
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giao dịch chờ duyệt</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nạp tiền</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeposits.toLocaleString()} VND</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng rút tiền</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWithdrawals.toLocaleString()} VND</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Quản lý giao dịch</TabsTrigger>
          <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách giao dịch</CardTitle>
              <CardDescription>
                Quản lý các yêu cầu nạp tiền và rút tiền từ người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.profiles?.full_name}</div>
                            <div className="text-sm text-muted-foreground">@{transaction.profiles?.username}</div>
                          </div>
                        </TableCell>
                         <TableCell>
                           <Badge variant={
                             transaction.type === 'deposit' ? 'default' : 
                             transaction.type === 'bonus' ? 'secondary' : 'outline'
                           }>
                             {transaction.type === 'deposit' ? 'Nạp tiền' : 
                              transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'}
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
                            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setIsTransactionDialogOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="custom-scrollbar">
                                <DialogHeader>
                                  <DialogTitle>Chi tiết giao dịch</DialogTitle>
                                  <DialogDescription>
                                    Thông tin chi tiết và thao tác với giao dịch
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedTransaction && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Người dùng</Label>
                                        <div className="text-sm">{selectedTransaction.profiles?.full_name}</div>
                                      </div>
                                      <div>
                                        <Label>Số tiền</Label>
                                        <div className="text-sm font-medium">{selectedTransaction.amount.toLocaleString()} VND</div>
                                      </div>
                                       <div>
                                         <Label>Loại giao dịch</Label>
                                         <div className="text-sm">
                                           {selectedTransaction.type === 'deposit' ? 'Nạp tiền' : 
                                            selectedTransaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'}
                                         </div>
                                       </div>
                                      <div>
                                        <Label>Trạng thái</Label>
                                        <Badge className={getStatusColor(selectedTransaction.status)}>
                                          {getStatusText(selectedTransaction.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    {selectedTransaction.bank && (
                                      <div>
                                        <Label>Thông tin ngân hàng</Label>
                                        <div className="text-sm">
                                          {selectedTransaction.bank.bank_name} - {selectedTransaction.bank.account_number}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <Label htmlFor="admin-note">Ghi chú admin</Label>
                                      <Textarea
                                        id="admin-note"
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Nhập ghi chú..."
                                        rows={3}
                                      />
                                    </div>
                                    
                                    {selectedTransaction.status === 'pending' && (
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleTransactionAction(selectedTransaction.id, 'approved', adminNote)}
                                          className="flex-1"
                                        >
                                          <Check className="w-4 h-4 mr-2" />
                                          Duyệt
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleTransactionAction(selectedTransaction.id, 'rejected', adminNote)}
                                          className="flex-1"
                                        >
                                          <X className="w-4 h-4 mr-2" />
                                          Từ chối
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          {/* Search Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Tìm kiếm người dùng</CardTitle>
              <CardDescription>
                Sử dụng các bộ lọc để tìm kiếm người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search-name">Tìm theo tên/username</Label>
                  <Input
                    id="search-name"
                    placeholder="Nhập tên hoặc username"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-email">Tìm theo email</Label>
                  <Input
                    id="search-email"
                    placeholder="Nhập email/username"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-deposit">Tìm theo nạp tiền</Label>
                  <Select value={searchDepositType} onValueChange={setSearchDepositType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highest">Nạp nhiều nhất</SelectItem>
                      <SelectItem value="lowest">Nạp ít nhất</SelectItem>
                      <SelectItem value="none">Chưa nạp tiền</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="search-balance-min">Số dư từ (VND)</Label>
                  <Input
                    id="search-balance-min"
                    type="number"
                    placeholder="Số dư tối thiểu"
                    value={searchBalanceMin}
                    onChange={(e) => setSearchBalanceMin(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-balance-max">Số dư đến (VND)</Label>
                  <Input
                    id="search-balance-max"
                    type="number"
                    placeholder="Số dư tối đa"
                    value={searchBalanceMax}
                    onChange={(e) => setSearchBalanceMax(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-created">Ngày tạo</Label>
                  <Input
                    id="search-created"
                    type="date"
                    value={searchCreatedDate}
                    onChange={(e) => setSearchCreatedDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Xóa bộ lọc
                </Button>
                <div className="text-sm text-muted-foreground flex items-center">
                  Tìm thấy {filteredUsers.length} người dùng
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                Quản lý thông tin và số dư của người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên đầy đủ</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Số dư</TableHead>
                      <TableHead>Tổng nạp tiền</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                       <TableRow key={user.id}>
                         <TableCell className="font-medium">{user.full_name}</TableCell>
                         <TableCell>@{user.username}</TableCell>
                         <TableCell className="font-medium text-primary">
                           {user.balance.toLocaleString()} VND
                         </TableCell>
                         <TableCell className="font-medium text-green-600">
                           {getUserDepositStats(user.user_id).total.toLocaleString()} VND
                         </TableCell>
                         <TableCell>{user.phone_number || 'N/A'}</TableCell>
                         <TableCell>
                           {new Date(user.created_at).toLocaleDateString('vi-VN')}
                         </TableCell>
                         <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedUser(user)}
                                  >
                                    Cộng tiền
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Cộng tiền vào tài khoản</DialogTitle>
                                    <DialogDescription>
                                      Cộng tiền cho người dùng {selectedUser?.full_name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Số dư hiện tại</Label>
                                      <div className="text-lg font-medium text-primary">
                                        {selectedUser?.balance.toLocaleString()} VND
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor="balance-amount">Số tiền cộng thêm (VND)</Label>
                                      <Input
                                        id="balance-amount"
                                        type="number"
                                        value={balanceToAdd}
                                        onChange={(e) => setBalanceToAdd(e.target.value)}
                                        placeholder="Nhập số tiền"
                                      />
                                    </div>
                                    <Button onClick={handleAddBalance} className="w-full">
                                      Cộng tiền
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog open={isUserTransactionDialogOpen} onOpenChange={setIsUserTransactionDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      fetchUserTransactions(user.user_id);
                                      setIsUserTransactionDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="custom-scrollbar max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Giao dịch của {selectedUser?.full_name}</DialogTitle>
                                    <DialogDescription>
                                      Danh sách tất cả giao dịch của người dùng
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                      <div className="p-3 bg-secondary rounded-lg">
                                        <div className="text-sm text-muted-foreground">Số dư hiện tại</div>
                                        <div className="text-lg font-bold text-primary">
                                          {selectedUser?.balance.toLocaleString()} VND
                                        </div>
                                      </div>
                                      <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Tổng đã nạp</div>
                                        <div className="text-lg font-bold text-green-600">
                                          {selectedUser ? getUserDepositStats(selectedUser.user_id).total.toLocaleString() : 0} VND
                                        </div>
                                      </div>
                                      <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Số giao dịch</div>
                                        <div className="text-lg font-bold text-blue-600">
                                          {userTransactions.length}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="max-h-96 overflow-y-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Loại</TableHead>
                                            <TableHead>Số tiền</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Ngân hàng</TableHead>
                                            <TableHead>Ngày tạo</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {userTransactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                              <TableCell>
                                                <Badge variant={
                                                  transaction.type === 'deposit' ? 'default' : 
                                                  transaction.type === 'bonus' ? 'secondary' : 'outline'
                                                }>
                                                  {transaction.type === 'deposit' ? 'Nạp tiền' : 
                                                   transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'}
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
                                                {transaction.bank ? 
                                                  `${transaction.bank.bank_name} - ${transaction.bank.account_number}` : 
                                                  'N/A'
                                                }
                                              </TableCell>
                                              <TableCell>
                                                {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      {userTransactions.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                          Người dùng chưa có giao dịch nào
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;