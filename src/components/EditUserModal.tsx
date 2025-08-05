import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, UserCog } from 'lucide-react';

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

interface UserRole {
  role: 'admin' | 'user';
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUserUpdated: () => void;
}

export function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    balance: 0,
    phone_number: '',
    avatar_url: '',
  });

  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        username: user.username || '',
        balance: user.balance || 0,
        phone_number: user.phone_number || '',
        avatar_url: user.avatar_url || '',
      });
      fetchUserRole();
    }
  }, [user]);

  const fetchUserRole = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.user_id)
        .order('role', { ascending: false });

      if (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
      } else {
        const roles = data || [];
        const hasAdmin = roles.some(r => r.role === 'admin');
        setUserRole(hasAdmin ? 'admin' : 'user');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          balance: formData.balance,
          phone_number: formData.phone_number || null,
          avatar_url: formData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.user_id);

      if (profileError) throw profileError;

      // Update user role
      // First, delete existing roles
      const { error: deleteError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', user.user_id);

      if (deleteError) throw deleteError;

      // Then, insert the new role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.user_id,
          role: userRole,
        });

      if (roleError) throw roleError;

      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin người dùng',
        variant: 'default',
      });

      onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin người dùng',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            Chỉnh sửa người dùng
          </DialogTitle>
          <DialogDescription>
            Cập nhật thông tin và quyền hạn của người dùng {user.username}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Thông tin cơ bản</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ và tên *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Nhập họ và tên"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone_number">Số điện thoại</Label>
                <Input
                  id="phone_number"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="balance">Số dư (VND) *</Label>
                <Input
                  id="balance"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.balance}
                  onChange={(e) => handleInputChange('balance', parseFloat(e.target.value) || 0)}
                  placeholder="Nhập số dư"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar_url">URL Avatar</Label>
              <Input
                id="avatar_url"
                value={formData.avatar_url}
                onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                placeholder="Nhập URL avatar"
              />
            </div>
          </div>

          {/* Role Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Quyền hạn</h3>
            
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò người dùng</Label>
              <Select value={userRole} onValueChange={(value: 'admin' | 'user') => setUserRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Người dùng thường</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {userRole === 'admin' 
                  ? 'Quản trị viên có toàn quyền truy cập vào hệ thống' 
                  : 'Người dùng thường chỉ có quyền truy cập cơ bản'
                }
              </p>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Thông tin tài khoản</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">User ID</Label>
                <p className="font-mono text-xs break-all">{user.user_id}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Ngày tạo</Label>
                <p>{new Date(user.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">Đăng nhập cuối</Label>
                <p>
                  {user.last_login_at 
                    ? new Date(user.last_login_at).toLocaleDateString('vi-VN')
                    : 'Chưa đăng nhập'
                  }
                </p>
              </div>
              
              <div>
                <Label className="text-muted-foreground">IP cuối</Label>
                <p className="font-mono text-xs">{user.last_login_ip || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}