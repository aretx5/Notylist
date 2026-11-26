'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  FiArrowLeft,
  FiMoreVertical,
  FiTrash,
  FiCopy,
  FiStar,
  FiShare2,
  FiX,
  FiCheck,
  FiEye,
  FiEyeOff,
  FiLock,
  FiTag,
  FiCloud,
  FiLoader,
  FiDroplet,
} from 'react-icons/fi';

import toast from 'react-hot-toast';
import { isOfflineMode, offlineNotes } from '@/lib/offlineStorage';

const BACKGROUND_COLORS = [
  { name: 'Dark Gray', value: '#1f2937', text: '#e5e7eb' },
  { name: 'Slate', value: '#1e293b', text: '#e2e8f0' },
  { name: 'Navy', value: '#172554', text: '#dbeafe' },
  { name: 'Forest', value: '#14532d', text: '#d1fae5' },
  { name: 'Purple', value: '#3b1f54', text: '#e9d5ff' },
  { name: 'Rose', value: '#4c1d3b', text: '#fce7f3' },
  { name: 'Amber', value: '#451a03', text: '#fef3c7' },
  { name: 'Teal', value: '#134e4a', text: '#ccfbf1' },
];

export default function NoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [noteId, setNoteId] = useState<string>('');

  const [note, setNote] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [backgroundColor, setBackgroundColor] = useState('#1f2937');
  const [textColor, setTextColor] = useState('#e5e7eb');
  const [offline] = useState(() => isOfflineMode());
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Unwrap params
    params.then((p) => setNoteId(p.id));
  }, []);

  useEffect(() => {
    if (!noteId) return;
    fetchNote();
    fetchCategories();
  }, [noteId]);

  useEffect(() => {
    if (!note) return;
    if (title !== note.title || content !== note.content) {
      setSaved(false);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => handleSave(false), 1500);
    }
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [title, content]);

  const fetchNote = async () => {
    try {
      let data: any;
      if (offline) {
        const local = offlineNotes.getById(noteId);
        data = local ? { success: true, note: local } : { success: false };
      } else {
        const response = await fetch(`/api/notes/${noteId}`);
        data = await response.json();
      }
      if (data.success) {
        setNote(data.note);
        setTitle(data.note.title);
        setContent(data.note.content || '');
        setLastSaved(new Date(data.note.updated_at));
        setSaved(true);
        
        // Load saved colors from tags (we'll store color data there)
        if (data.note.tags && data.note.tags.length > 0) {
          const colorTag = data.note.tags.find((t: string) => t.startsWith('color:'));
          if (colorTag) {
            const [, bgColor, txtColor] = colorTag.split(':');
            setBackgroundColor(bgColor || '#1f2937');
            setTextColor(txtColor || '#e5e7eb');
          }
        }
      } else {
        toast.error('Failed to load note');
        router.push('/dashboard/notes');
      }
    } catch {
      toast.error('Failed to load note');
      router.push('/dashboard/notes');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.categories);
    } catch {}
  };

  const handleSave = async (showToast = true) => {
    if (!title.trim()) { if (showToast) toast.error('Title cannot be empty'); return; }
    setSaving(true);
    try {
      if (offline) {
        const updated = offlineNotes.update(noteId, { title, content });
        if (updated) { setNote(updated); setLastSaved(new Date()); setSaved(true); if (showToast) toast.success('Saved locally'); }
      } else {
        const res = await fetch(`/api/notes/${noteId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        });
        const data = await res.json();
        if (data.success) { setNote(data.note); setLastSaved(new Date()); setSaved(true); if (showToast) toast.success('Saved'); }
        else if (showToast) toast.error('Failed to save');
      }
    } catch { if (showToast) toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleUpdateField = async (field: string, value: any) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      const data = await res.json();
      if (data.success) { setNote(data.note); return true; }
      return false;
    } catch { return false; }
  };

  const handleToggleFavorite = async () => {
    if (await handleUpdateField('isFavorite', !note.is_favorite))
      toast.success(note.is_favorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleChangeColor = async (bgColor: string, txtColor: string) => {
    // Store colors in tags array
    const otherTags = (note?.tags || []).filter((t: string) => !t.startsWith('color:'));
    const colorTag = `color:${bgColor}:${txtColor}`;
    const newTags = [...otherTags, colorTag];
    
    if (await handleUpdateField('tags', newTags)) {
      setBackgroundColor(bgColor);
      setTextColor(txtColor);
      toast.success('Color updated');
      setShowColorPicker(false);
    }
  };

  const handleChangeCategory = async (category: string) => {
    if (await handleUpdateField('category', category || null))
      toast.success('Category updated');
  };

  const handleDelete = async () => {
    if (!confirm('Move this note to trash?')) return;
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      if (res.ok) { toast.success('Moved to trash'); router.push('/dashboard/notes'); }
    } catch { toast.error('Failed to delete'); }
  };

  const handleDuplicate = async () => {
    try {
      const res = await fetch(`/api/notes/${noteId}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { toast.success('Duplicated'); router.push(`/dashboard/notes/${data.note.id}`); }
    } catch { toast.error('Failed to duplicate'); }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" className="text-primary-500" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto flex flex-col gap-4">

        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => router.push('/dashboard/notes')}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft size={16} />
            <span>Notes</span>
          </button>

          <div className="flex items-center gap-2">
            {/* save status */}
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              {saving ? (
                <><FiLoader size={12} className="animate-spin text-indigo-400" /> Saving…</>
              ) : saved && lastSaved ? (
                <><FiCheck size={12} className="text-green-500" /> Saved {lastSaved.toLocaleTimeString()}</>
              ) : (
                <><FiCloud size={12} className="text-gray-600" /> Unsaved</>
              )}
            </span>

            {/* manual save */}
            <button
              onClick={() => handleSave(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Save
            </button>

            {/* More menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
              >
                <FiMoreVertical size={18} />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-20 overflow-hidden">
                    {[
                      { icon: <FiStar size={15} />, label: note?.is_favorite ? 'Unfavorite' : 'Favorite', action: () => { handleToggleFavorite(); setShowMenu(false); } },
                      { icon: <FiDroplet size={15} />, label: 'Change colors', action: () => { setShowColorPicker(true); setShowMenu(false); } },
                      { icon: <FiShare2 size={15} />, label: 'Share', action: () => { setShowShareModal(true); setShowMenu(false); } },
                      { icon: <FiCopy size={15} />, label: 'Duplicate', action: () => { handleDuplicate(); setShowMenu(false); } },
                    ].map((item) => (
                      <button key={item.label} onClick={item.action}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">
                        {item.icon} {item.label}
                      </button>
                    ))}
                    <div className="border-t border-gray-700" />
                    <button onClick={() => { handleDelete(); setShowMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 transition-colors">
                      <FiTrash size={15} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Category & metadata bar ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <FiTag size={14} className="text-gray-500" />
            <select
              value={note?.category || ''}
              onChange={(e) => handleChangeCategory(e.target.value)}
              className="text-sm bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 hover:border-gray-600 transition-colors"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          {note?.is_favorite && (
            <span className="flex items-center gap-1 text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-800 px-2.5 py-1 rounded-full">
              <FiStar size={11} /> Favorite
            </span>
          )}
        </div>

        {/* ── Editor card ── */}
        <div 
          className="rounded-2xl border border-gray-700/60 overflow-hidden shadow-xl transition-colors duration-300"
          style={{ 
            backgroundColor: backgroundColor,
            color: textColor
          }}
        >
          {/* Title input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled note…"
            className="w-full px-6 pt-6 pb-3 text-3xl font-bold bg-transparent border-none focus:outline-none placeholder-gray-500"
            style={{ color: textColor }}
          />
          <div className="px-4 pb-2">
            <div className="border-t opacity-30" style={{ borderColor: textColor }} />
          </div>

          {/* Content editor - simple textarea for now */}
          <div className="px-6 pb-6">
            <div className="space-y-3">
              {/* Toolbar */}
              <div 
                className="flex items-center gap-1 px-3 py-2 rounded-lg backdrop-blur-sm"
                style={{ 
                  backgroundColor: `${backgroundColor}dd`,
                  borderWidth: '1px',
                  borderColor: `${textColor}30`
                }}
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
                      if (!textarea) return;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = content.substring(start, end) || 'text';
                      const newContent = content.substring(0, start) + '**' + selectedText + '**' + content.substring(end);
                      setContent(newContent);
                      setTimeout(() => textarea.focus(), 0);
                    }}
                    className="p-2 rounded hover:bg-black/20 transition-colors"
                    style={{ color: `${textColor}99` }}
                    title="Bold (Ctrl+B)"
                  >
                    <strong>B</strong>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
                      if (!textarea) return;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = content.substring(start, end) || 'text';
                      const newContent = content.substring(0, start) + '*' + selectedText + '*' + content.substring(end);
                      setContent(newContent);
                      setTimeout(() => textarea.focus(), 0);
                    }}
                    className="p-2 rounded hover:bg-black/20 transition-colors"
                    style={{ color: `${textColor}99` }}
                    title="Italic (Ctrl+I)"
                  >
                    <em>I</em>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
                      if (!textarea) return;
                      const start = textarea.selectionStart;
                      const end = textarea.selectionEnd;
                      const selectedText = content.substring(start, end) || 'text';
                      const newContent = content.substring(0, start) + '`' + selectedText + '`' + content.substring(end);
                      setContent(newContent);
                      setTimeout(() => textarea.focus(), 0);
                    }}
                    className="p-2 rounded hover:bg-black/20 transition-colors font-mono text-sm"
                    style={{ color: `${textColor}99` }}
                    title="Code"
                  >
                    {'</>'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const textarea = document.getElementById('note-content') as HTMLTextAreaElement;
                      if (!textarea) return;
                      const start = textarea.selectionStart;
                      const newContent = content.substring(0, start) + '\n- ' + content.substring(start);
                      setContent(newContent);
                      setTimeout(() => textarea.focus(), 0);
                    }}
                    className="p-2 rounded hover:bg-black/20 transition-colors"
                    style={{ color: `${textColor}99` }}
                    title="List"
                  >
                    ≡
                  </button>
                </div>
                <div className="flex-1" />
                <div className="text-xs opacity-50" style={{ color: textColor }}>
                  Markdown
                </div>
              </div>

              {/* Textarea */}
              <textarea
                id="note-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing your note..."
                className="w-full min-h-[400px] px-0 py-0 bg-transparent border-none focus:outline-none resize-none text-base leading-relaxed"
                style={{ 
                  fontFamily: 'inherit',
                  color: textColor,
                }}
              />

              {/* Markdown Hint */}
              <div className="text-xs opacity-40 px-1" style={{ color: textColor }}>
                **bold** • *italic* • `code` • [link](url) • - list
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Color picker modal ── */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowColorPicker(false)}>
          <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-white">Note Colors</h3>
              <button onClick={() => setShowColorPicker(false)} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white">
                <FiX size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BACKGROUND_COLORS.map((c) => (
                <button 
                  key={c.name} 
                  onClick={() => handleChangeColor(c.value, c.text)}
                  className="group relative h-20 rounded-xl transition-transform hover:scale-105 ring-2 ring-transparent hover:ring-primary-500 overflow-hidden"
                  style={{ backgroundColor: c.value }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium px-2 py-1 rounded" style={{ color: c.text }}>
                      {c.name}
                    </span>
                  </div>
                  {backgroundColor === c.value && (
                    <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                      <FiCheck size={12} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Share modal ── */}
      {showShareModal && (
        <ShareModal noteId={noteId} note={note} onClose={() => setShowShareModal(false)} onUpdate={setNote} />
      )}
    </DashboardLayout>
  );
}

function ShareModal({ noteId, note, onClose, onUpdate }: any) {
  // Extract share settings from tags
  const getShareSettings = () => {
    if (note?.tags && note.tags.length > 0) {
      const shareTag = note.tags.find((t: string) => t.startsWith('share:'));
      if (shareTag) {
        const parts = shareTag.split(':');
        return { type: parts[1] || 'private', password: parts[2] || '' };
      }
    }
    return { type: 'private', password: '' };
  };

  const initialSettings = getShareSettings();
  const [shareType, setShareType] = useState(initialSettings.type);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState(
    note?.is_public && note?.public_slug
      ? `${typeof window !== 'undefined' ? window.location.origin : ''}/sharenote/${note.public_slug}`
      : ''
  );

  const handleShare = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/share/${noteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareType, password: shareType === 'password' ? password : undefined }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Share settings updated');
        setShareUrl(data.shareUrl);
        onUpdate({ ...note, share_type: shareType });
      } else toast.error('Failed to update');
    } catch { toast.error('Failed to update'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Share note</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-white"><FiX size={16} /></button>
        </div>

        <div className="space-y-4">
          {[
            { value: 'private', icon: <FiEyeOff size={15} />, label: 'Private', desc: 'Only you can see' },
            { value: 'public', icon: <FiEye size={15} />, label: 'Public', desc: 'Anyone with the link' },
            { value: 'password', icon: <FiLock size={15} />, label: 'Password protected', desc: 'Requires a password' },
          ].map((opt) => (
            <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${shareType === opt.value ? 'border-indigo-600 bg-indigo-900/20' : 'border-gray-700 hover:border-gray-600'}`}>
              <input type="radio" value={opt.value} checked={shareType === opt.value} onChange={(e) => setShareType(e.target.value)} className="accent-indigo-500" />
              <span className="text-gray-400">{opt.icon}</span>
              <div>
                <p className="text-sm font-medium text-white">{opt.label}</p>
                <p className="text-xs text-gray-500">{opt.desc}</p>
              </div>
            </label>
          ))}

          {shareType === 'password' && (
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          )}

          {shareUrl && (
            <div className="flex gap-2">
              <input type="text" value={shareUrl} readOnly
                className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-xs text-gray-400 truncate"
              />
              <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast.success('Copied!'); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-xl transition-colors">Copy</button>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={handleShare} disabled={loading || (shareType === 'password' && !password)}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              {loading ? 'Saving…' : 'Save settings'}
            </button>
            <button onClick={onClose} className="px-5 py-2.5 border border-gray-700 rounded-xl text-sm text-gray-400 hover:text-white hover:border-gray-600 transition-colors">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
