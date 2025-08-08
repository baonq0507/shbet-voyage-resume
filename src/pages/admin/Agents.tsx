import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const Agents: React.FC = () => {

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đại lý</h1>
          <p className="text-gray-600">Quản lý thông tin và hoạt động đại lý</p>
        </div>

        {/* Basic Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Thông tin đại lý</CardTitle>
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Chức năng quản lý đại lý đang được phát triển. Vui lòng liên hệ quản trị viên để biết thêm chi tiết.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Agents; 