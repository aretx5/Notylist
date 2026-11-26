'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiEdit3, FiLock, FiEye, FiAlertCircle, FiCalendar, FiArrowLeft } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function SharedNotePage() {
  const params = useParams();
  const noteId = params.id as string;

  const [note, setNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => { fetchNote(); }, [noteId]);

  const fetchNote = async (pw?: string) => {
    setLoading(true);
    setError('');
    try {
      const url = new URL(`${window.location.origin}/api/share/${noteId}`);
      if (pw) url.searchParams.append('password', pw);
      const data = await fetch(url.toString()).then(r => r.json());
      if (data.success) {
        setNote(data.note);
        setRequiresPassword(false);
      } else if (data.requiresPassword) {
        setRequiresPassword(true);
        if (pw) setError('Wrong password, try again');
      } else {
        setError(data.message || 'Note not found');
      }
    } catch {
      setError('Failed to load note');
    } finally {
      setLoading(false);
      setVerifying(false);
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setVerifying(true);
    fetchNote(password);
  };

  // Shared nav bar
  const Nav = () => (
    <header className="border-b border-white/10 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-text-primary">
          <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
            <FiEdit3 className="text-white" size={14} />
          </div>
          <span className="font-bold text-sm">Notylist</span>
        </Link>
        <Link href="/signup" className="btn-primary text-xs px-4 py-2">
          Try for free
        </Link>
      </div>
    </header>
  );

  if (loading && !requiresPassword) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" className="text-primary-500" />
      </div>
    );
  }

  if (requiresPassword && !note) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm">
            <div className="card p-8 space-y-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <FiLock className="text-primary-400" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-text-primary">Password required</h1>
                <p className="text-sm text-text-secondary mt-1">Enter the password to view this note</p>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-3 text-left">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoFocus
                  className="input w-full"
                />
                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}
                <button type="submit" disabled={verifying || !password.trim()} className="btn-primary w-full">
                  {verifying ? <><LoadingSpinner size="sm" /> Checking…</> : 'View note'}
                </button>
              </form>
            </div>
            <Link href="/" className="flex items-center gap-1 justify-center mt-6 text-xs text-text-muted hover:text-text-secondary transition-colors">
              <FiArrowLeft size={12} /> Back to home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Nav />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-sm card p-8 text-center space-y-4">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto">
              <FiAlertCircle className="text-red-400" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">Not found</h1>
              <p className="text-sm text-text-secondary mt-1">{error}</p>
            </div>
            <Link href="/" className="btn-secondary inline-flex">Go home</Link>
          </div>
        </div>
      </div>
    );
  }

  if (!note) return null;

  // Extract note colors from tags
  const colorTag = (note.tags || []).find((t: string) => t.startsWith('color:'));
  const bgColor = colorTag ? colorTag.split(':')[1] : '#1f2937';
  const txtColor = colorTag ? colorTag.split(':')[2] : '#e5e7eb';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Nav />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 space-y-6">
        {/* Shared badge */}
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <FiEye size={13} />
          <span>Shared note</span>
          <span>·</span>
          <FiCalendar size={13} />
          <span>{new Date(note.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Note card */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ backgroundColor: bgColor }}
        >
          {/* Title */}
          <div className="px-8 pt-8 pb-4">
            <h1 className="text-3xl font-bold leading-tight" style={{ color: txtColor }}>
              {note.title}
            </h1>
            {note.category && (
              <span
                className="inline-block mt-3 text-xs font-medium px-3 py-1 rounded-full"
                style={{ backgroundColor: `${txtColor}20`, color: txtColor }}
              >
                {note.category}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="mx-8 border-t opacity-20" style={{ borderColor: txtColor }} />

          {/* Content */}
          <div
            className="px-8 py-6 text-base leading-relaxed whitespace-pre-wrap min-h-32"
            style={{ color: `${txtColor}cc` }}
          >
            {note.content || <span className="opacity-40">No content</span>}
          </div>
        </div>

        {/* CTA */}
        <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-text-primary text-sm">Keep your own notes with Notylist</p>
            <p className="text-text-secondary text-xs mt-0.5">Free, fast, and beautifully designed.</p>
          </div>
          <Link href="/signup" className="btn-primary text-sm px-5 py-2.5 shrink-0">
            Get started free
          </Link>
        </div>
      </main>
    </div>
  );
}
