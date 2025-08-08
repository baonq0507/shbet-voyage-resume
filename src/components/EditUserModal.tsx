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
  const [uploading, setUploading] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [commission, setCommission] = useState<number>(10);
  const [referralCode, setReferralCode] = useState<string>('');
  const [referralCount, setReferralCount] = useState<number>(0);

  const { toast } = useToast();

  const [agentsOptions, setAgentsOptions] = useState<{ id: string; display: string }[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

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
      fetchAgentInfo();
      fetchAllAgents();
      setSelectedAgentId(user.referred_by || '');
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

  const fetchAgentInfo = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('commission_percentage, referral_code, referral_count')
        .eq('user_id', user.user_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching agent info:', error);
        setIsAgent(false);
        setReferralCode('');
        setReferralCount(0);
        return;
      }

      if (data) {
        setIsAgent(true);
        setCommission(Number((data as any).commission_percentage) || 10);
        setReferralCode((data as any).referral_code || '');
        setReferralCount(Number((data as any).referral_count) || 0);
      } else {
        setIsAgent(false);
        setReferralCode('');
        setReferralCount(0);
      }
    } catch (err) {
      console.error('Error fetching agent info:', err);
      setIsAgent(false);
    }
  };

  const fetchAllAgents = async () => {
    try {
      const { data: agents, error } = await supabase
        .from('agents')
        .select('id, user_id, referral_code, is_active');
      if (error) throw error;

      const userIds = (agents || []).map((a: any) => a.user_id);
      let profilesMap = new Map<string, { full_name: string; username: string }>();

      if (userIds.length > 0) {
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('user_id, full_name, username')
          .in('user_id', userIds);
        if (!pErr && profiles) {
          profiles.forEach((p: any) => profilesMap.set(p.user_id, { full_name: p.full_name, username: p.username }));
        }
      }

      const options = (agents || []).map((a: any) => {
        const p = profilesMap.get(a.user_id);
        const name = p ? `${p.full_name} (@${p.username})` : a.user_id;
        const code = a.referral_code ? ` · ${a.referral_code}` : '';
        return { id: a.id as string, display: `${name}${code}` };
      });
      setAgentsOptions(options);
    } catch (err) {
      console.error('Error fetching agents list:', err);
    }
  };
  const handleMakeAgent = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Generate a unique referral code via RPC
      const { data: codeData, error: codeError } = await supabase.rpc('generate_referral_code');
      if (codeError) throw codeError;
      const code = (codeData as string) || '';

      const { error } = await supabase
        .from('agents')
        .insert({
          user_id: user.user_id,
          commission_percentage: commission,
          referral_code: code,
        });

      if (error) throw error;

      toast({ title: 'Thành công', description: 'Đã chuyển người dùng thành đại lý.' });
      setIsAgent(true);
      setReferralCode(code);
      await fetchAgentInfo();
      onUserUpdated();
    } catch (error) {
      console.error('Error making agent:', error);
      toast({ title: 'Lỗi', description: 'Không thể chuyển thành đại lý', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  const handleUpdateCommission = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .update({ commission_percentage: commission })
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({ title: 'Thành công', description: 'Đã cập nhật % hoa hồng.' });
      await fetchAgentInfo();
      onUserUpdated();
    } catch (error) {
      console.error('Error updating commission:', error);
      toast({ title: 'Lỗi', description: 'Không thể cập nhật hoa hồng', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  const handleRevokeAgent = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('user_id', user.user_id);

      if (error) throw error;

      toast({ title: 'Thành công', description: 'Đã hủy đại lý cho người dùng.' });
      setIsAgent(false);
      setReferralCode('');
      setReferralCount(0);
      onUserUpdated();
    } catch (error) {
      console.error('Error revoking agent:', error);
      toast({ title: 'Lỗi', description: 'Không thể hủy đại lý', variant: 'destructive' });
    } finally {
      setLoading(false);
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
          referred_by: selectedAgentId || null,
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
          {/* Assign Agent */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Phân công đại lý</h3>
            <div className="space-y-2">
              <Label>Đại lý phụ trách</Label>
              <Select value={selectedAgentId || 'none'} onValueChange={(v) => setSelectedAgentId(v === 'none' ? '' : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đại lý" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-background">
                  <SelectItem value="none">Không gán</SelectItem>
                  {agentsOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>{opt.display}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Gán đại lý quản lý cho người dùng này.</p>
            </div>
          </div>

          {/* Agent Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold border-b pb-2">Quản lý đại lý</h3>
            {isAgent ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mã giới thiệu</Label>
                    <Input value={referralCode} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Số lượt giới thiệu</Label>
                    <Input value={referralCount} readOnly />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>% Hoa hồng</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={commission}
                      onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={handleUpdateCommission} disabled={loading}>
                    Cập nhật hoa hồng
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleRevokeAgent} disabled={loading}>
                    Hủy đại lý
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>% Hoa hồng (mặc định 10%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={commission}
                    onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                  />
                </div>
                <Button type="button" onClick={handleMakeAgent} disabled={loading}>
                  Chuyển thành đại lý
                </Button>
              </div>
            )}
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