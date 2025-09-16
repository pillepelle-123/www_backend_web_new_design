import { useState, useEffect } from 'react';
import { Search, Bell, User, Sun, Moon, Monitor } from 'lucide-react';
import { ModernSidebarToggle } from './ModernSidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePage, Link, router } from '@inertiajs/react';
import AppLogo from '@/components/app-logo';

interface ModernHeaderProps {
  onSidebarToggle?: () => void;
  showSidebarToggle?: boolean;
  className?: string;
}

export function ModernHeader({
  onSidebarToggle,
  showSidebarToggle = false,
  className = ''
}: ModernHeaderProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const page = usePage();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Auto-navigate to offers page with search when user types more than 3 characters
    if (value.trim().length > 3) {
      setIsSearching(true);
      router.get('/offers', { 
        client_search: value.trim()
      }, {
        preserveState: true,
        preserveScroll: true,
        onFinish: () => {
          setTimeout(() => {
            setIsSearching(false);
          }, 1000);
        }
      });
    }
  };



  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(newTheme);

    if (newTheme === 'system') {
      document.documentElement.classList.remove('dark');
    } else if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'light': return <Sun className="h-4 w-4" />;
      case 'dark': return <Moon className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <header className={`md-navigation ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* App Logo */}
          <AppLogo />
          
          {/*
          showSidebarToggle && onSidebarToggle && (
            <ModernSidebarToggle onToggle={onSidebarToggle} />
          )
          */}

          {/* Search Bar */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2">
              <div className="md-search-bar w-80 relative">
                <Search className="md-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="md-search-input"
                  placeholder="Angebotstitel durchsuchen..."
                />
                {isSearching && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="md-spinner w-4 h-4"></div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2 hover:bg-[var(--md-surface-container-high)]"
            aria-label="Theme wechseln"
          >
            {getThemeIcon()}
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-[var(--md-surface-container-high)] relative"
            aria-label="Benachrichtigungen"
          >
            <Bell className="h-5 w-5 text-[var(--md-on-surface-variant)]" />
            {/* Notification Badge */}
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--md-error)] text-xs text-[var(--md-on-error)]">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 p-2 hover:bg-[var(--md-surface-container-high)]"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium text-[var(--md-on-surface)]">
                  {page.props.auth?.user?.name || 'Benutzer'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/profile">
                  <span>Einstellungen</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-3">
        <div className="flex items-center gap-2">
          <div className="md-search-bar flex-1 relative">
            <Search className="md-search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="md-search-input"
              placeholder="Angebotstitel durchsuchen..."
            />
            {isSearching && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="md-spinner w-4 h-4"></div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
