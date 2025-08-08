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

export const AdminAgents: React.FC = () => {
  const { toast } = useToast();

  const [agents, setAgents] = useState<AgentRow[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'levels' | 'users'>('list');
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
    fetchAgents();
    fetchAgentLevels();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý đại lý</h2>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList>
          <TabsTrigger value="list">Danh sách đại lý</TabsTrigger>
          <TabsTrigger value="add">Tạo cấp bậc</TabsTrigger>
          <TabsTrigger value="levels">Cấp bậc hoa hồng</TabsTrigger>
          <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
        </TabsList>

        {/* LIST */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đại lý</CardTitle>
              <CardDescription>Tên, % hoa hồng, link mời và số liệu</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Đại lý</TableHead>
                    <TableHead>% Hoa hồng</TableHead>
                    <TableHead>Mã giới thiệu</TableHead>
                    <TableHead>Link mời</TableHead>
                    <TableHead>Đã giới thiệu</TableHead>
                    <TableHead>Tổng hoa hồng</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => {
                    const username = agent.profile?.username || agent.user_id.slice(0, 6);
                    const link = agent.referral_code ? `${window.location.origin}?ref=${agent.referral_code}` : '';
                    return (
                      <TableRow key={agent.id}>
                        <TableCell className="font-medium">{username}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue={Number(agent.commission_percentage)}
                            className="w-24"
                            onBlur={(e) => {
                              const v = Number(e.currentTarget.value);
                              if (!isNaN(v)) updateAgentCommission(agent.id, v);
                            }}
                          />
                        </TableCell>
                        <TableCell>{agent.referral_code || '-'}</TableCell>
                        <TableCell>
                          {agent.referral_code ? (
                            <div className="flex items-center gap-2">
                              <span className="truncate max-w-[240px]" title={link}>{link}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(link);
                                    toast({ title: 'Đã sao chép', description: 'Link mời đã được sao chép' });
                                  } catch (e) {
                                    toast({ title: 'Lỗi', description: 'Không thể sao chép link', variant: 'destructive' });
                                  }
                                }}
                              >
                                Sao chép
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Chưa có</span>
                          )}
                        </TableCell>
                        <TableCell>{agent.referral_count}</TableCell>
                        <TableCell>{Number(agent.total_commission || 0).toLocaleString()} VND</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CREATE AGENT LEVEL */}
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tạo cấp bậc đại lý mới</CardTitle>
              <CardDescription>Tạo các cấp bậc đại lý với tên, mã và % hoa hồng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Tên cấp bậc</Label>
                  <Input 
                    value={newLevelName} 
                    onChange={(e) => setNewLevelName(e.target.value)} 
                    placeholder="VD: Cấp 1, Cấp 2, VIP..." 
                  />
                </div>
                <div>
                  <Label>Mã cấp bậc</Label>
                  <Input 
                    value={newLevelCode} 
                    onChange={(e) => setNewLevelCode(e.target.value)} 
                    placeholder="VD: LEVEL1, VIP, BRONZE..." 
                  />
                </div>
                <div>
                  <Label>% Hoa hồng</Label>
                  <Input 
                    type="number" 
                    value={newLevelCommission} 
                    onChange={(e) => setNewLevelCommission(e.target.value === '' ? '' : Number(e.target.value))} 
                    placeholder="VD: 10" 
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={createNewAgentLevel} className="w-full">
                    Tạo cấp bậc
                  </Button>
                </div>
              </div>

              {/* Display existing levels */}
              {agentLevels.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4">Các cấp bậc hiện có</h3>
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
                            <Badge variant={level.is_active ? "default" : "secondary"}>
                              {level.is_active ? "Hoạt động" : "Tạm dừng"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
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
                              }}
                            >
                              {level.is_active ? "Tạm dừng" : "Kích hoạt"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LEVELS */}
        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cấp bậc hoa hồng</CardTitle>
              <CardDescription>Quản lý level và % theo từng đại lý</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label>Chọn đại lý</Label>
                  <Select value={selectedAgentId ?? ''} onValueChange={(v) => { setSelectedAgentId(v); fetchLevels(v); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đại lý" />
                    </SelectTrigger>
                    <SelectContent className="z-50 bg-popover border-border">
                      {agents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>
                          {a.profile?.username || a.user_id.slice(0, 6)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Input type="number" value={newLevel} onChange={(e) => setNewLevel(e.target.value === '' ? '' : Number(e.target.value))} placeholder="VD: 1" />
                </div>
                <div>
                  <Label>% Hoa hồng</Label>
                  <div className="flex gap-2">
                    <Input type="number" value={newPercent} onChange={(e) => setNewPercent(e.target.value === '' ? '' : Number(e.target.value))} placeholder="VD: 10" />
                    <Button onClick={addLevel}>Thêm</Button>
                  </div>
                </div>
              </div>

              {selectedAgentId && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Level</TableHead>
                      <TableHead>% Hoa hồng</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levels.map((lv) => (
                      <TableRow key={lv.id}>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue={lv.level}
                            className="w-24"
                            onBlur={(e) => {
                              const levelVal = Number(e.currentTarget.value);
                              if (!isNaN(levelVal)) updateLevel(lv.id, levelVal, lv.commission_percentage);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue={Number(lv.commission_percentage)}
                            className="w-24"
                            onBlur={(e) => {
                              const percentVal = Number(e.currentTarget.value);
                              if (!isNaN(percentVal)) updateLevel(lv.id, lv.level, percentVal);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button variant="destructive" size="sm" onClick={() => deleteLevel(lv.id)}>Xóa</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* USERS */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gán người dùng cho đại lý</CardTitle>
              <CardDescription>Nhập username và chọn đại lý để gán/chuyển</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Username</Label>
                <Input value={assignUsername} onChange={(e) => setAssignUsername(e.target.value)} placeholder="nhap_username" />
              </div>
              <div>
                <Label>Đại lý</Label>
                <Select value={assignToAgentId ?? ''} onValueChange={(v) => setAssignToAgentId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đại lý" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-popover border-border">
                    {agents.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.profile?.username || a.user_id.slice(0, 6)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={assignUser}>Gán đại lý</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
