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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary))_0%,_transparent_50%)] opacity-[0.03]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_hsl(var(--secondary))_0%,_transparent_50%)] opacity-[0.02]" />
        
        {/* Sidebar */}
        <AdminSidebar activeSection={activeSection} onSectionChange={onSectionChange} />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">
          <AdminHeader />
          
          {/* Content Container */}
          <main className="flex-1 relative overflow-hidden">
            {/* Content Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/30" />
            
            {/* Scrollable Content */}
            <div className="h-full overflow-auto custom-scrollbar">
              <div className="p-4 md:p-6 lg:p-8 space-y-6 animate-fade-in min-h-full">
                <div className="max-w-7xl mx-auto w-full">
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