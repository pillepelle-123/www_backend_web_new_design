import { Link, usePage } from '@inertiajs/react';
import {
  LayoutGrid,
  ListTodo,
  CirclePlus,
  Mail,
  Handshake,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import AppLogo from '../app-logo';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface ModernSidebarProps {
  className?: string;
  isMobile?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ModernSidebar({
  className = '',
  isMobile = false,
  isOpen = false,
  onClose
}: ModernSidebarProps) {
  const { props } = usePage();
  const unreadCount = props.unreadApplicationsCount || 0;

  const navigationItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutGrid,
    },
    {
      title: 'Show Offers',
      href: '/offers',
      icon: ListTodo,
    },
    {
      title: 'Set Offer',
      href: '/offers/create',
      icon: CirclePlus,
    },
    {
      title: 'Nachrichten',
      href: '/applications',
      icon: Mail,
      badge: unreadCount,
    },
    {
      title: 'Matches',
      href: '/user-matches',
      icon: Handshake,
    },
  ];

  const sidebarClasses = `
    md-sidebar
    ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'relative'}
    ${isMobile && !isOpen ? 'transform -translate-x-full' : ''}
    ${className}
  `.trim();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--md-scrim)]/50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="md-sidebar-header">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3" prefetch>
              <AppLogo />
            </Link>
            {isMobile && onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--md-surface-container-high)] transition-colors"
                aria-label="Sidebar schließen"
              >
                <X className="w-5 h-5 text-[var(--md-on-surface-variant)]" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="md-sidebar-content">
          <nav className="space-y-2">
            <div className="text-xs font-medium text-[var(--md-on-surface-variant)] uppercase tracking-wider mb-4">
              Menü
            </div>

            {navigationItems.map((item) => {
              const isActive = item.href === usePage().url;
              const IconComponent = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`md-navigation-item ${isActive ? 'md-navigation-item--active' : ''}`}
                  prefetch
                >
                  <div className="relative">
                    <IconComponent className="w-5 h-5" />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--md-error)] text-xs font-medium text-[var(--md-on-error)]">
                        {item.badge > 99 ? '99+' : item.badge}
                      </span>
                    )}
                  </div>
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="md-sidebar-footer">
            <div className="text-xs text-[var(--md-on-surface-variant)] text-left mb-3 pl-3">
            Impressum
          </div>
          <div className="text-xs text-[var(--md-on-surface-variant)] text-left mb-3 pl-3">
            © 2025 Wer Wirbt Wen
          </div>

        </div>
      </aside>
    </>
  );
}

// Mobile Sidebar Toggle Button
export function ModernSidebarToggle({ onToggle }: { onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-lg hover:bg-[var(--md-surface-container-high)] transition-colors lg:hidden"
      aria-label="Menü öffnen"
    >
      <Menu className="w-6 h-6 text-[var(--md-on-surface)]" />
    </button>
  );
}
