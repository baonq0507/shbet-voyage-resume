import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Calendar, TrendingUp, DollarSign, Users, BarChart3 } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';

const Reports: React.FC = () => {
  const [reportType, setReportType] = useState('transactions');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const reportTypes = [
    { value: 'transactions', label: 'Báo cáo giao dịch', icon: DollarSign },
    { value: 'users', label: 'Báo cáo người dùng', icon: Users },
    { value: 'revenue', label: 'Báo cáo doanh thu', icon: TrendingUp },
    { value: 'promotions', label: 'Báo cáo khuyến mãi', icon: BarChart3 },
  ];

  const mockReportData = [
    { date: '2024-01-01', transactions: 150, revenue: 50000000, users: 25 },
    { date: '2024-01-02', transactions: 180, revenue: 65000000, users: 30 },
    { date: '2024-01-03', transactions: 200, revenue: 75000000, users: 35 },
    { date: '2024-01-04', transactions: 165, revenue: 60000000, users: 28 },
    { date: '2024-01-05', transactions: 220, revenue: 80000000, users: 40 },
  ];

  const handleGenerateReport = () => {
    // Logic để tạo báo cáo
    console.log('Generating report:', { reportType, dateFrom, dateTo });
  };

  const handleExportReport = () => {
    // Logic để xuất báo cáo
    console.log('Exporting report');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo</h1>
          <p className="text-gray-600">Tạo và xuất các báo cáo hệ thống</p>
        </div>

        {/* Report Generator */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Tạo báo cáo
            </CardTitle>
            <CardDescription>
              Chọn loại báo cáo và khoảng thời gian
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="report-type">Loại báo cáo</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại báo cáo" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center">
                            <Icon className="w-4 h-4 mr-2" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date-from">Từ ngày</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="date-to">Đến ngày</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleGenerateReport}>
                <FileText className="w-4 h-4 mr-2" />
                Tạo báo cáo
              </Button>
              <Button variant="outline" onClick={handleExportReport}>
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng giao dịch</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">915</div>
              <p className="text-xs text-muted-foreground">
                +20.1% so với tháng trước
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">290M VND</div>
              <p className="text-xs text-muted-foreground">
                +15.3% so với tháng trước
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Người dùng mới</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">158</div>
              <p className="text-xs text-muted-foreground">
                +8.2% so với tháng trước
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.3%</div>
              <p className="text-xs text-muted-foreground">
                +2.1% so với tháng trước
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>Dữ liệu báo cáo</CardTitle>
            <CardDescription>
              Dữ liệu chi tiết theo ngày
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Giao dịch</TableHead>
                    <TableHead>Doanh thu</TableHead>
                    <TableHead>Người dùng mới</TableHead>
                    <TableHead>Tỷ lệ chuyển đổi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockReportData.map((row) => (
                    <TableRow key={row.date}>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.transactions}</TableCell>
                      <TableCell>{row.revenue.toLocaleString()} VND</TableCell>
                      <TableCell>{row.users}</TableCell>
                      <TableCell>
                        {((row.users / row.transactions) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo gần đây</CardTitle>
            <CardDescription>
              Danh sách các báo cáo đã tạo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Báo cáo giao dịch tháng 1/2024</h3>
                    <p className="text-sm text-gray-500">Tạo ngày 01/02/2024</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Báo cáo người dùng tháng 12/2023</h3>
                    <p className="text-sm text-gray-500">Tạo ngày 01/01/2024</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Báo cáo doanh thu Q4/2023</h3>
                    <p className="text-sm text-gray-500">Tạo ngày 15/01/2024</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Reports; 