import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  BarChart3,
  Users,
  CreditCard,
  Gift,
  Bell,
  Settings,
  ChevronDown,
  DollarSign,
  UserCheck,
  TrendingUp,
  FileText,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AdminSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const menuItems = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: BarChart3,
    description: 'Tổng quan hệ thống'
  },
  {
    id: 'users',
    title: 'Quản lý người dùng',
    icon: Users,
    description: 'Danh sách và quản lý user'
  },
  {
    id: 'transactions',
    title: 'Giao dịch',
    icon: CreditCard,
    description: 'Nạp tiền, rút tiền, lịch sử'
  },
  {
    id: 'promotions',
    title: 'Khuyến mãi',
    icon: Gift,
    description: 'Quản lý chương trình khuyến mãi'
  },
  {
    id: 'notifications',
    title: 'Thông báo',
    icon: Bell,
    description: 'Gửi thông báo tới người dùng'
  },
  {
    id: 'reports',
    title: 'Báo cáo',
    icon: FileText,
    description: 'Thống kê và báo cáo'
  },
  {
    id: 'settings',
    title: 'Cài đặt',
    icon: Settings,
    description: 'Cấu hình hệ thống'
  }
];

const quickStats = [
  {
    title: 'Tổng doanh thu',
    icon: DollarSign,
    color: 'text-green-600'
  },
  {
    title: 'Người dùng hoạt động',
    icon: UserCheck,
    color: 'text-blue-600'
  },
  {
    title: 'Giao dịch hôm nay',
    icon: TrendingUp,
    color: 'text-purple-600'
  }
];

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [isStatsOpen, setIsStatsOpen] = useState(true);

  const isActive = (itemId: string) => activeSection === itemId;

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"}>
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Quản lý</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full ${
                      isActive(item.id)
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted/50'
                    }`}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && (
                      <div className="flex flex-col items-start">
                        <span>{item.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Stats */}
        {!collapsed && (
          <SidebarGroup>
            <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-muted/50 rounded-md p-2">
                  Thống kê nhanh
                  <ChevronDown className={`h-4 w-4 transition-transform ${isStatsOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <div className="space-y-2 px-2">
                    {quickStats.map((stat, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-xs font-medium">{stat.title}</span>
                      </div>
                    ))}
                  </div>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}