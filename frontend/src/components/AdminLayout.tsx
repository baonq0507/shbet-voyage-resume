import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
interface AdminLayoutProps {
  children: ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}
export function AdminLayout({
  children,
  activeSection = 'dashboard',
  onSectionChange = () => {}
}: AdminLayoutProps) {
  return <SidebarProvider>
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-background/95 to-card/30 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary))_0%,_transparent_50%)] opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--secondary))_0%,_transparent_50%)] opacity-[0.02] pointer-events-none" />
        
        {/* Header spans full width */}
        <AdminHeader />
        
        {/* Main Layout Container - Account for header height */}
        <div className="flex w-full" style={{
        height: 'calc(100vh - 4rem)'
      }}>
          {/* Sidebar */}
          <AdminSidebar activeSection={activeSection} onSectionChange={onSectionChange} />
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden">
            {/* Scrollable Content */}
            <div className="h-full overflow-auto custom-scrollbar w-full px-[15px]">
              <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>;
}
export default AdminLayout;