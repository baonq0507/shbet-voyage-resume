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
import { Users as UsersIcon, Search, Eye, DollarSign, Calendar, Phone, Mail, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { EditUserModal } from '@/components/EditUserModal';

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

  const { toast } = useToast();

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
                      <TableHead>Thông tin</TableHead>
                      <TableHead>Số dư</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Đăng nhập cuối</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
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
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsUserDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Chi tiết
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setIsEditUserModalOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Sửa
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setUserToDelete(user);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Xóa
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Họ tên</Label>
                  <p className="text-lg font-medium">{selectedUser.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Username</Label>
                  <p className="text-lg font-medium">@{selectedUser.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Số dư</Label>
                  <p className="text-lg font-medium text-green-600">
                    {selectedUser.balance.toLocaleString()} VND
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Số điện thoại</Label>
                  <p className="text-lg font-medium">
                    {selectedUser.phone_number || 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Email</Label>
                  <p className="text-lg font-medium">{selectedUser.user_id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ngày tạo</Label>
                  <p className="text-lg font-medium">
                    {new Date(selectedUser.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Đăng nhập cuối</Label>
                  <p className="text-lg font-medium">
                    {selectedUser.last_login_at ? (
                      <>
                        {new Date(selectedUser.last_login_at).toLocaleDateString('vi-VN')}
                        <br />
                        <span className="text-sm text-gray-500">
                          {new Date(selectedUser.last_login_at).toLocaleTimeString('vi-VN')}
                        </span>
                      </>
                    ) : (
                      'Chưa đăng nhập'
                    )}
                  </p>
                </div>
              </div>

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