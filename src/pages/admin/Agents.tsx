import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Plus, Edit, Trash, DollarSign, Users, TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Agent {
  id: string;
  full_name: string;
  username: string;
  phone_number?: string;
  commission_rate: number;
  total_commission: number;
  is_active: boolean;
  created_at: string;
}

const Agents: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isAgentDetailsDialogOpen, setIsAgentDetailsDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents(data as any || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đại lý',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAgents = agents.filter(agent =>
    agent.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.phone_number?.includes(searchTerm)
  );

  const totalAgents = agents.length;
  const activeAgents = agents.filter(agent => agent.is_active).length;
  const totalCommission = agents.reduce((sum, agent) => sum + agent.total_commission, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đại lý</h1>
          <p className="text-gray-600">Quản lý tất cả đại lý trong hệ thống</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đại lý</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAgents.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Đại lý đã đăng ký
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đại lý hoạt động</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAgents}</div>
              <p className="text-xs text-muted-foreground">
                Đang hoạt động
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng hoa hồng</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCommission.toLocaleString()} VND</div>
              <p className="text-xs text-muted-foreground">
                Tổng hoa hồng đã trả
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm đại lý</CardTitle>
            <CardDescription>
              Tìm kiếm theo tên, username hoặc số điện thoại
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Tìm kiếm đại lý..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Agents Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đại lý</CardTitle>
            <CardDescription>
              Tất cả đại lý trong hệ thống
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
                      <TableHead>Tỷ lệ hoa hồng</TableHead>
                      <TableHead>Tổng hoa hồng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAgents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{agent.full_name}</div>
                            <div className="text-sm text-gray-500">@{agent.username}</div>
                            {agent.phone_number && (
                              <div className="text-sm text-gray-500">{agent.phone_number}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-blue-600">
                            {agent.commission_rate}%
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-green-600">
                            {agent.total_commission.toLocaleString()} VND
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={agent.is_active ? "default" : "secondary"}>
                            {agent.is_active ? 'Hoạt động' : 'Tạm dừng'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(agent.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAgent(agent);
                                setIsAgentDetailsDialogOpen(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Handle delete agent
                                if (confirm('Bạn có chắc chắn muốn xóa đại lý này?')) {
                                  // Delete logic here
                                }
                              }}
                            >
                              <Trash className="w-4 h-4" />
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

      {/* Agent Details Dialog */}
      <Dialog open={isAgentDetailsDialogOpen} onOpenChange={setIsAgentDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đại lý</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đại lý
            </DialogDescription>
          </DialogHeader>
          {selectedAgent && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Họ tên</Label>
                  <p className="text-lg font-medium">{selectedAgent.full_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Username</Label>
                  <p className="text-lg font-medium">@{selectedAgent.username}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Số điện thoại</Label>
                  <p className="text-lg font-medium">
                    {selectedAgent.phone_number || 'Chưa cập nhật'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tỷ lệ hoa hồng</Label>
                  <p className="text-lg font-medium text-blue-600">
                    {selectedAgent.commission_rate}%
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Tổng hoa hồng</Label>
                  <p className="text-lg font-medium text-green-600">
                    {selectedAgent.total_commission.toLocaleString()} VND
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Trạng thái</Label>
                  <Badge variant={selectedAgent.is_active ? "default" : "secondary"}>
                    {selectedAgent.is_active ? 'Hoạt động' : 'Tạm dừng'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ngày tạo</Label>
                  <p className="text-lg font-medium">
                    {new Date(selectedAgent.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Thống kê hoạt động</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Người dùng</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">Giao dịch</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">0</div>
                    <div className="text-sm text-gray-600">Doanh thu</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Agents; 