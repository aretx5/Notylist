'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  FiFileText,
  FiStar,
  FiTrash2,
  FiShare2,
  FiClock,
  FiTrendingUp,
  FiPlus,
  FiArrowRight,
  FiFolder,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { StatCardSkeleton } from '@/components/SkeletonLoader';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/notes/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.stats);
      } else {
        toast.error('Failed to load dashboard stats');
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-display-md text-text-primary font-bold">
            Dashboard
          </h1>
          <p className="text-text-secondary">
            Welcome back! Here's an overview of your workspace.
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={<FiFileText size={20} />}
              label="Total Notes"
              value={stats?.totalNotes || 0}
              trend="+12% from last month"
              color="primary"
              onClick={() => router.push('/dashboard/notes')}
            />
            <StatCard
              icon={<FiStar size={20} />}
              label="Favorites"
              value={stats?.favoritesCount || 0}
              trend="Quick access"
              color="warning"
              onClick={() => router.push('/dashboard/notes?filter=favorites')}
            />
            <StatCard
              icon={<FiShare2 size={20} />}
              label="Shared"
              value={stats?.sharedCount || 0}
              trend="Collaborative"
              color="success"
              onClick={() => router.push('/dashboard/notes?filter=shared')}
            />
            <StatCard
              icon={<FiTrash2 size={20} />}
              label="Trash"
              value={stats?.trashedCount || 0}
              trend="Auto-delete in 30 days"
              color="error"
              onClick={() => router.push('/dashboard/notes?filter=trash')}
            />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <ActionCard
            icon={<FiPlus size={20} />}
            title="Create Note"
            description="Start a new note with our rich text editor"
            onClick={() => router.push('/dashboard/notes?action=new')}
            primary
          />
          <ActionCard
            icon={<FiFileText size={20} />}
            title="Browse Notes"
            description="View and manage all your notes"
            onClick={() => router.push('/dashboard/notes')}
          />
          <ActionCard
            icon={<FiFolder size={20} />}
            title="Organize"
            description="Manage categories and tags"
            onClick={() => router.push('/dashboard/categories')}
          />
        </div>

        {/* Recent Activity */}
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FiClock className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Recently Updated</h2>
                <p className="text-sm text-text-secondary">Your latest activity</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard/notes')}
              className="text-sm font-medium text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1"
            >
              View All
              <FiArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 skeleton rounded-lg" />
              ))}
            </div>
          ) : stats?.recentNotes && stats.recentNotes.length > 0 ? (
            <div className="space-y-2">
              {stats.recentNotes.map((note: any) => (
                <button
                  key={note._id}
                  onClick={() => router.push(`/dashboard/notes/${note._id}`)}
                  className="w-full flex items-center justify-between p-4 bg-background-elevated hover:bg-surface-hover rounded-lg transition-all group"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FiFileText className="text-primary" size={16} />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                        {note.title}
                      </p>
                      <p className="text-sm text-text-secondary">
                        Updated {new Date(note.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <FiArrowRight className="text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-background-elevated flex items-center justify-center mx-auto">
                <FiFileText className="text-text-muted" size={28} />
              </div>
              <div className="space-y-2">
                <p className="text-text-secondary">No notes yet</p>
                <p className="text-sm text-text-muted">Create your first note to get started</p>
              </div>
              <button
                onClick={() => router.push('/dashboard/notes?action=new')}
                className="btn-primary px-6 py-2 text-sm inline-flex items-center gap-2"
              >
                <FiPlus size={16} />
                Create Note
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({
  icon,
  label,
  value,
  trend,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  trend: string;
  color: 'primary' | 'success' | 'warning' | 'error';
  onClick: () => void;
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
  };

  return (
    <button
      onClick={onClick}
      className="card-hover p-6 text-left space-y-4 group"
    >
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-bold text-text-primary">{value}</div>
        <div className="text-sm font-medium text-text-secondary">{label}</div>
        <div className="text-xs text-text-muted">{trend}</div>
      </div>
    </button>
  );
}

function ActionCard({
  icon,
  title,
  description,
  onClick,
  primary,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`card-hover p-6 text-left space-y-4 group ${
        primary ? 'border-primary/50 bg-primary/5' : ''
      }`}
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform ${
        primary ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
      }`}>
        {icon}
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        {primary ? 'Get started' : 'View'}
        <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
}
