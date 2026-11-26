/**
 * Offline Storage Service
 * When offline mode is enabled, all data reads/writes go to localStorage.
 * When disabled, data comes from the database as normal.
 */

const KEYS = {
  ENABLED:    'notylist_offline_enabled',
  NOTES:      'notylist_offline_notes',
  TODOS:      'notylist_offline_todos',
  SYNCED_AT:  'notylist_offline_synced_at',
};

// ── Mode helpers ──────────────────────────────────────────────────────────────

export function isOfflineMode(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(KEYS.ENABLED) === 'true';
}

export function setOfflineMode(enabled: boolean): void {
  localStorage.setItem(KEYS.ENABLED, String(enabled));
}

// ── Generic getter/setter ─────────────────────────────────────────────────────

function getStore<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function setStore<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

function uid(): string {
  return 'local_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

function now(): string {
  return new Date().toISOString();
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export interface LocalNote {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  is_trashed: boolean;
  is_public: boolean;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  _local: boolean; // flag to know it was created offline
}

export const offlineNotes = {
  getAll(filter?: Partial<LocalNote>): LocalNote[] {
    let notes = getStore<LocalNote>(KEYS.NOTES);
    if (filter) {
      notes = notes.filter(n =>
        Object.entries(filter).every(([k, v]) => (n as any)[k] === v)
      );
    }
    return notes.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  },

  getById(id: string): LocalNote | null {
    return getStore<LocalNote>(KEYS.NOTES).find(n => n.id === id) ?? null;
  },

  create(data: { title: string; content?: string; category?: string; tags?: string[] }): LocalNote {
    const note: LocalNote = {
      id: uid(),
      title: data.title,
      content: data.content ?? '',
      category: data.category ?? 'general',
      tags: data.tags ?? [],
      is_favorite: false,
      is_archived: false,
      is_trashed: false,
      is_public: false,
      public_slug: null,
      created_at: now(),
      updated_at: now(),
      deleted_at: null,
      _local: true,
    };
    const all = getStore<LocalNote>(KEYS.NOTES);
    setStore(KEYS.NOTES, [note, ...all]);
    return note;
  },

  update(id: string, patch: Partial<LocalNote>): LocalNote | null {
    const all = getStore<LocalNote>(KEYS.NOTES);
    const idx = all.findIndex(n => n.id === id);
    if (idx === -1) return null;
    all[idx] = { ...all[idx], ...patch, updated_at: now() };
    setStore(KEYS.NOTES, all);
    return all[idx];
  },

  delete(id: string, permanent = false): boolean {
    const all = getStore<LocalNote>(KEYS.NOTES);
    if (permanent) {
      setStore(KEYS.NOTES, all.filter(n => n.id !== id));
    } else {
      const idx = all.findIndex(n => n.id === id);
      if (idx === -1) return false;
      all[idx] = { ...all[idx], is_trashed: true, deleted_at: now(), updated_at: now() };
      setStore(KEYS.NOTES, all);
    }
    return true;
  },

  /** Seed from database data (called when switching TO offline mode) */
  seedFromDB(notes: any[]): void {
    const existing = getStore<LocalNote>(KEYS.NOTES);
    // Merge: DB notes that don't already exist locally
    const existingIds = new Set(existing.map(n => n.id));
    const incoming = notes
      .filter(n => !existingIds.has(n.id))
      .map(n => ({ ...n, _local: false }));
    setStore(KEYS.NOTES, [...existing, ...incoming]);
    localStorage.setItem(KEYS.SYNCED_AT, now());
  },

  clear(): void {
    localStorage.removeItem(KEYS.NOTES);
  },
};

// ── Todos ─────────────────────────────────────────────────────────────────────

export interface LocalTodo {
  id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string | null;
  due_date: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
  _local: boolean;
}

export const offlineTodos = {
  getAll(filter?: { is_completed?: boolean; priority?: string }): LocalTodo[] {
    let todos = getStore<LocalTodo>(KEYS.TODOS);
    if (filter?.is_completed !== undefined)
      todos = todos.filter(t => t.is_completed === filter.is_completed);
    if (filter?.priority)
      todos = todos.filter(t => t.priority === filter.priority);
    return todos.sort((a, b) => a.order_index - b.order_index);
  },

  create(data: { title: string; description?: string; priority?: 'low' | 'medium' | 'high'; due_date?: string; category?: string }): LocalTodo {
    const all = getStore<LocalTodo>(KEYS.TODOS);
    const todo: LocalTodo = {
      id: uid(),
      title: data.title,
      description: data.description ?? null,
      is_completed: false,
      priority: data.priority ?? 'medium',
      category: data.category ?? null,
      due_date: data.due_date ?? null,
      order_index: all.length,
      created_at: now(),
      updated_at: now(),
      completed_at: null,
      _local: true,
    };
    setStore(KEYS.TODOS, [...all, todo]);
    return todo;
  },

  update(id: string, patch: Partial<LocalTodo>): LocalTodo | null {
    const all = getStore<LocalTodo>(KEYS.TODOS);
    const idx = all.findIndex(t => t.id === id);
    if (idx === -1) return null;
    all[idx] = {
      ...all[idx],
      ...patch,
      updated_at: now(),
      completed_at: patch.is_completed ? now() : all[idx].completed_at,
    };
    setStore(KEYS.TODOS, all);
    return all[idx];
  },

  delete(id: string): boolean {
    const all = getStore<LocalTodo>(KEYS.TODOS);
    const next = all.filter(t => t.id !== id);
    if (next.length === all.length) return false;
    setStore(KEYS.TODOS, next);
    return true;
  },

  seedFromDB(todos: any[]): void {
    const existing = getStore<LocalTodo>(KEYS.TODOS);
    const existingIds = new Set(existing.map(t => t.id));
    const incoming = todos
      .filter(t => !existingIds.has(t.id))
      .map(t => ({ ...t, _local: false }));
    setStore(KEYS.TODOS, [...existing, ...incoming]);
  },

  clear(): void {
    localStorage.removeItem(KEYS.TODOS);
  },
};

// ── Sync status ───────────────────────────────────────────────────────────────

export function getLastSyncedAt(): string | null {
  return localStorage.getItem(KEYS.SYNCED_AT);
}
