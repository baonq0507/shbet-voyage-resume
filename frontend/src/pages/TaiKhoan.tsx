import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import apiService from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, ArrowLeft, Key } from 'lucide-react';
import avatar1 from '@/assets/avatars/avatar-1.jpg';
import avatar2 from '@/assets/avatars/avatar-2.jpg';
import avatar3 from '@/assets/avatars/avatar-3.jpg';
import avatar4 from '@/assets/avatars/avatar-4.jpg';
import avatar5 from '@/assets/avatars/avatar-5.jpg';

const sampleAvatars = [avatar1, avatar2, avatar3, avatar4, avatar5];

export default function TaiKhoan() {
  const { profile, refreshProfile, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    phone_number: profile?.phone_number || '',
    avatar_url: profile?.avatar_url || '',
  });
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Handle PayOS return URLs
  useEffect(() => {
    const status = searchParams.get('status');
    
    if (status === 'success') {
      toast({
        title: "Thanh toán thành công! 🎉",
        description: "Giao dịch của bạn đã được xử lý thành công. Số dư sẽ được cập nhật trong vài phút.",
      });
      // Remove status from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('status');
      navigate({ search: newSearchParams.toString() }, { replace: true });
    } else if (status === 'cancelled') {
      toast({
        title: "Thanh toán đã bị hủy",
        description: "Bạn đã hủy giao dịch thanh toán.",
        variant: "destructive",
      });
      // Remove status from URL
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('status');
      navigate({ search: newSearchParams.toString() }, { replace: true });
    }
  }, [searchParams, toast, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setFormData(prev => ({ ...prev, avatar_url: avatarUrl }));
    setShowAvatarSelector(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file?.name, file?.size, file?.type);
    
    if (!file || !profile) {
      console.log('No file or profile:', { file: !!file, profile: !!profile });
      return;
    }

    setIsLoading(true);
    try {
      // Convert file to base64 for API upload
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const response = await apiService.uploadAvatar(base64, file.name);
      
      if (response.success && response.data) {
        setFormData(prev => ({ ...prev, avatar_url: response.data.avatarUrl }));
        
        toast({
          title: "Thành công",
          description: "Tải ảnh đại diện thành công!",
        });
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải ảnh lên. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      const response = await apiService.updateProfile({
        full_name: formData.full_name,
        username: formData.username,
        phone_number: formData.phone_number,
        avatar_url: formData.avatar_url,
      });

      if (response.success) {
        await refreshProfile();
        
        toast({
          title: "Thành công",
          description: "Cập nhật thông tin thành công!",
        });
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp!",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự!",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.changePassword(newPassword);

      if (response.success) {
        setNewPassword('');
        setConfirmPassword('');
        
        toast({
          title: "Thành công",
          description: "Đổi mật khẩu thành công!",
        });
      } else {
        throw new Error(response.message || 'Password change failed');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast({
        title: "Lỗi",
        description: "Không thể đổi mật khẩu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!profile) return;

    setIsResettingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-user-password', {
        body: {
          userId: profile.user_id,
          email: user?.email || '',
          fullName: profile.full_name
        }
      });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Mật khẩu mới đã được tạo: ${data.newPassword}. Vui lòng đổi mật khẩu sau khi đăng nhập lại.`,
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Lỗi",
        description: "Không thể reset mật khẩu. Vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h1>
          <p className="text-muted-foreground">Bạn cần đăng nhập để xem thông tin tài khoản</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Thông tin tài khoản</h1>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Avatar Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Ảnh đại diện
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={formData.avatar_url} alt="Avatar" />
                  <AvatarFallback>
                    {formData.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                  className="w-full"
                >
                  Chọn ảnh có sẵn
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={isLoading}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Tải ảnh lên
                </Button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              {showAvatarSelector && (
                <div className="grid grid-cols-3 gap-2 p-4 border rounded-lg">
                  {sampleAvatars.map((avatar, index) => (
                    <button
                      key={index}
                      onClick={() => handleAvatarSelect(avatar)}
                      className="relative group"
                    >
                      <Avatar className="h-16 w-16 transition-transform group-hover:scale-105">
                        <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                        <AvatarFallback>{index + 1}</AvatarFallback>
                      </Avatar>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cá nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Họ và tên</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  placeholder="Nhập họ và tên"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
              
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
                <Label>Số dư hiện tại</Label>
                <div className="p-3 bg-muted rounded-md">
                  <span className="font-bold text-lg">
                    {profile.balance?.toLocaleString('vi-VN')} VNĐ
                  </span>
                </div>
              </div>
              
              <Button
                onClick={handleUpdateProfile}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
              </Button>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Quản lý mật khẩu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new_password">Mật khẩu mới</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Xác nhận mật khẩu</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  onClick={handleChangePassword}
                  disabled={isLoading || !newPassword || !confirmPassword}
                  className="flex-1 md:flex-none"
                >
                  {isLoading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="flex-1 md:flex-none"
                >
                  {isResettingPassword ? 'Đang reset...' : 'Reset mật khẩu'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}