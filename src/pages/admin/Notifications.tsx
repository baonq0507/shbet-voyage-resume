import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Plus, Edit, Trash, Send, Eye } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target_audience: 'all' | 'users' | 'agents';
  is_published: boolean;
  created_at: string;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [notificationLoading, setNotificationLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'error'>('info');
  const [targetAudience, setTargetAudience] = useState<'all' | 'users' | 'agents'>('all');
  const [isPublished, setIsPublished] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data as any || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách thông báo',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!title || !content) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive',
      });
      return;
    }

    try {
      setNotificationLoading(true);
      const { error } = await supabase
        .from('notifications')
        .insert({
          title,
          message: content,
          type,
          target_users: targetAudience === 'all' ? [] : [targetAudience],
          is_read: false,
          user_id: '', // Admin notification
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Thông báo đã được tạo',
      });

      setIsNotificationDialogOpen(false);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo thông báo',
        variant: 'destructive',
      });
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleUpdateNotification = async () => {
    if (!editingNotification || !title || !content) return;

    try {
      setNotificationLoading(true);
      const { error } = await supabase
        .from('notifications')
        .update({
          title,
          content,
          type,
          target_audience: targetAudience,
          is_published: isPublished,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingNotification.id);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Thông báo đã được cập nhật',
      });

      setIsNotificationDialogOpen(false);
      setEditingNotification(null);
      resetForm();
      fetchNotifications();
    } catch (error) {
      console.error('Error updating notification:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông báo',
        variant: 'destructive',
      });
    } finally {
      setNotificationLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thông báo này?')) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      toast({
        title: 'Thành công',
        description: 'Thông báo đã được xóa',
      });

      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa thông báo',
        variant: 'destructive',
      });
    }
  };

  const openCreateNotificationDialog = () => {
    setEditingNotification(null);
    resetForm();
    setIsNotificationDialogOpen(true);
  };

  const openEditNotificationDialog = (notification: Notification) => {
    setEditingNotification(notification);
    setTitle(notification.title);
    setContent(notification.content);
    setType(notification.type);
    setTargetAudience(notification.target_audience);
    setIsPublished(notification.is_published);
    setIsNotificationDialogOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('info');
    setTargetAudience('all');
    setIsPublished(false);
  };

  const publishedNotifications = notifications.filter(n => n.is_published);
  const draftNotifications = notifications.filter(n => !n.is_published);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'info': return 'Thông tin';
      case 'warning': return 'Cảnh báo';
      case 'success': return 'Thành công';
      case 'error': return 'Lỗi';
      default: return 'Không xác định';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý thông báo</h1>
            <p className="text-gray-600">Tạo và gửi thông báo đến người dùng</p>
          </div>
          <Button onClick={openCreateNotificationDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo thông báo
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng thông báo</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{notifications.length}</div>
              <p className="text-xs text-muted-foreground">
                Tất cả thông báo
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
              <Send className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedNotifications.length}</div>
              <p className="text-xs text-muted-foreground">
                Đã gửi
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nháp</CardTitle>
              <Eye className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{draftNotifications.length}</div>
              <p className="text-xs text-muted-foreground">
                Chưa xuất bản
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách thông báo</CardTitle>
            <CardDescription>
              Tất cả thông báo trong hệ thống
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
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Nội dung</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Đối tượng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((notification) => (
                      <TableRow key={notification.id}>
                        <TableCell className="font-medium">{notification.title}</TableCell>
                        <TableCell className="max-w-xs truncate">{notification.content}</TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(notification.type)}>
                            {getTypeText(notification.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {notification.target_audience === 'all' ? 'Tất cả' : 
                             notification.target_audience === 'users' ? 'Người dùng' : 'Đại lý'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={notification.is_published ? "default" : "secondary"}>
                            {notification.is_published ? 'Đã xuất bản' : 'Nháp'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(notification.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditNotificationDialog(notification)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
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

      {/* Notification Form Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingNotification ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
            </DialogTitle>
            <DialogDescription>
              {editingNotification ? 'Cập nhật thông tin thông báo' : 'Điền thông tin để tạo thông báo mới'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                placeholder="Nhập tiêu đề thông báo"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="content">Nội dung</Label>
              <Textarea
                id="content"
                placeholder="Nhập nội dung thông báo"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Loại thông báo</Label>
                <Select value={type} onValueChange={(value: any) => setType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Thông tin</SelectItem>
                    <SelectItem value="warning">Cảnh báo</SelectItem>
                    <SelectItem value="success">Thành công</SelectItem>
                    <SelectItem value="error">Lỗi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="audience">Đối tượng</Label>
                <Select value={targetAudience} onValueChange={(value: any) => setTargetAudience(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đối tượng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="users">Người dùng</SelectItem>
                    <SelectItem value="agents">Đại lý</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="published">Xuất bản ngay</Label>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={editingNotification ? handleUpdateNotification : handleCreateNotification}
                disabled={notificationLoading}
                className="flex-1"
              >
                {notificationLoading ? 'Đang xử lý...' : (editingNotification ? 'Cập nhật' : 'Tạo')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsNotificationDialogOpen(false)}
              >
                Hủy
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Notifications; 