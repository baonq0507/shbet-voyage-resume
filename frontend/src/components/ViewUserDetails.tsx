import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

export function ViewUserDetails({ user }: { user: UserProfile }) {
  const [userRole, setUserRole] = useState<'admin' | 'agent' | 'user'>('user');
  const [agentInfo, setAgentInfo] = useState<{ id: string; referral_code: string | null } | null>(null);
  const { toast } = useToast();
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.user_id) return;
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
          const hasAdmin = roles.some((r: any) => r.role === 'admin');
          const hasAgent = roles.some((r: any) => r.role === 'agent');
          setUserRole(hasAdmin ? 'admin' : hasAgent ? 'agent' : 'user');
        }
      } catch (err) {
        console.error('Error fetching user role:', err);
        setUserRole('user');
      }
    };

    fetchUserRole();
  }, [user?.user_id]);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!user?.user_id) return;
      if (userRole !== 'agent') { setAgentInfo(null); return; }
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('id, referral_code')
          .eq('user_id', user.user_id)
          .maybeSingle();
        if (!error) {
          setAgentInfo(data ? { id: data.id, referral_code: data.referral_code } : null);
        }
      } catch {}
    };

    fetchAgent();
  }, [user?.user_id, userRole]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Thông tin cơ bản */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Thông tin cơ bản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và tên</Label>
            <Input id="full_name" value={user.full_name || ''} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập</Label>
            <Input id="username" value={user.username || ''} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Số điện thoại</Label>
            <Input id="phone_number" value={user.phone_number || ''} readOnly disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="balance">Số dư (VND)</Label>
            <Input id="balance" type="number" value={user.balance ?? 0} readOnly disabled />
          </div>
        </div>

        {/* Ảnh đại diện */}
        <div className="space-y-2">
          <Label>Ảnh đại diện</Label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border">
              <img
                src={user.avatar_url || '/placeholder.svg'}
                alt="Ảnh đại diện người dùng"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="flex-1">
              <Input id="avatar_url" value={user.avatar_url || ''} readOnly disabled />
            </div>
          </div>
        </div>
      </div>

      {/* Quyền hạn */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold border-b pb-2">Quyền hạn</h3>
        <div>
          <Label className="mb-1 block">Vai trò người dùng</Label>
          <div className="text-sm">
            {userRole === 'admin' ? 'Quản trị viên' : userRole === 'agent' ? 'Đại lý' : 'Người dùng thường'}
          </div>
        </div>
      </div>

      {/* Link mời đại lý */}
      {userRole === 'agent' && agentInfo?.referral_code && (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold border-b pb-2">Link mời đại lý</h3>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
            <div className="space-y-2">
              <Label>Mã giới thiệu</Label>
              <Input value={agentInfo.referral_code} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Link mời</Label>
              <div className="flex gap-2">
                <Input
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${agentInfo.referral_code}`}
                  readOnly
                />
                <Button
                  type="button"
                  onClick={() => {
                    const link = `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${agentInfo.referral_code}`;
                    navigator.clipboard.writeText(link).then(() => {
                      toast({ title: 'Đã sao chép', description: 'Link mời đã được sao chép' });
                    });
                  }}
                  variant="outline"
                >
                  Sao chép
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Thông tin tài khoản */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Thông tin tài khoản</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                : 'Chưa đăng nhập'}
            </p>
          </div>
          <div>
            <Label className="text-muted-foreground">IP cuối</Label>
            <p className="font-mono text-xs">{user.last_login_ip || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
