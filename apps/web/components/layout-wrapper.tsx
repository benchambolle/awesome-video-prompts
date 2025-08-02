  "use client";

import { usePathname, useRouter } from 'next/navigation';
import { SidebarInset, SidebarProvider, useSidebar } from "@workspace/ui/components/ui/sidebar";
import { AppSidebar } from "@workspace/ui/components/app-sidebar";
import { DashboardHeader } from "@workspace/ui/components/dashboard-header";
 
// Fixed sidebar widths
const SIDEBAR_WIDTH_EXPANDED = "16rem" // 256px
const SIDEBAR_WIDTH_COLLAPSED = "4rem"  // 64px

interface LayoutWrapperProps {
  children: React.ReactNode;
}

// Inner component that has access to sidebar context
function LayoutContent({ children, pathname, onNavigate }: {
  children: React.ReactNode;
  pathname: string;
  onNavigate: (url: string) => void;
}) {
  const { open } = useSidebar();
  
  // Calculate margin based on sidebar state
  const marginLeft = open ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;
  
  return (
    <>
      {/* Fixed positioned sidebar */}
      <AppSidebar />
      
      {/* Content area with dynamic margin */}
      <div 
        className="flex-1 flex flex-col min-h-screen"
        style={{ maxWidth: `calc(100% - ${marginLeft})` }}
      >
        {/* Sticky header with dynamic margin */}
        <DashboardHeader 
          pathname={pathname}
          onNavigate={onNavigate}
        />
        
        {/* Main content area */}
        <main className="flex-1 flex flex-col min-h-0 overflow-">
          <div className="flex-1 p-0 bg-background">
            {children}
           </div>
        </main>
      </div>
    </>
  );
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleNavigate = (url: string) => {
    router.push(url);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full relative">
        <LayoutContent 
          pathname={pathname}
          onNavigate={handleNavigate}
        >
          {children}
        </LayoutContent>
      </div>
    </SidebarProvider>
  );
}
