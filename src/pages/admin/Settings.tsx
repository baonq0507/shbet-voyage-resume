import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Save, Database, Shield, Bell, Globe } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const Settings: React.FC = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-gray-600">Quản lý cài đặt và cấu hình hệ thống</p>
        </div>

        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Cài đặt chung
            </CardTitle>
            <CardDescription>
              Cấu hình cơ bản của hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="site-name">Tên website</Label>
                <Input id="site-name" defaultValue="SHBET" />
              </div>
              <div>
                <Label htmlFor="site-url">URL website</Label>
                <Input id="site-url" defaultValue="https://shbet.com" />
              </div>
              <div>
                <Label htmlFor="admin-email">Email admin</Label>
                <Input id="admin-email" type="email" defaultValue="admin@shbet.com" />
              </div>
              <div>
                <Label htmlFor="support-phone">Số điện thoại hỗ trợ</Label>
                <Input id="support-phone" defaultValue="1900-xxxx" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Bảo mật
            </CardTitle>
            <CardDescription>
              Cài đặt bảo mật và xác thực
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="two-factor">Xác thực 2 yếu tố</Label>
                <p className="text-sm text-gray-500">Yêu cầu xác thực 2 yếu tố cho admin</p>
              </div>
              <Switch id="two-factor" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="session-timeout">Timeout phiên đăng nhập</Label>
                <p className="text-sm text-gray-500">Thời gian tự động đăng xuất (phút)</p>
              </div>
              <Input id="session-timeout" type="number" defaultValue="30" className="w-20" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="login-attempts">Giới hạn đăng nhập</Label>
                <p className="text-sm text-gray-500">Số lần đăng nhập sai tối đa</p>
              </div>
              <Input id="login-attempts" type="number" defaultValue="5" className="w-20" />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Thông báo
            </CardTitle>
            <CardDescription>
              Cài đặt thông báo hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications">Thông báo email</Label>
                <p className="text-sm text-gray-500">Gửi thông báo qua email</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications">Thông báo SMS</Label>
                <p className="text-sm text-gray-500">Gửi thông báo qua SMS</p>
              </div>
              <Switch id="sms-notifications" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications">Thông báo push</Label>
                <p className="text-sm text-gray-500">Thông báo đẩy trên web</p>
              </div>
              <Switch id="push-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Database Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="w-5 h-5 mr-2" />
              Cơ sở dữ liệu
            </CardTitle>
            <CardDescription>
              Quản lý cơ sở dữ liệu và sao lưu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="backup-frequency">Tần suất sao lưu</Label>
                <select id="backup-frequency" className="w-full p-2 border rounded-md">
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                </select>
              </div>
              <div>
                <Label htmlFor="backup-retention">Thời gian lưu trữ</Label>
                <Input id="backup-retention" type="number" defaultValue="30" />
                <p className="text-sm text-gray-500">Số ngày lưu trữ bản sao lưu</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Sao lưu ngay
              </Button>
              <Button variant="outline">
                <Database className="w-4 h-4 mr-2" />
                Khôi phục
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button className="flex items-center">
            <Save className="w-4 h-4 mr-2" />
            Lưu cài đặt
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings; 