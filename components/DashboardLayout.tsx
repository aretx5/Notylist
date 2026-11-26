'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FiEdit3,
  FiHome,
  FiFileText,
  FiFolder,
  FiStar,
  FiShare2,
  FiTrash2,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiCheckSquare,
  FiDownload,
  FiImage,
  FiUser,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { PageLoader } from '@/components/LoadingSpinner';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  icon: typeof FiHome;
  label: string;
  href: string;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchUser();
    }
  }, [mounted]);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
      });
      
      if (!response.ok) {
        throw new Error('Auth check failed');
      }
      
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        router.replace('/login');
      }
    } catch (error) {
      console.error('Auth error:', error);
      router.replace('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        toast.success('Logged out successfully');
        router.push('/login');
      } else {
        toast.error('Logout failed');
      }
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navItems: NavItem[] = [
    { icon: FiHome, label: 'Dashboard', href: '/dashboard' },
    { icon: FiFileText, label: 'All Notes', href: '/dashboard/notes' },
    { icon: FiFolder, label: 'Categories', href: '/dashboard/categories' },
    { icon: FiCheckSquare, label: 'To-Do List', href: '/dashboard/todos' },
    { icon: FiDownload, label: 'Download Tools', href: '/dashboard/tools' },
    { icon: FiImage, label: 'QR Generator', href: '/dashboard/qr-generator' },
  ];

  const secondaryNavItems: NavItem[] = [
    { icon: FiStar, label: 'Favorites', href: '/dashboard/notes?filter=favorites' },
    { icon: FiShare2, label: 'Shared', href: '/dashboard/notes?filter=shared' },
    { icon: FiTrash2, label: 'Trash', href: '/dashboard/notes?filter=trash' },
  ];

  if (!mounted || loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 bg-surface border-r border-border">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center group-hover:bg-primary-hover transition-colors">
              <FiEdit3 className="text-white" size={18} />
            </div>
            <span className="text-lg font-semibold text-text-primary">Notylist</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
          {/* Main Navigation */}
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Secondary Navigation */}
          <div className="space-y-1">
            <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
              Quick Access
            </div>
            {secondaryNavItems.map((item) => {
              const isActive = pathname.includes(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/dashboard/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
              pathname === '/dashboard/settings'
                ? 'bg-primary/10 text-primary'
                : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <FiSettings size={18} />
            Settings
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-all"
          >
            <FiLogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-surface border-b border-border flex items-center justify-between px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
        >
          {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <FiEdit3 className="text-white" size={16} />
          </div>
          <span className="font-semibold text-text-primary">Notylist</span>
        </Link>

        <Link
          href="/dashboard/settings"
          className="p-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-all"
        >
          <FiUser size={20} />
        </Link>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User Info */}
          <div className="h-16 flex items-center px-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-text-primary text-sm truncate">{user?.username || 'User'}</div>
                <div className="text-xs text-text-muted truncate">{user?.email || ''}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            <div className="space-y-1">
              <div className="px-3 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Quick Access
              </div>
              {secondaryNavItems.map((item) => {
                const isActive = pathname.includes(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Actions */}
          <div className="p-3 border-t border-border space-y-1">
            <Link
              href="/dashboard/settings"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === '/dashboard/settings'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
              }`}
            >
              <FiSettings size={18} />
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-error hover:bg-error/10 transition-all"
            >
              <FiLogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full lg:ml-64">
        <div className="min-h-screen w-full pt-16 lg:pt-0">
          <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border safe-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          <NavButton icon={FiHome} label="Home" href="/dashboard" active={pathname === '/dashboard'} />
          <NavButton icon={FiFileText} label="Notes" href="/dashboard/notes" active={pathname.startsWith('/dashboard/notes')} />
          <NavButton icon={FiCheckSquare} label="Tasks" href="/dashboard/todos" active={pathname.startsWith('/dashboard/todos')} />
          <NavButton icon={FiDownload} label="Tools" href="/dashboard/tools" active={pathname.startsWith('/dashboard/tools')} />
          <NavButton icon={FiUser} label="Profile" href="/dashboard/settings" active={pathname === '/dashboard/settings'} />
        </div>
      </nav>
    </div>
  );
}

function NavButton({
  icon: Icon,
  label,
  href,
  active,
}: {
  icon: typeof FiHome;
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
        active ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-text-secondary'
      }`}
    >
      <Icon size={20} />
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </Link>
  );
}
