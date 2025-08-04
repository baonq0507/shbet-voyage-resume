import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import { User, Eye, EyeOff, Upload, Camera } from 'lucide-react';

// Sample avatar URLs - using placeholder service for now
const sampleAvatars = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face'
];

export default function TaiKhoan() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone_number: '',
    username: '',
    avatar_url: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Load profile data when component mounts or profile changes
  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone_number: profile.phone_number || '',
        username: profile.username || '',
        avatar_url: profile.avatar_url || ''
      });
    }
  }, [profile]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileForm.full_name,
          phone_number: profileForm.phone_number,
          username: profileForm.username,
          avatar_url: profileForm.avatar_url
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();
      toast({
        title: "Thành công",
        description: "Cập nhật thông tin thành công",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật thông tin",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive",
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu mới phải có ít nhất 6 ký tự",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast({
        title: "Thành công",
        description: "Cập nhật mật khẩu thành công",
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật mật khẩu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file hình ảnh",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setProfileForm(prev => ({ ...prev, avatar_url: data.publicUrl }));

      toast({
        title: "Thành công",
        description: "Tải ảnh lên thành công",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tải ảnh lên",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSampleAvatarSelect = (avatarUrl: string) => {
    setProfileForm(prev => ({ ...prev, avatar_url: avatarUrl }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Card className="w-full max-w-md">
            <CardContent className="p-6 text-center">
              <p>Vui lòng đăng nhập để truy cập trang này</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <User className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Thông tin tài khoản</h1>
          </div>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
              <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ảnh đại diện</CardTitle>
                  <CardDescription>
                    Chọn ảnh đại diện mẫu hoặc tải lên ảnh của riêng bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Avatar */}
                  <div className="flex items-center justify-center">
                    <Avatar className="h-32 w-32">
                      <AvatarImage src={profileForm.avatar_url} />
                      <AvatarFallback className="text-2xl">
                        {profileForm.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Sample Avatars */}
                  <div>
                    <Label className="text-sm font-medium">Chọn ảnh đại diện mẫu</Label>
                    <div className="grid grid-cols-5 gap-4 mt-2">
                      {sampleAvatars.map((avatar, index) => (
                        <button
                          key={index}
                          onClick={() => handleSampleAvatarSelect(avatar)}
                          className={`relative rounded-full border-2 transition-colors ${
                            profileForm.avatar_url === avatar
                              ? 'border-primary'
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={avatar} />
                            <AvatarFallback>{index + 1}</AvatarFallback>
                          </Avatar>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Upload Custom Avatar */}
                  <div>
                    <Label className="text-sm font-medium">Hoặc tải lên ảnh của bạn</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label htmlFor="avatar-upload">
                        <Button variant="outline" className="w-full" asChild>
                          <span className="flex items-center gap-2 cursor-pointer">
                            <Upload className="h-4 w-4" />
                            Tải ảnh lên
                          </span>
                        </Button>
                      </label>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Định dạng: JPG, PNG. Kích thước tối đa: 5MB
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cá nhân</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cá nhân của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Họ và tên</Label>
                      <Input
                        id="full_name"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, full_name: e.target.value }))}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">Tên đăng nhập</Label>
                      <Input
                        id="username"
                        value={profileForm.username}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Nhập tên đăng nhập"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Số điện thoại</Label>
                    <Input
                      id="phone_number"
                      value={profileForm.phone_number}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="opacity-50"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email không thể thay đổi
                    </p>
                  </div>

                  <Button 
                    onClick={handleProfileUpdate} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="password">
              <Card>
                <CardHeader>
                  <CardTitle>Đổi mật khẩu</CardTitle>
                  <CardDescription>
                    Cập nhật mật khẩu để bảo mật tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current_password">Mật khẩu hiện tại</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPassword ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                        placeholder="Nhập mật khẩu hiện tại"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new_password">Mật khẩu mới</Label>
                    <Input
                      id="new_password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Nhập mật khẩu mới"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm_password">Xác nhận mật khẩu mới</Label>
                    <Input
                      id="confirm_password"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Nhập lại mật khẩu mới"
                    />
                  </div>

                  <Button 
                    onClick={handlePasswordUpdate} 
                    disabled={loading || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="w-full"
                  >
                    {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}