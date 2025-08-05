import { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';

interface AdminLayoutProps {
  children: ReactNode;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
}

export function AdminLayout({ children, activeSection = 'dashboard', onSectionChange = () => {} }: AdminLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background via-background/95 to-card/30 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary))_0%,_transparent_50%)] opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--secondary))_0%,_transparent_50%)] opacity-[0.02] pointer-events-none" />
        
        {/* Sidebar - Fixed positioning */}
        <div className="flex-shrink-0">
          <AdminSidebar activeSection={activeSection} onSectionChange={onSectionChange} />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative bg-transparent">
          <AdminHeader />
          
          {/* Content Container */}
          <main className="flex-1 relative overflow-hidden bg-transparent">
            {/* Content Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/30 pointer-events-none" />
            
            {/* Scrollable Content */}
            <div className="h-full overflow-auto custom-scrollbar">
              <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in min-h-full">
                <div className="w-full max-w-none">
                  {children}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AdminLayout;