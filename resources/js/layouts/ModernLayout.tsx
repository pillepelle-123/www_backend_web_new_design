import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { ModernHeader } from '@/components/modern/ModernHeader';
import { ModernSidebar } from '@/components/modern/ModernSidebar';
import { ModernBottomNavigation } from '@/components/modern/ModernBottomNavigation';
import { BreadcrumbItem } from '@/types';

interface ModernLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  headerRightContent?: React.ReactNode;
  showSidebar?: boolean;
  showBottomNavigation?: boolean;
  className?: string;
}

export default function ModernLayout({
  children,
  title,
  breadcrumbs = [],
  headerRightContent,
  showSidebar = true,
  showBottomNavigation = true,
  className = '',
}: ModernLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className={`h-full bg-[var(--md-surface)] text-[var(--md-on-surface)] flex flex-col overflow-hidden ${className}`}>
      <Head title={title} />

      {/* Header */}
      <ModernHeader
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        showSidebarToggle={isMobile && showSidebar}
      />

      {/* Main Container - takes remaining height */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {showSidebar && (
          <ModernSidebar
            isMobile={isMobile}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            className={isMobile ? '' : 'hidden lg:block'}
          />
        )}

        {/* Main Content */}
        <main className={`
          flex-1 transition-all duration-300 ease-in-out flex flex-col overflow-hidden
          ${showSidebar && !isMobile ? 'lg:ml-0' : ''}
        `}>
          {/* Breadcrumbs - Hidden on mobile */}
          {breadcrumbs.length > 0 && (
            <div className="hidden lg:block px-4 py-3 border-b border-[var(--md-outline-variant)] bg-[var(--md-surface-container-low)] flex-shrink-0">
              <nav className="flex items-center space-x-2 text-sm">
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={breadcrumb.href} className="flex items-center">
                    {index > 0 && (
                      <span className="text-[var(--md-on-surface-variant)] mx-2">/</span>
                    )}
                    <a
                      href={breadcrumb.href}
                      className={`${
                        index === breadcrumbs.length - 1
                          ? 'text-[var(--md-on-surface)] font-medium'
                          : 'text-[var(--md-on-surface-variant)] hover:text-[var(--md-primary)]'
                      } transition-colors`}
                    >
                      {breadcrumb.title}
                    </a>
                  </div>
                ))}
              </nav>
            </div>
          )}

          {/* Page Content */}
          <div className={`p-4 lg:p-6 overflow-y-auto flex-1 ${showBottomNavigation ? 'pb-20' : ''}`}>
            {children}
          </div>
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      {showBottomNavigation && isMobile && (
        <ModernBottomNavigation />
      )}
    </div>
  );
}
