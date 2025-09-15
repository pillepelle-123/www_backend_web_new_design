import { Link, usePage } from '@inertiajs/react';
import {
  LayoutGrid,
  ListTodo,
  CirclePlus,
  Mail,
  Handshake,
  FolderOpen
} from 'lucide-react';

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface ModernBottomNavigationProps {
  className?: string;
}

export function ModernBottomNavigation({ className = '' }: ModernBottomNavigationProps) {
  const { props } = usePage();
  const unreadCount = props.unreadApplicationsCount || 0;

  const navigationItems: NavigationItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutGrid,
    },
    {
      title: 'Angebote',
      href: '/offers',
      icon: ListTodo,
    },
    {
      title: 'Meine Angebote',
      href: '/my-offers',
      icon: FolderOpen,
    },
    {
      title: 'Erstellen',
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

  return (
    <nav className={`md-bottom-navigation ${className}`}>
      <div className="flex items-center justify-around">
        {navigationItems.map((item) => {
          const isActive = item.href === usePage().url;
          const IconComponent = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`md-bottom-navigation-item ${isActive ? 'md-bottom-navigation-item--active' : ''}`}
              prefetch
              title={item.title}
            >
              <div className="relative">
                <IconComponent className="w-6 h-6" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--md-error)] text-xs font-medium text-[var(--md-on-error)]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
