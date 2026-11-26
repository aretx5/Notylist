'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import WaveLoader from '@/components/WaveLoader';
import { useTheme } from 'next-themes';
import { FiSun, FiMoon, FiMonitor, FiTrash2, FiLogOut, FiMail, FiShield, FiWifiOff, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useOffline } from '@/lib/useOffline';
import { offlineNotes, offlineTodos, getLastSyncedAt } from '@/lib/offlineStorage';

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showWaveLoader, setShowWaveLoader] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { offline, isOnline, toggle } = useOffline();
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  useEffect(() => {
    // Show wave loader for 1 second
    const timer = setTimeout(() => {
      setShowWaveLoader(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMounted(true);
    setLastSynced(getLastSyncedAt());
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.success) setUser(d.user); })
      .finally(() => setLoading(false));
  }, []);

  const handleToggleOffline = async (enabled: boolean) => {
    if (enabled && isOnline) {
      // Seed localStorage with current DB data before switching
      setSyncing(true);
      try {
        const [notesRes, todosRes] = await Promise.all([
          fetch('/api/notes?page=1&limit=500').then(r => r.json()),
          fetch('/api/todos').then(r => r.json()),
        ]);
        if (notesRes.success) offlineNotes.seedFromDB(notesRes.notes);
        if (todosRes.success) offlineTodos.seedFromDB(todosRes.todos);
        setLastSynced(new Date().toISOString());
        toggle(true);
        toast.success('Offline mode enabled — data saved locally');
      } catch {
        toast.error('Failed to sync data for offline use');
      } finally {
        setSyncing(false);
      }
    } else {
      toggle(enabled);
      toast(enabled ? 'Offline mode enabled' : 'Online mode — using database', { icon: enabled ? '📴' : '🌐' });
    }
  };

  const handleResync = async () => {
    if (!isOnline) { toast.error('No internet connection'); return; }
    setSyncing(true);
    try {
      const [notesRes, todosRes] = await Promise.all([
        fetch('/api/notes?page=1&limit=500').then(r => r.json()),
        fetch('/api/todos').then(r => r.json()),
      ]);
      if (notesRes.success) offlineNotes.seedFromDB(notesRes.notes);
      if (todosRes.success) offlineTodos.seedFromDB(todosRes.todos);
      setLastSynced(new Date().toISOString());
      toast.success('Local data refreshed from database');
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      toast.error('Failed to log out');
      setLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch('/api/user/delete-account', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        toast.success('Account deleted');
        router.push('/');
      } else {
        toast.error(data.message || 'Failed to delete account');
        setDeleting(false);
      }
    } catch {
      toast.error('Failed to delete account');
      setDeleting(false);
    }
  };

  if (showWaveLoader) {
    return <WaveLoader />;
  }

  if (loading || !mounted) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" className="text-primary-500" />
        </div>
      </DashboardLayout>
    );
  }

  const themeOptions = [
    { value: 'light',  label: 'Light',  icon: <FiSun size={18} /> },
    { value: 'dark',   label: 'Dark',   icon: <FiMoon size={18} /> },
    { value: 'system', label: 'System', icon: <FiMonitor size={18} /> },
  ];

  // Avatar initials
  const initials = (user?.email || '?').charAt(0).toUpperCase();

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Settings</h1>
          <p className="text-sm text-text-secondary mt-0.5">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-bold shrink-0">
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="avatar" className="w-full h-full rounded-2xl object-cover" />
                : initials
              }
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-text-primary truncate">{user?.email || '—'}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs text-text-secondary capitalize">{user?.oauth_provider || 'OAuth'} account</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center gap-3 text-sm text-text-muted">
            <FiMail size={14} />
            <span>{user?.email || 'No email'}</span>
            <span className="ml-auto text-xs bg-white/5 px-2 py-0.5 rounded-full">Read-only</span>
          </div>
        </div>

        {/* Offline / Local Storage */}
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiWifiOff size={15} className={offline ? 'text-amber-400' : 'text-text-muted'} />
              <div>
                <p className="text-sm font-semibold text-text-primary">Offline Mode</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {offline ? 'Reading & writing to local storage' : 'Reading & writing to database'}
                </p>
              </div>
            </div>
            {/* Toggle switch */}
            <button
              onClick={() => handleToggleOffline(!offline)}
              disabled={syncing}
              className={`relative w-11 h-6 rounded-full transition-colors ${offline ? 'bg-amber-500' : 'bg-white/15'}`}
            >
              {syncing ? (
                <span className="absolute inset-0 flex items-center justify-center">
                  <LoadingSpinner size="sm" />
                </span>
              ) : (
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${offline ? 'translate-x-5' : 'translate-x-0'}`} />
              )}
            </button>
          </div>

          {offline && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2 text-xs text-amber-300 leading-relaxed">
                <FiWifiOff size={13} className="mt-0.5 shrink-0" />
                <span>
                  All notes and todos are saved in your browser's local storage.
                  Changes won't sync to the database until you disable offline mode.
                </span>
              </div>
              {lastSynced && (
                <p className="text-xs text-text-muted">
                  Last synced: {new Date(lastSynced).toLocaleString()}
                </p>
              )}
              <button
                onClick={handleResync}
                disabled={syncing || !isOnline}
                className="flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/60 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
              >
                <FiRefreshCw size={12} className={syncing ? 'animate-spin' : ''} />
                {syncing ? 'Syncing…' : 'Refresh local data from database'}
              </button>
            </div>
          )}

          {!isOnline && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
              <FiWifiOff size={12} />
              You're offline. App is using local storage automatically.
            </div>
          )}
        </div>

        {/* Appearance */}
        <div className="card p-5 space-y-3">
          <p className="text-sm font-semibold text-text-primary">Appearance</p>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all text-sm font-medium ${
                  theme === opt.value
                    ? 'border-primary bg-primary/10 text-primary-400'
                    : 'border-border text-text-secondary hover:border-primary/50 hover:text-text-primary'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="card p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
            <FiShield size={15} />
            Security
          </div>
          <div className="text-sm text-text-secondary bg-white/5 rounded-xl p-4 leading-relaxed">
            Your account is secured via <span className="text-text-primary font-medium capitalize">{user?.oauth_provider || 'OAuth'}</span>.
            Passwords are managed by your OAuth provider — there's nothing to change here.
          </div>
        </div>

        {/* Session */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text-primary">Sign out</p>
              <p className="text-xs text-text-secondary mt-0.5">Sign out of your account on this device</p>
            </div>
            <button onClick={handleLogout} disabled={loggingOut} className="btn-secondary text-sm px-4 py-2 gap-2">
              {loggingOut ? <LoadingSpinner size="sm" /> : <FiLogOut size={15} />}
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-5 space-y-3">
          <p className="text-sm font-semibold text-red-400">Danger zone</p>
          <p className="text-xs text-text-secondary leading-relaxed">
            Permanently delete your account and all associated data — notes, todos, categories.
            This cannot be undone.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-500/60 px-4 py-2 rounded-lg transition-colors"
            >
              <FiTrash2 size={15} /> Delete account
            </button>
          ) : (
            <div className="space-y-3 pt-1">
              <p className="text-xs text-red-400 font-medium">Are you absolutely sure? This deletes everything.</p>
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleting ? <LoadingSpinner size="sm" /> : <FiTrash2 size={14} />}
                  {deleting ? 'Deleting…' : 'Yes, delete everything'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-sm text-text-secondary hover:text-text-primary px-4 py-2 rounded-lg border border-border transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
