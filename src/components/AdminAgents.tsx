import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AgentRow {
  id: string;
  user_id: string;
  commission_percentage: number;
  total_commission: number;
  referral_code?: string | null;
  referral_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string; username: string; phone_number?: string };
}

interface CommissionLevel {
  id: string;
  agent_id: string;
  level: number;
  commission_percentage: number;
  created_at?: string;
  updated_at?: string;
}

interface ReferredUserDetail {
  user_id: string;
  username: string;
  full_name: string;
  total_deposit: number;
  total_withdrawal: number;
  commission_earned: number;
}

export const AdminAgents: React.FC = () => {
  const { toast } = useToast();

  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'levels'>('list');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [levels, setLevels] = useState<CommissionLevel[]>([]);
  const [newLevel, setNewLevel] = useState<number | ''>('');
  const [newPercent, setNewPercent] = useState<number | ''>('');
  const [assignUsername, setAssignUsername] = useState('');
  const [assignToAgentId, setAssignToAgentId] = useState<string | null>(null);
  
  // States for adding new agent level
  const [newLevelName, setNewLevelName] = useState('');
  const [newLevelCode, setNewLevelCode] = useState('');
  const [newLevelCommission, setNewLevelCommission] = useState<number | ''>('');
  const [newLevelDescription, setNewLevelDescription] = useState('');
  const [agentLevels, setAgentLevels] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  // View users count modal state
  const [viewUsersOpen, setViewUsersOpen] = useState(false);
  const [viewUsersCount, setViewUsersCount] = useState<number | null>(null);
  const [viewUsersLoading, setViewUsersLoading] = useState(false);
  const [selectedAgentName, setSelectedAgentName] = useState<string>('');
  const [selectedAgentCommission, setSelectedAgentCommission] = useState<number>(0);

  const [referredUsers, setReferredUsers] = useState<ReferredUserDetail[]>([]);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      const list = (data || []) as AgentRow[];
      const userIds = list.map((a) => a.user_id);

      let profilesMap = new Map<string, any>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, phone_number')
          .in('user_id', userIds);
        profiles?.forEach((p: any) => profilesMap.set(p.user_id, p));
      }

      setAgents(list.map((a) => ({ ...a, profile: profilesMap.get(a.user_id) })));
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({ title: 'Lỗi', description: 'Không thể tải danh sách đại lý', variant: 'destructive' });
    }
  };

  const fetchLevels = async (agentId: string) => {
    try {
      const { data, error } = await supabase
        .from('agent_commission_levels')
        .select('*')
        .eq('agent_id', agentId)
        .order('level', { ascending: true });
      if (error) throw error;
      setLevels((data || []) as CommissionLevel[]);
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast({ title: 'Lỗi', description: 'Không thể tải cấp bậc', variant: 'destructive' });
    }
  };

  const updateAgentCommission = async (agentId: string, percent: number) => {
    try {
      const { error } = await supabase
        .from('agents')
        .update({ commission_percentage: percent })
        .eq('id', agentId);
      if (error) throw error;
      toast({ title: 'Đã cập nhật', description: '% hoa hồng đã cập nhật' });
      fetchAgents();
    } catch (error) {
      console.error('Error updating agent commission:', error);
      toast({ title: 'Lỗi', description: 'Không thể cập nhật % hoa hồng', variant: 'destructive' });
    }
  };

  const addLevel = async () => {
    if (!selectedAgentId || newLevel === '' || newPercent === '') {
      toast({ title: 'Thiếu dữ liệu', description: 'Chọn đại lý và nhập level/%', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase
        .from('agent_commission_levels')
        .insert({ agent_id: selectedAgentId, level: Number(newLevel), commission_percentage: Number(newPercent) });
      if (error) throw error;
      setNewLevel('');
      setNewPercent('');
      fetchLevels(selectedAgentId);
      toast({ title: 'Thành công', description: 'Đã thêm cấp bậc' });
    } catch (error) {
      console.error('Error adding level:', error);
      toast({ title: 'Lỗi', description: 'Không thể thêm cấp bậc', variant: 'destructive' });
    }
  };

  const updateLevel = async (levelId: string, level: number, percent: number) => {
    try {
      const { error } = await supabase
        .from('agent_commission_levels')
        .update({ level, commission_percentage: percent })
        .eq('id', levelId);
      if (error) throw error;
      if (selectedAgentId) fetchLevels(selectedAgentId);
      toast({ title: 'Đã cập nhật', description: 'Cập nhật cấp bậc thành công' });
    } catch (error) {
      console.error('Error updating level:', error);
      toast({ title: 'Lỗi', description: 'Không thể cập nhật cấp bậc', variant: 'destructive' });
    }
  };

  const deleteLevel = async (levelId: string) => {
    try {
      const { error } = await supabase
        .from('agent_commission_levels')
        .delete()
        .eq('id', levelId);
      if (error) throw error;
      if (selectedAgentId) fetchLevels(selectedAgentId);
      toast({ title: 'Đã xóa', description: 'Đã xóa cấp bậc' });
    } catch (error) {
      console.error('Error deleting level:', error);
      toast({ title: 'Lỗi', description: 'Không thể xóa cấp bậc', variant: 'destructive' });
    }
  };

  const fetchReferredUsersDetails = async (agentId: string) => {
    try {
      const { data: refs, error: refErr } = await supabase
        .from('agent_referrals')
        .select('referred_user_id, commission_earned')
        .eq('agent_id', agentId);
      if (refErr) throw refErr;

      const referrals = refs || [];
      if (referrals.length === 0) {
        setReferredUsers([]);
        return;
      }

      const userIds = referrals.map((r: any) => r.referred_user_id);

      const [{ data: profiles }, { data: txs }] = await Promise.all([
        supabase
          .from('profiles')
          .select('user_id, username, full_name')
          .in('user_id', userIds),
        supabase
          .from('transactions')
          .select('user_id, type, amount, status')
          .in('user_id', userIds)
          .eq('status', 'approved'),
      ]);

      const profileMap = new Map<string, any>();
      (profiles || []).forEach((p: any) => profileMap.set(p.user_id, p));

      const aggregates = new Map<string, { deposit: number; withdrawal: number }>();
      (txs || []).forEach((t: any) => {
        const agg = aggregates.get(t.user_id) || { deposit: 0, withdrawal: 0 };
        if (t.type === 'deposit') agg.deposit += Number(t.amount) || 0;
        if (t.type === 'withdrawal') agg.withdrawal += Number(t.amount) || 0;
        aggregates.set(t.user_id, agg);
      });

      const result: ReferredUserDetail[] = referrals.map((r: any) => {
        const prof = profileMap.get(r.referred_user_id) || {};
        const agg = aggregates.get(r.referred_user_id) || { deposit: 0, withdrawal: 0 };
        return {
          user_id: r.referred_user_id,
          username: prof.username || '—',
          full_name: prof.full_name || '—',
          total_deposit: agg.deposit,
          total_withdrawal: agg.withdrawal,
          commission_earned: Number(r.commission_earned) || 0,
        };
      });

      setReferredUsers(result);
    } catch (error) {
      console.error('Error fetching referred users details:', error);
      setReferredUsers([]);
      toast({ title: 'Lỗi', description: 'Không thể tải chi tiết người dùng', variant: 'destructive' });
    }
  };

  const openUsersCount = async (agent: AgentRow) => {
    try {
      setSelectedAgentId(agent.id);
      setSelectedAgentName(
        agent.profile?.username || agent.profile?.full_name || agent.referral_code || 'Đại lý'
      );
      setSelectedAgentCommission(Number(agent.commission_percentage) || 0);
      setViewUsersOpen(true);
      setViewUsersLoading(true);
      const { count, error } = await supabase
        .from('agent_referrals')
        .select('id', { head: true, count: 'exact' })
        .eq('agent_id', agent.id);
      if (error) throw error;
      setViewUsersCount(count || 0);
      await fetchReferredUsersDetails(agent.id);
    } catch (error) {
      console.error('Error counting users for agent:', error);
      toast({ title: 'Lỗi', description: 'Không thể lấy số lượng người dùng', variant: 'destructive' });
      setViewUsersCount(null);
    } finally {
      setViewUsersLoading(false);
    }
  };

  const fetchAgentLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_levels' as any)
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAgentLevels(data || []);
    } catch (error) {
      console.error('Error fetching agent levels:', error);
    }
  };

  const createNewAgentLevel = async () => {
    if (!newLevelName || !newLevelCode || newLevelCommission === '') {
      toast({ title: 'Thiếu dữ liệu', description: 'Vui lòng điền đầy đủ thông tin', variant: 'destructive' });
      return;
    }

    try {
      // Check if code already exists
      const { data: existing } = await supabase
        .from('agent_levels' as any)
        .select('id')
        .eq('code', newLevelCode)
        .maybeSingle();

      if (existing) {
        toast({ title: 'Lỗi', description: 'Mã cấp bậc đã tồn tại', variant: 'destructive' });
        return;
      }

      // Create new agent level
      const { error } = await supabase
        .from('agent_levels' as any)
        .insert({
          name: newLevelName,
          code: newLevelCode,
          commission_percentage: Number(newLevelCommission),
          is_active: true
        });

      if (error) throw error;

      toast({ title: 'Thành công', description: 'Đã tạo cấp bậc đại lý mới' });
      setNewLevelName('');
      setNewLevelCode('');
      setNewLevelCommission('');
      setNewLevelDescription('');
      fetchAgentLevels();
    } catch (error) {
      console.error('Error creating agent level:', error);
      toast({ title: 'Lỗi', description: 'Không thể tạo cấp bậc đại lý', variant: 'destructive' });
    }
  };

  const assignUser = async () => {
    if (!assignUsername || !assignToAgentId) {
      toast({ title: 'Thiếu dữ liệu', description: 'Nhập username và chọn đại lý', variant: 'destructive' });
      return;
    }

    try {
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('user_id, username, referred_by')
        .eq('username', assignUsername)
        .maybeSingle();
      if (profErr) throw profErr;
      if (!profile?.user_id) {
        toast({ title: 'Không tìm thấy', description: 'Không tìm thấy người dùng', variant: 'destructive' });
        return;
      }

      const { error: updErr } = await supabase
        .from('profiles')
        .update({ referred_by: assignToAgentId })
        .eq('user_id', profile.user_id);
      if (updErr) throw updErr;

      const { data: existingRef } = await supabase
        .from('agent_referrals')
        .select('id')
        .eq('agent_id', assignToAgentId)
        .eq('referred_user_id', profile.user_id)
        .maybeSingle();
      if (!existingRef) {
        await supabase.from('agent_referrals').insert({
          agent_id: assignToAgentId!,
          referred_user_id: profile.user_id,
          status: 'active',
          commission_earned: 0,
        });
      }

      const { count } = await supabase
        .from('agent_referrals')
        .select('id', { head: true, count: 'exact' })
        .eq('agent_id', assignToAgentId);
      if (typeof count === 'number') {
        await supabase.from('agents').update({ referral_count: count }).eq('id', assignToAgentId);
      }

      toast({ title: 'Thành công', description: `Đã gán ${assignUsername} vào đại lý` });
      setAssignUsername('');
      fetchAgents();
    } catch (error) {
      console.error('Error assigning user:', error);
      toast({ title: 'Lỗi', description: 'Không thể gán người dùng', variant: 'destructive' });
    }
  };

  useEffect(() => {
    fetchAgentLevels();
    fetchAgents();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý đại lý</h2>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'levels')} className="w-full">
        <TabsList>
          <TabsTrigger value="list">Danh sách đại lý</TabsTrigger>
          <TabsTrigger value="levels">Cấp bậc</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Danh sách đại lý</CardTitle>
                <CardDescription>Quản lý và theo dõi đại lý</CardDescription>
              </div>
              <Button variant="outline" onClick={fetchAgents}>Tải lại</Button>
            </CardHeader>
            <CardContent>
              {agents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Đại lý</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Mã giới thiệu</TableHead>
                      <TableHead>% Hoa hồng</TableHead>
                      <TableHead>Tổng hoa hồng</TableHead>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{agent.profile?.full_name || '—'}</TableCell>
                        <TableCell>{agent.profile?.username || '—'}</TableCell>
                        <TableCell>{agent.referral_code || '—'}</TableCell>
                        <TableCell>{agent.commission_percentage}%</TableCell>
                        <TableCell>{agent.total_commission?.toLocaleString?.() || 0}</TableCell>
                        <TableCell>{agent.referral_count ?? 0}</TableCell>
                        <TableCell>
                          <Badge variant={agent.is_active ? 'default' : 'secondary'}>
                            {agent.is_active ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button variant="outline" size="sm" onClick={() => openUsersCount(agent)}>
                            Xem người dùng
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Chưa có đại lý nào.</p>
              )}
            </CardContent>
          </Card>

          <Dialog open={viewUsersOpen} onOpenChange={setViewUsersOpen}>
            <DialogContent className="sm:max-w-[720px]">
              <DialogHeader>
                <DialogTitle>Số người dùng của đại lý</DialogTitle>
                <DialogDescription>Đại lý: {selectedAgentName}</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="text-center">
                  {viewUsersLoading ? (
                    <span>Đang tải...</span>
                  ) : (
                    <p className="text-base font-medium">Tổng: {viewUsersCount ?? 0} người dùng</p>
                  )}
                </div>
                {!viewUsersLoading && (
                  referredUsers.length > 0 ? (
                    <div className="max-h-96 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Người dùng</TableHead>
                            <TableHead>Họ tên</TableHead>
                            <TableHead className="text-right">Tổng nạp</TableHead>
                            <TableHead className="text-right">Tổng rút</TableHead>
                            <TableHead className="text-right">Hoa hồng (theo % hiện tại)</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {referredUsers.map((u) => (
                            <TableRow key={u.user_id}>
                              <TableCell className="font-medium">{u.username}</TableCell>
                              <TableCell>{u.full_name}</TableCell>
                              <TableCell className="text-right">{u.total_deposit.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{u.total_withdrawal.toLocaleString()}</TableCell>
                              <TableCell className="text-right">{Math.floor((u.total_deposit * (selectedAgentCommission ?? 0)) / 100).toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground">Chưa có người dùng giới thiệu.</p>
                  )
                )}
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="levels">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle>Cấp bậc đại lý</CardTitle>
                <CardDescription>Danh sách cấp bậc và trạng thái</CardDescription>
              </div>
              <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogTrigger asChild>
                  <Button>Tạo cấp bậc</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Tạo cấp bậc đại lý mới</DialogTitle>
                    <DialogDescription>Nhập tên, mã và % hoa hồng cho cấp bậc.</DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Tên cấp bậc</Label>
                      <Input value={newLevelName} onChange={(e) => setNewLevelName(e.target.value)} placeholder="VD: Cấp 1, VIP..." />
                    </div>
                    <div>
                      <Label>Mã cấp bậc</Label>
                      <Input value={newLevelCode} onChange={(e) => setNewLevelCode(e.target.value)} placeholder="VD: LEVEL1, VIP..." />
                    </div>
                    <div>
                      <Label>% Hoa hồng</Label>
                      <Input type="number" value={newLevelCommission} onChange={(e) => setNewLevelCommission(e.target.value === '' ? '' : Number(e.target.value))} placeholder="VD: 10" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={createNewAgentLevel}>Tạo cấp bậc</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {agentLevels.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên cấp bậc</TableHead>
                      <TableHead>Mã</TableHead>
                      <TableHead>% Hoa hồng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentLevels.map((level) => (
                      <TableRow key={level.id}>
                        <TableCell className="font-medium">{level.name}</TableCell>
                        <TableCell>{level.code}</TableCell>
                        <TableCell>{level.commission_percentage}%</TableCell>
                        <TableCell>
                          <Badge variant={level.is_active ? 'default' : 'secondary'}>
                            {level.is_active ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('agent_levels' as any)
                                .update({ is_active: !level.is_active })
                                .eq('id', level.id);
                              if (error) throw error;
                              fetchAgentLevels();
                              toast({ title: 'Đã cập nhật', description: 'Trạng thái cấp bậc đã được thay đổi' });
                            } catch (error) {
                              toast({ title: 'Lỗi', description: 'Không thể cập nhật trạng thái', variant: 'destructive' });
                            }
                          }}>
                            {level.is_active ? 'Tạm dừng' : 'Kích hoạt'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground">Chưa có cấp bậc nào.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
