'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  FiPlus, FiSearch, FiGrid, FiList, FiMoreVertical,
  FiEdit, FiTrash, FiCopy, FiStar, FiChevronLeft,
  FiChevronRight, FiFileText, FiWifiOff,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { NoteSkeleton } from '@/components/SkeletonLoader';
import { isOfflineMode, offlineNotes } from '@/lib/offlineStorage';

function NotesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [notes, setNotes] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const filter = searchParams.get('filter') || '';
  const action = searchParams.get('action');
  const [offline] = useState(() => isOfflineMode());

  useEffect(() => { fetchCategories(); }, []);
  useEffect(() => { fetchNotes(); }, [page, searchQuery, selectedCategory, sortBy, filter, offline]);
  useEffect(() => { if (action === 'new') handleCreateNote(); }, [action]);

  const fetchCategories = async () => {
    if (offline) return; // no categories in offline mode
    try {
      const data = await fetch('/api/categories').then(r => r.json());
      if (data.success) setCategories(data.categories);
    } catch {}
  };

  const fetchNotes = async () => {
    setLoading(true);
    try {
      if (offline) {
        // ── Offline: read from localStorage ──
        const filterArg: any = {};
        if (filter === 'favorites') filterArg.is_favorite = true;
        if (filter === 'trash') filterArg.is_trashed = true;
        else filterArg.is_trashed = false;
        let results = offlineNotes.getAll(filter === 'trash' ? { is_trashed: true } : { is_trashed: false });
        if (filter === 'favorites') results = results.filter(n => n.is_favorite);
        if (searchQuery) results = results.filter(n =>
          n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.content.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setNotes(results);
        setPagination({ total: results.length, page: 1, pages: 1, limit: 999 });
      } else {
        // ── Online: read from database ──
        const params = new URLSearchParams({ page: page.toString(), search: searchQuery, sortBy, sortOrder: 'desc' });
        if (selectedCategory) params.append('categoryId', selectedCategory);
        if (filter === 'favorites') params.append('isFavorite', 'true');
        if (filter === 'trash') params.append('isDeleted', 'true');
        if (filter === 'shared') params.append('isShared', 'true');
        const data = await fetch(`/api/notes?${params}`).then(r => r.json());
        if (data.success) { setNotes(data.notes); setPagination(data.pagination); }
      }
    } catch { toast.error('Failed to load notes'); }
    finally { setLoading(false); }
  };

  const handleCreateNote = async () => {
    try {
      if (offline) {
        const note = offlineNotes.create({ title: 'Untitled Note', content: '' });
        router.push(`/dashboard/notes/${note.id}`);
        return;
      }
      const data = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Note', content: '' }),
      }).then(r => r.json());
      if (data.success) router.push(`/dashboard/notes/${data.note.id}`);
      else toast.error('Failed to create note');
    } catch { toast.error('Failed to create note'); }
  };

  const handleToggleFavorite = async (noteId: string, isFavorite: boolean) => {
    try {
      if (offline) {
        offlineNotes.update(noteId, { is_favorite: !isFavorite });
        fetchNotes();
        return;
      }
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !isFavorite }),
      });
      if (res.ok) { toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites'); fetchNotes(); }
    } catch { toast.error('Failed to update'); }
  };

  const handleTogglePin = async (_noteId: string, _isPinned: boolean) => {}; // pin not in schema

  const handleDuplicate = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/duplicate`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Note duplicated');
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to duplicate note');
    }
  };

  const handleDelete = async (noteId: string, isDeleted: boolean) => {
    if (isDeleted && !confirm('Permanently delete this note?')) {
      return;
    }

    try {
      const response = await fetch(`/api/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(isDeleted ? 'Note permanently deleted' : 'Note moved to trash');
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleRestore = async (noteId: string) => {
    try {
      const response = await fetch(`/api/notes/${noteId}/restore`, {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Note restored');
        fetchNotes();
      }
    } catch (error) {
      toast.error('Failed to restore note');
    }
  };

  const extractColors = (note: any) => {
    // Extract colors from tags array
    if (note.tags && note.tags.length > 0) {
      const colorTag = note.tags.find((t: string) => t.startsWith('color:'));
      if (colorTag) {
        const [, bgColor, txtColor] = colorTag.split(':');
        return { bgColor: bgColor || '#1f2937', txtColor: txtColor || '#e5e7eb' };
      }
    }
    return { bgColor: '#1f2937', txtColor: '#e5e7eb' }; // Default colors
  };

  const getTitle = () => {
    if (filter === 'favorites') return 'Favorite Notes';
    if (filter === 'shared') return 'Shared Notes';
    if (filter === 'trash') return 'Trash';
    return 'All Notes';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Offline banner */}
        {offline && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
            <FiWifiOff size={15} className="shrink-0" />
            <span>Offline mode — showing data from local storage. Go to <strong>Settings</strong> to sync with database.</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-display-md text-text-primary font-bold">{getTitle()}</h1>
            <div className="text-text-secondary text-sm">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Loading notes...
                </span>
              ) : (
                `${pagination?.total || 0} notes${offline ? ' (local)' : ''}`
              )}
            </div>
          </div>
          <button onClick={handleCreateNote} className="btn-primary px-6 py-3 gap-2">
            <FiPlus size={20} />
            <span>New Note</span>
          </button>
        </div>

        {/* Search & Filters */}
        <div className="card p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input lg:w-48"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input lg:w-48"
            >
              <option value="updatedAt">Last Modified</option>
              <option value="createdAt">Date Created</option>
              <option value="title">Title</option>
            </select>

            {/* View Toggle */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-primary text-white' : 'bg-background-elevated text-text-secondary hover:bg-surface-hover'
                }`}
              >
                <FiGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 border-l border-border transition-colors ${
                  viewMode === 'list' ? 'bg-primary text-white' : 'bg-background-elevated text-text-secondary hover:bg-surface-hover'
                }`}
              >
                <FiList size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Notes Grid/List */}
        {loading ? (
          <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <NoteSkeleton key={i} />
            ))}
          </div>
        ) : notes.length > 0 ? (
          <>
            <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  viewMode={viewMode}
                  onEdit={() => router.push(`/dashboard/notes/${note.id}`)}
                  onToggleFavorite={() => handleToggleFavorite(note.id, note.is_favorite)}
                  onTogglePin={() => handleTogglePin(note.id, note.is_pinned)}
                  onDuplicate={() => handleDuplicate(note.id)}
                  onDelete={() => handleDelete(note.id, note.is_deleted)}
                  onRestore={() => handleRestore(note.id)}
                  showMenu={showMenu === note.id}
                  setShowMenu={(show: boolean) => setShowMenu(show ? note.id : null)}
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft size={18} />
                </button>

                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  let pageNum;
                  if (pagination.pages <= 7) {
                    pageNum = i + 1;
                  } else if (page <= 4) {
                    pageNum = i + 1;
                  } else if (page >= pagination.pages - 3) {
                    pageNum = pagination.pages - 6 + i;
                  } else {
                    pageNum = page - 3 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`min-w-[40px] px-4 py-2 rounded-lg font-medium transition-all ${
                        pageNum === page
                          ? 'bg-primary text-white'
                          : 'btn-secondary'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="btn-secondary p-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="card p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <FiFileText className="text-primary" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-text-primary">
                {searchQuery || selectedCategory ? 'No notes found' : 'No notes yet'}
              </h3>
              <p className="text-text-secondary">
                {searchQuery || selectedCategory
                  ? 'Try adjusting your search or filters'
                  : 'Create your first note to get started'}
              </p>
            </div>
            {!searchQuery && !selectedCategory && (
              <button
                onClick={handleCreateNote}
                className="btn-primary px-6 py-3 inline-flex items-center gap-2"
              >
                <FiPlus size={18} />
                Create Note
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function NoteCard({ note, viewMode, onEdit, onToggleFavorite, onTogglePin, onDuplicate, onDelete, onRestore, showMenu, setShowMenu }: any) {
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '').substring(0, 150);
  };

  // Extract colors from note tags
  const extractColors = (note: any) => {
    if (note.tags && note.tags.length > 0) {
      const colorTag = note.tags.find((t: string) => t.startsWith('color:'));
      if (colorTag) {
        const [, bgColor, txtColor] = colorTag.split(':');
        return { bgColor: bgColor || '#1f2937', txtColor: txtColor || '#e5e7eb' };
      }
    }
    return { bgColor: '#1f2937', txtColor: '#e5e7eb' };
  };

  const { bgColor, txtColor } = extractColors(note);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all hover:shadow-lg ${viewMode === 'list' ? 'flex items-center' : ''} cursor-pointer`}
      onClick={onEdit}
      style={{
        backgroundColor: bgColor,
        borderColor: `${txtColor}20`,
      }}
    >
      {note.is_pinned && (
        <div className="absolute top-4 left-4 z-10">
          <FiMapPin style={{ color: txtColor }} size={16} />
        </div>
      )}

      <div className={`${viewMode === 'list' ? 'flex-1 flex items-center gap-4' : ''} p-6`}>
        <div className={viewMode === 'list' ? 'flex-1 min-w-0' : 'space-y-3'}>
          <h3 className="text-lg font-semibold line-clamp-1" style={{ color: txtColor }}>
            {note.title}
          </h3>
          <p className="text-sm line-clamp-2 opacity-70" style={{ color: txtColor }}>
            {stripHtml(note.content) || 'No content'}
          </p>
          <div className="flex items-center gap-2 text-xs opacity-50" style={{ color: txtColor }}>
            {note.category && (
              <span 
                className="px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${txtColor}20`,
                  color: txtColor
                }}
              >
                {note.category}
              </span>
            )}
            <span>{new Date(note.updated_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div 
        className={`${viewMode === 'list' ? 'flex items-center gap-1 px-4' : 'absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100'} transition-opacity`}
        style={{ color: txtColor }}
      >
        {!note.is_trashed && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className="p-2 rounded-lg hover:bg-black/10 transition-colors"
          >
            <FiStar
              className={note.is_favorite ? 'fill-current' : ''}
              size={16}
              style={{ color: note.is_favorite ? '#f59e0b' : txtColor }}
            />
          </button>
        )}

        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-2 rounded-lg hover:bg-black/10 transition-colors"
          >
            <FiMoreVertical size={16} />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute right-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-2 z-20 space-y-1 animate-scale-in">
                {note.is_trashed ? (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); onRestore(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors">
                      <FiEdit size={14} /> Restore
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg flex items-center gap-2 transition-colors">
                      <FiTrash size={14} /> Delete Forever
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={(e) => { e.stopPropagation(); window.location.href = `/dashboard/notes/${note.id}`; }}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors">
                      <FiEdit size={14} /> Open & Edit
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDuplicate(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-gray-700 rounded-lg flex items-center gap-2 transition-colors">
                      <FiCopy size={14} /> Duplicate
                    </button>
                    <div className="h-px bg-gray-700 my-1" />
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-900/30 rounded-lg flex items-center gap-2 transition-colors">
                      <FiTrash size={14} /> Delete
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={<DashboardLayout><div className="text-center py-12"><div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div></DashboardLayout>}>
      <NotesContent />
    </Suspense>
  );
}
