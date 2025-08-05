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
    <Sidebar className={`transition-all duration-300 border-r border-sidebar-border ${collapsed ? "w-16" : "w-72"}`}>
      <SidebarContent className="bg-background backdrop-blur-sm p-4 pt-6">
        {/* Logo/Title Section */}
        {!collapsed && (
          <div className="mb-6 px-2">
            <h2 className="text-xl font-bold text-foreground mb-1 tracking-tight">
              Admin Panel
            </h2>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-foreground font-semibold text-sm uppercase tracking-wider mb-3 px-2">
            {collapsed ? "Menu" : "Quản lý chính"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-3">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    className={`w-full rounded-xl transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden ${
                      isActive(item.id)
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 border border-primary/20 font-semibold'
                        : 'hover:bg-card/50 hover:text-foreground text-muted-foreground border border-border/50 hover:border-primary/30 hover:shadow-md bg-card/20'
                    } ${collapsed ? 'p-4 justify-center' : 'py-5 px-4'}`}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <item.icon className={`${collapsed ? 'h-5 w-5' : 'h-5 w-5 mr-3'} ${
                      isActive(item.id) ? 'text-sidebar-primary-foreground' : ''
                    }`} />
                    {!collapsed && (
                      <div className="flex flex-col items-start min-w-0 flex-1 hidden sm:flex">
                        <span className="font-medium text-sm leading-tight truncate w-full">
                          {item.title}
                        </span>
                        <span className="text-xs opacity-75 mt-0.5 leading-tight truncate w-full">
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

        {/* Quick Stats Section */}
        {!collapsed && (
          <SidebarGroup className="mt-8">
            <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
              <SidebarGroupLabel asChild>
                <CollapsibleTrigger className="flex w-full items-center justify-between hover:bg-card/50 rounded-xl p-3 transition-all duration-300 group hover:scale-[1.01] border border-border/50 hover:border-primary/30">
                  <span className="text-foreground font-semibold text-sm uppercase tracking-wider">
                    Thống kê nhanh
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-all duration-200 text-muted-foreground group-hover:text-foreground ${
                    isStatsOpen ? 'rotate-180' : ''
                  }`} />
                </CollapsibleTrigger>
              </SidebarGroupLabel>
              <CollapsibleContent className="transition-all duration-200">
                <SidebarGroupContent>
                  <div className="space-y-3 px-2 mt-3">
                    {quickStats.map((stat, index) => (
                      <div
                        key={index}
                         className="flex items-center gap-3 p-3 rounded-xl bg-card/30 hover:bg-card/50 transition-all duration-300 border border-border hover:border-primary/30 cursor-pointer group hover:scale-[1.02] hover:shadow-md"
                       >
                        <div className={`p-2 rounded-md ${
                          index === 0 ? 'bg-green-500/20 text-green-400' :
                          index === 1 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          <stat.icon className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium text-foreground leading-tight">
                            {stat.title}
                          </span>
                          <span className="text-xs text-muted-foreground mt-0.5">
                            Xem chi tiết
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        )}

        {/* Footer for collapsed state */}
        {collapsed && (
          <div className="mt-auto pt-4 border-t border-sidebar-border/30">
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-sidebar-primary" />
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}