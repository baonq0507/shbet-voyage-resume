
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
  referred_by?: string | null;
}

interface UserRole {
  role: 'admin' | 'agent' | 'user';
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUserUpdated: () => void;
}

export function EditUserModal({ isOpen, onClose, user, onUserUpdated }: EditUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'agent' | 'user'>('user');
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    balance: 0,
    phone_number: '',
    avatar_url: '',
  });
  const [uploading, setUploading] = useState(false);

  // Agent level management
  const [agentLevels, setAgentLevels] = useState<
    { id: string; name: string; code: string; commission_percentage: number }[]
  >([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');

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

  useEffect(() => {
    if (userRole === 'agent' && user) {
      fetchAgentLevels();
      fetchUserAgentRecord();
    }
  }, [userRole, user]);

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
        const roles = (data || []).map((r: UserRole) => r.role);
        if (roles.includes('admin')) {
          setUserRole('admin');
        } else if (roles.includes('agent')) {
          setUserRole('agent');
        } else {
          setUserRole('user');
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    }
  };


  // Fetch active agent levels
  const fetchAgentLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_levels')
        .select('id, name, code, commission_percentage, is_active')
        .eq('is_active', true)
        .order('commission_percentage', { ascending: true });
      if (error) throw error;
      setAgentLevels(data || []);
    } catch (err) {
      console.error('Error fetching agent levels:', err);
    }
  };

  // Fetch agent record for this user to prefill level
  const fetchUserAgentRecord = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('id, level_id')
        .eq('user_id', user.user_id)
        .maybeSingle();
      if (error) throw error;
      if (data) setSelectedLevelId(data.level_id || '');
    } catch (err) {
      console.error('Error fetching user agent record:', err);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filePath = `${user?.user_id || 'temp'}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      toast({ title: 'Thành công', description: 'Đã tải lên avatar.' });
    } catch (error) {
      console.error('Upload avatar error:', error);
      toast({ title: 'Lỗi', description: 'Tải lên avatar thất bại.', variant: 'destructive' });
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
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

      // Ensure agent record and level when role is 'agent'
      if (userRole === 'agent') {
        const { data: existingAgent, error: agentFetchErr } = await supabase
          .from('agents')
          .select('id')
          .eq('user_id', user.user_id)
          .maybeSingle();
        if (agentFetchErr) throw agentFetchErr;

        if (!existingAgent) {
          const { error: agentInsertErr } = await supabase
            .from('agents')
            .insert({
              user_id: user.user_id,
              level_id: selectedLevelId || null,
              is_active: true,
            });
          if (agentInsertErr) throw agentInsertErr;
        } else {
          const { error: agentUpdateErr } = await supabase
            .from('agents')
            .update({
              level_id: selectedLevelId || null,
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingAgent.id);
          if (agentUpdateErr) throw agentUpdateErr;
        }
      }

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
              <Label>Ảnh đại diện</Label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full overflow-hidden border">
                  <img
                    src={formData.avatar_url || '/placeholder.svg'}
                    alt="Xem trước avatar người dùng"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                  />
                  <div className="text-xs text-muted-foreground">
                    {uploading ? (
                      <span className="inline-flex items-center">
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        Đang tải lên...
                      </span>
                    ) : (
                      'Chọn ảnh để tải lên hoặc nhập URL bên dưới.'
                    )}
                  </div>
                  <Input
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => handleInputChange('avatar_url', e.target.value)}
                    placeholder="Dán URL avatar (tùy chọn)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Quyền hạn</h3>
            
            <div className="space-y-2">
              <Label htmlFor="role">Vai trò người dùng</Label>
              <Select value={userRole} onValueChange={(value: 'admin' | 'agent' | 'user') => setUserRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Người dùng thường</SelectItem>
                  <SelectItem value="agent">Đại lý</SelectItem>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {userRole === 'admin'
                  ? 'Quản trị viên có toàn quyền truy cập vào hệ thống'
                  : userRole === 'agent'
                  ? 'Đại lý có quyền quản lý người dùng giới thiệu và nhận hoa hồng'
                  : 'Người dùng thường chỉ có quyền truy cập cơ bản'}
              </p>
            </div>
          </div>


          {/* Agent Level (only for agent role) */}
          {userRole === 'agent' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Cấp độ đại lý</h3>
              <div className="space-y-2">
                <Label>Chọn cấp độ</Label>
                <Select value={selectedLevelId || 'none'} onValueChange={(v) => setSelectedLevelId(v === 'none' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp độ" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-background">
                    <SelectItem value="none">Không chọn</SelectItem>
                    {agentLevels.map((lvl) => (
                      <SelectItem key={lvl.id} value={lvl.id}>
                        {lvl.name} ({lvl.code}) · {Number(lvl.commission_percentage)}%
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Cấp độ ảnh hưởng đến % hoa hồng mặc định của đại lý.</p>
              </div>
            </div>
          )}

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
