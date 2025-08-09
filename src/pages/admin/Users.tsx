import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Users as UsersIcon, Search, Eye, DollarSign, Calendar, Phone, Mail, Edit, Trash2, List, History, MoreVertical, ArrowUpDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import AdminLayout from '@/components/AdminLayout';
import { EditUserModal } from '@/components/EditUserModal';
import { ViewUserDetails } from '@/components/ViewUserDetails';
interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  balance: number;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
  last_login_at?: string;
  last_login_ip?: string;
  updated_at: string;
}

interface SimpleTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bonus';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}


const Users: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isUserDetailsDialogOpen, setIsUserDetailsDialogOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [isTransactionsOpen, setIsTransactionsOpen] = useState(false);
  const [userTransactions, setUserTransactions] = useState<SimpleTransaction[]>([]);
  const [isTransLoading, setIsTransLoading] = useState(false);
  const [isBetHistoryOpen, setIsBetHistoryOpen] = useState(false);

  const { toast } = useToast();

  type SortKey = 'full_name' | 'username' | 'balance' | 'created_at' | 'last_login_at';
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type assertion to handle the unknown last_login_ip type from Supabase
      setUsers((data || []) as UserProfile[]);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách người dùng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Cộng tiền cho người dùng
  const handleAddFunds = async () => {
    if (!selectedUser || !addAmount) return;
    try {
      const amount = parseFloat(addAmount);
      if (isNaN(amount) || amount <= 0) {
        toast({ title: 'Lỗi', description: 'Số tiền không hợp lệ', variant: 'destructive' });
        return;
      }
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedUser.user_id,
          type: 'bonus',
          amount,
          status: 'approved',
          admin_note: `Admin cộng tiền: ${amount.toLocaleString()} VND`,
        });
      if (error) throw error;
      toast({ title: 'Thành công', description: `Đã cộng ${amount.toLocaleString()} VND` });
      setAddAmount('');
      setIsAddFundsOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error adding funds:', error);
      toast({ title: 'Lỗi', description: 'Không thể cộng tiền', variant: 'destructive' });
    }
  };

  // Mở dialog xem giao dịch theo người dùng
  const openTransactionsForUser = async (user: UserProfile) => {
    setSelectedUser(user);
    setIsTransactionsOpen(true);
    setIsTransLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('id, type, amount, status, created_at')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setUserTransactions((data || []) as SimpleTransaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách giao dịch', variant: 'destructive' });
    } finally {
      setIsTransLoading(false);
    }
  };

  // Mở dialog lịch sử cá cược (demo)
  const openBetHistoryForUser = (user: UserProfile) => {
    setSelectedUser(user);
    setIsBetHistoryOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      // Delete user roles first
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userToDelete.user_id);

      if (roleError) throw roleError;

      // Delete user transactions
      const { error: transactionError } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', userToDelete.user_id);

      if (transactionError) throw transactionError;

      // Delete user bank accounts
      const { error: bankError } = await supabase
        .from('user_bank_accounts')
        .delete()
        .eq('user_id', userToDelete.user_id);

      if (bankError) throw bankError;

      // Delete user notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userToDelete.user_id);

      if (notificationError) throw notificationError;

      // Delete user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userToDelete.user_id);

      if (profileError) throw profileError;

      // Delete from auth.users (requires service role)
      const { error: authError } = await supabase.auth.admin.deleteUser(userToDelete.user_id);
      
      if (authError && authError.message !== 'User not found') {
        console.warn('Could not delete auth user:', authError);
        // Continue anyway since profile is deleted
      }

      toast({
        title: 'Thành công',
        description: `Đã xóa người dùng ${userToDelete.username}`,
        variant: 'default',
      });

      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa người dùng. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone_number?.includes(searchTerm)
  );

  const sortedUsers = React.useMemo(() => {
    const arr = [...filteredUsers];
    const getVal = (u: UserProfile, key: SortKey): string | number => {
      switch (key) {
        case 'full_name':
          return (u.full_name || '').toLowerCase();
        case 'username':
          return (u.username || '').toLowerCase();
        case 'balance':
          return Number(u.balance) || 0;
        case 'created_at':
          return new Date(u.created_at).getTime();
        case 'last_login_at':
          return u.last_login_at ? new Date(u.last_login_at).getTime() : 0;
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
  }, [filteredUsers, sortKey, sortDir]);

  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.last_login_at).length;
  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="text-gray-600">Quản lý tất cả người dùng trong hệ thống</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Người dùng đã đăng ký
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng hoạt động</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                Đã đăng nhập gần đây
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng số dư</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBalance.toLocaleString()} VND</div>
              <p className="text-xs text-muted-foreground">
                Tổng tiền trong hệ thống
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm người dùng</CardTitle>
            <CardDescription>
              Tìm kiếm theo tên, username hoặc số điện thoại
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách người dùng</CardTitle>
            <CardDescription>
              Tất cả người dùng trong hệ thống
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
                      <TableHead className="w-[200px]">
                        <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleSort('full_name')}>
                          Thông tin <ArrowUpDown className="ml-1 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleSort('balance')}>
                          Số dư <ArrowUpDown className="ml-1 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[200px]">Liên hệ</TableHead>
                      <TableHead className="w-[120px]">
                        <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleSort('created_at')}>
                          Ngày tạo <ArrowUpDown className="ml-1 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[140px]">
                        <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleSort('last_login_at')}>
                          Đăng nhập cuối <ArrowUpDown className="ml-1 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="w-[280px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{user.full_name}</div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            {user.balance.toLocaleString()} VND
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {user.phone_number && (
                              <div className="flex items-center text-sm text-gray-600">
                                <Phone className="w-3 h-3 mr-1" />
                                {user.phone_number}
                              </div>
                            )}
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.user_id}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(user.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          {user.last_login_at ? (
                            <div className="text-sm text-gray-600">
                              {new Date(user.last_login_at).toLocaleDateString('vi-VN')}
                              <br />
                              <span className="text-xs text-gray-400">
                                {new Date(user.last_login_at).toLocaleTimeString('vi-VN')}
                              </span>
                            </div>
                          ) : (
                            <Badge variant="secondary">Chưa đăng nhập</Badge>
                          )}
                        </TableCell>
                        <TableCell className="w-[280px]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="sm" className="min-w-[140px] justify-between">
                                Thao tác
                                <MoreVertical className="ml-2 h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-xl border-border/30 shadow-xl z-50">
                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsUserDetailsDialogOpen(true); }}>
                                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsAddFundsOpen(true); }}>
                                <DollarSign className="mr-2 h-4 w-4" /> Cộng tiền
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedUser(user); setIsEditUserModalOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa người dùng
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { openTransactionsForUser(user); }}>
                                <List className="mr-2 h-4 w-4" /> Danh sách giao dịch
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { openBetHistoryForUser(user); }}>
                                <History className="mr-2 h-4 w-4" /> Lịch sử cá cược (demo)
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { setUserToDelete(user); setIsDeleteDialogOpen(true); }}>
                                <Trash2 className="mr-2 h-4 w-4" /> Xóa người dùng
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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

      {/* User Details Dialog */}
      <Dialog open={isUserDetailsDialogOpen} onOpenChange={setIsUserDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết người dùng</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về người dùng
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <ViewUserDetails user={selectedUser} />

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Thống kê giao dịch</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Giao dịch nạp</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Giao dịch rút</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-600">Tổng giao dịch</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => setIsEditUserModalOpen(false)}
        user={selectedUser}
        onUserUpdated={fetchUsers}
      />

      {/* Add Funds Dialog */}
      <Dialog open={isAddFundsOpen} onOpenChange={setIsAddFundsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cộng tiền cho người dùng</DialogTitle>
            <DialogDescription>Nhập số tiền cần cộng vào tài khoản của {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Số tiền (VND)</Label>
              <Input placeholder="Ví dụ: 100000" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddFundsOpen(false)}>Hủy</Button>
              <Button onClick={handleAddFunds}>Cộng tiền</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Transactions Dialog */}
      <Dialog open={isTransactionsOpen} onOpenChange={setIsTransactionsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Danh sách giao dịch</DialogTitle>
            <DialogDescription>Giao dịch gần đây của {selectedUser?.username}</DialogDescription>
          </DialogHeader>
          {isTransLoading ? (
            <div className="flex items-center justify-center h-40">Đang tải...</div>
          ) : userTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead className="text-right">Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userTransactions.map((t) => (
                    <TableRow key={t.id}>
                      <TableCell>{new Date(t.created_at).toLocaleString('vi-VN')}</TableCell>
                      <TableCell className="capitalize">{t.type}</TableCell>
                      <TableCell className="text-right">{t.amount.toLocaleString()} VND</TableCell>
                      <TableCell className="capitalize">{t.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-6">Chưa có giao dịch</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Betting History Demo Dialog */}
      <Dialog open={isBetHistoryOpen} onOpenChange={setIsBetHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử cá cược (Demo)</DialogTitle>
            <DialogDescription>Sẽ tích hợp API bên thứ 3 sau. Dữ liệu dưới đây chỉ để minh họa.</DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trò chơi</TableHead>
                  <TableHead className="text-right">Cược</TableHead>
                  <TableHead className="text-right">Kết quả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { time: new Date().toLocaleString('vi-VN'), game: 'Slot Demo', bet: 50000, result: '+150000' },
                  { time: new Date(Date.now()-3600*1000).toLocaleString('vi-VN'), game: 'Baccarat Demo', bet: 100000, result: '-100000' },
                  { time: new Date(Date.now()-7200*1000).toLocaleString('vi-VN'), game: 'Roulette Demo', bet: 20000, result: '+40000' },
                ].map((r, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{r.time}</TableCell>
                    <TableCell>{r.game}</TableCell>
                    <TableCell className="text-right">{r.bet.toLocaleString()} VND</TableCell>
                    <TableCell className="text-right">{r.result}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.username}</strong> không?
              </p>
              <p className="text-destructive font-medium">
                ⚠️ Hành động này sẽ xóa toàn bộ dữ liệu của người dùng bao gồm:
              </p>
              <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                <li>Thông tin cá nhân</li>
                <li>Lịch sử giao dịch</li>
                <li>Tài khoản ngân hàng</li>
                <li>Thông báo</li>
                <li>Vai trò và quyền hạn</li>
              </ul>
              <p className="text-destructive font-medium">
                Dữ liệu sẽ không thể khôi phục sau khi xóa.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa người dùng
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default Users; 