'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import WaveLoader from '@/components/WaveLoader';
import {
  FiCheckCircle, FiCircle, FiPlus, FiTrash2,
  FiClock, FiFlag, FiX, FiChevronDown, FiChevronUp, FiWifiOff,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';
import { StatCardSkeleton } from '@/components/SkeletonLoader';
import { isOfflineMode, offlineTodos } from '@/lib/offlineStorage';

interface Todo {
  id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  due_date?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

export default function TodosPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWaveLoader, setShowWaveLoader] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [offline] = useState(() => isOfflineMode());

  const [newTodo, setNewTodo] = useState({
    title: '', description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: '', category: '',
  });

  useEffect(() => {
    // Show wave loader for 1 second
    const timer = setTimeout(() => {
      setShowWaveLoader(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { fetchTodos(); }, [filter, priorityFilter]);

  const fetchTodos = async () => {
    try {
      if (offline) {
        const isCompleted = filter === 'completed' ? true : filter === 'active' ? false : undefined;
        const results = offlineTodos.getAll({
          ...(isCompleted !== undefined ? { is_completed: isCompleted } : {}),
          ...(priorityFilter ? { priority: priorityFilter } : {}),
        });
        setTodos(results as any);
      } else {
        let url = `/api/todos?filter=${filter}`;
        if (priorityFilter) url += `&priority=${priorityFilter}`;
        const data = await fetch(url).then(r => r.json());
        if (data.success) setTodos(data.todos);
        else toast.error('Failed to load todos');
      }
    } catch { toast.error('Failed to load todos'); }
    finally { setLoading(false); }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.title.trim()) { toast.error('Title is required'); return; }
    setSubmitting(true);
    try {
      if (offline) {
        const todo = offlineTodos.create(newTodo);
        setTodos([todo as any, ...todos]);
        setNewTodo({ title: '', description: '', priority: 'medium', due_date: '', category: '' });
        setShowAddModal(false);
        toast.success('Task added (offline)');
      } else {
        const data = await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTodo),
        }).then(r => r.json());
        if (data.success) {
          setTodos([data.todo, ...todos]);
          setNewTodo({ title: '', description: '', priority: 'medium', due_date: '', category: '' });
          setShowAddModal(false);
          toast.success('Task added');
        } else { toast.error(data.message); }
      }
    } catch { toast.error('Failed to add task'); }
    finally { setSubmitting(false);
    }
  };

  const handleToggleComplete = async (todo: Todo) => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_completed: !todo.is_completed,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTodos(
          todos.map((t) =>
            t.id === todo.id ? { ...t, is_completed: !t.is_completed } : t
          )
        );
        toast.success(todo.is_completed ? 'Task reopened' : 'Task completed');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      if (offline) {
        offlineTodos.delete(todoId);
        setTodos(todos.filter(t => t.id !== todoId));
        toast.success('Task deleted');
        return;
      }
      const data = await fetch(`/api/todos/${todoId}`, { method: 'DELETE' }).then(r => r.json());
      if (data.success) { setTodos(todos.filter(t => t.id !== todoId)); toast.success('Task deleted'); }
      else toast.error(data.message);
    } catch { toast.error('Failed to delete task'); }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-error/10 text-error';
      case 'medium':
        return 'bg-warning/10 text-warning';
      case 'low':
        return 'bg-success/10 text-success';
      default:
        return 'bg-text-muted/10 text-text-muted';
    }
  };

  const activeTodos = todos.filter((t) => !t.is_completed);
  const completedTodos = todos.filter((t) => t.is_completed);
  const completionRate = todos.length > 0 ? Math.round((completedTodos.length / todos.length) * 100) : 0;

  if (showWaveLoader) {
    return <WaveLoader />;
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Offline banner */}
      {offline && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300">
          <FiWifiOff size={15} className="shrink-0" />
          <span>Offline mode — changes saved locally. Go to <strong>Settings</strong> to sync.</span>
        </div>
      )}

      {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-display-md text-text-primary font-bold">
              To-Do List
            </h1>
            <p className="text-text-secondary">
              Manage your tasks and stay productive
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-6 py-3 gap-2"
          >
            <FiPlus size={20} />
            <span>Add Task</span>
          </button>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                <FiCheckCircle size={20} />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-text-primary">{todos.length}</div>
                <div className="text-sm font-medium text-text-secondary">Total Tasks</div>
                <div className="text-xs text-text-muted">{completionRate}% completed</div>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center text-warning">
                <FiCircle size={20} />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-text-primary">{activeTodos.length}</div>
                <div className="text-sm font-medium text-text-secondary">Active</div>
                <div className="text-xs text-text-muted">In progress</div>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center text-success">
                <FiCheckCircle size={20} />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-text-primary">{completedTodos.length}</div>
                <div className="text-sm font-medium text-text-secondary">Completed</div>
                <div className="text-xs text-text-muted">Done today</div>
              </div>
            </div>

            <div className="card p-6 space-y-4">
              <div className="w-12 h-12 rounded-lg bg-error/10 flex items-center justify-center text-error">
                <FiFlag size={20} />
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-text-primary">
                  {todos.filter(t => t.priority === 'high' && !t.is_completed).length}
                </div>
                <div className="text-sm font-medium text-text-secondary">High Priority</div>
                <div className="text-xs text-text-muted">Needs attention</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card p-4 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">Show:</span>
            <div className="flex gap-2">
              {(['all', 'active', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                    filter === f
                      ? 'bg-primary text-white'
                      : 'bg-background-elevated text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="h-6 w-px bg-border" />

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-text-secondary">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input py-2 text-sm"
            >
              <option value="">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 skeleton rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Active Tasks */}
            {activeTodos.length > 0 && (
              <div className="card p-6 space-y-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  Active Tasks ({activeTodos.length})
                </h2>
                <div className="space-y-3">
                  {activeTodos.map((todo) => (
                    <TodoCard
                      key={todo.id}
                      todo={todo}
                      onToggle={handleToggleComplete}
                      onDelete={handleDeleteTodo}
                      getPriorityColor={getPriorityColor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTodos.length > 0 && (
              <div className="card p-6 space-y-4">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center gap-2 text-lg font-semibold text-text-primary hover:text-primary transition-colors"
                >
                  {showCompleted ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
                  <span>Completed Tasks ({completedTodos.length})</span>
                </button>

                {showCompleted && (
                  <div className="space-y-3 opacity-75">
                    {completedTodos.map((todo) => (
                      <TodoCard
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggleComplete}
                        onDelete={handleDeleteTodo}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {todos.length === 0 && (
              <div className="card p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <FiCheckCircle className="text-primary" size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-text-primary">
                    No tasks yet
                  </h3>
                  <p className="text-text-secondary">
                    Create your first task to get started
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="btn-primary px-6 py-3 inline-flex items-center gap-2"
                >
                  <FiPlus size={18} />
                  Add Your First Task
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card max-w-md w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-display-sm text-text-primary font-bold">
                  Add New Task
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-surface-hover rounded-lg transition-colors"
                >
                  <FiX size={20} className="text-text-secondary" />
                </button>
              </div>

              <form onSubmit={handleAddTodo} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={newTodo.title}
                    onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                    placeholder="Enter task title..."
                    required
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTodo.description}
                    onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                    placeholder="Add details..."
                    rows={3}
                    className="input resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Priority
                    </label>
                    <select
                      value={newTodo.priority}
                      onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value as any })}
                      className="input"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTodo.due_date}
                      onChange={(e) => setNewTodo({ ...newTodo, due_date: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newTodo.category}
                    onChange={(e) => setNewTodo({ ...newTodo, category: e.target.value })}
                    placeholder="e.g., Work, Personal, Shopping..."
                    className="input"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary flex-1 py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary flex-1 py-2.5 disabled:opacity-50"
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : 'Add Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function TodoCard({
  todo,
  onToggle,
  onDelete,
  getPriorityColor,
}: {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (id: string) => void;
  getPriorityColor: (priority: string) => string;
}) {
  return (
    <div
      className={`group flex items-start gap-4 p-4 rounded-lg border transition-all ${
        todo.is_completed
          ? 'bg-background-elevated border-border opacity-60'
          : 'bg-background-card border-border hover:border-primary/50'
      }`}
    >
      <button
        onClick={() => onToggle(todo)}
        className={`flex-shrink-0 mt-1 transition-colors ${
          todo.is_completed ? 'text-success' : 'text-text-muted hover:text-primary'
        }`}
      >
        {todo.is_completed ? <FiCheckCircle size={24} /> : <FiCircle size={24} />}
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={`text-base font-medium mb-1 ${
            todo.is_completed
              ? 'line-through text-text-muted'
              : 'text-text-primary'
          }`}
        >
          {todo.title}
        </h3>
        
        {todo.description && (
          <p className="text-sm text-text-secondary mb-3">
            {todo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <span className={`badge ${getPriorityColor(todo.priority)}`}>
            <FiFlag size={12} />
            <span className="ml-1 capitalize">{todo.priority}</span>
          </span>

          {todo.due_date && (
            <span className="flex items-center gap-1 text-xs text-text-muted">
              <FiClock size={12} />
              {new Date(todo.due_date).toLocaleDateString()}
            </span>
          )}

          {todo.category && (
            <span className="badge bg-background-elevated text-text-secondary">
              {todo.category}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={() => {
          if (confirm('Delete this task?')) {
            onDelete(todo.id);
          }
        }}
        className="flex-shrink-0 p-2 text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-all rounded-lg hover:bg-error/10"
      >
        <FiTrash2 size={18} />
      </button>
    </div>
  );
}
