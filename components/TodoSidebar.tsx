'use client';

import { useState, useEffect } from 'react';
import {
  FiCheckCircle,
  FiCircle,
  FiPlus,
  FiTrash2,
  FiEdit2,
  FiX,
  FiClock,
  FiFlag,
  FiCalendar,
  FiFilter,
  FiChevronDown,
  FiChevronRight,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

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

export default function TodoSidebar() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [showCompleted, setShowCompleted] = useState(false);
  const [editingTodo, setEditingTodo] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [filter]);

  const fetchTodos = async () => {
    try {
      const response = await fetch(`/api/todos?filter=${filter}`);
      const data = await response.json();

      if (data.success) {
        setTodos(data.todos);
      } else {
        toast.error('Failed to load todos');
      }
    } catch (error) {
      toast.error('Failed to load todos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTodoTitle.trim()) {
      return;
    }

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTodoTitle,
          priority: 'medium',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTodos([data.todo, ...todos]);
        setNewTodoTitle('');
        toast.success('Todo added');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to add todo');
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
        toast.success(todo.is_completed ? 'Todo uncompleted' : 'Todo completed');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  const handleUpdateTodo = async (todoId: string) => {
    if (!editTitle.trim()) {
      setEditingTodo(null);
      return;
    }

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setTodos(todos.map((t) => (t.id === todoId ? { ...t, title: editTitle } : t)));
        setEditingTodo(null);
        toast.success('Todo updated');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to update todo');
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    if (!confirm('Delete this todo?')) {
      return;
    }

    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setTodos(todos.filter((t) => t.id !== todoId));
        toast.success('Todo deleted');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Failed to delete todo');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const activeTodos = todos.filter((t) => !t.is_completed);
  const completedTodos = todos.filter((t) => t.is_completed);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FiCheckCircle className="mr-2 text-indigo-600" size={20} />
          To-Do List
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {activeTodos.length} active, {completedTodos.length} completed
        </p>
      </div>

      {/* Add Todo Form */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <form onSubmit={handleAddTodo} className="flex items-center space-x-2">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={!newTodoTitle.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiPlus size={18} />
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-1">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Todos List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Active Todos */}
            {activeTodos.length > 0 && (
              <div className="space-y-2">
                {activeTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    editingTodo={editingTodo}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    setEditingTodo={setEditingTodo}
                    handleToggleComplete={handleToggleComplete}
                    handleUpdateTodo={handleUpdateTodo}
                    handleDeleteTodo={handleDeleteTodo}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
              </div>
            )}

            {/* Completed Todos */}
            {completedTodos.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="flex items-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-3 w-full"
                >
                  {showCompleted ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                  <span>Completed ({completedTodos.length})</span>
                </button>

                {showCompleted && (
                  <div className="space-y-2 opacity-60">
                    {completedTodos.map((todo) => (
                      <TodoItem
                        key={todo.id}
                        todo={todo}
                        editingTodo={editingTodo}
                        editTitle={editTitle}
                        setEditTitle={setEditTitle}
                        setEditingTodo={setEditingTodo}
                        handleToggleComplete={handleToggleComplete}
                        handleUpdateTodo={handleUpdateTodo}
                        handleDeleteTodo={handleDeleteTodo}
                        getPriorityColor={getPriorityColor}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {todos.length === 0 && (
              <div className="text-center py-12">
                <FiCheckCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No tasks yet. Add one above!
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TodoItem({
  todo,
  editingTodo,
  editTitle,
  setEditTitle,
  setEditingTodo,
  handleToggleComplete,
  handleUpdateTodo,
  handleDeleteTodo,
  getPriorityColor,
}: {
  todo: Todo;
  editingTodo: string | null;
  editTitle: string;
  setEditTitle: (value: string) => void;
  setEditingTodo: (id: string | null) => void;
  handleToggleComplete: (todo: Todo) => void;
  handleUpdateTodo: (id: string) => void;
  handleDeleteTodo: (id: string) => void;
  getPriorityColor: (priority: string) => string;
}) {
  const isEditing = editingTodo === todo.id;

  return (
    <div
      className={`group flex items-start space-x-3 p-3 rounded-lg border ${
        todo.is_completed
          ? 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
      } transition-all`}
    >
      {/* Checkbox */}
      <button
        onClick={() => handleToggleComplete(todo)}
        className={`flex-shrink-0 mt-0.5 ${
          todo.is_completed ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'
        }`}
      >
        {todo.is_completed ? <FiCheckCircle size={20} /> : <FiCircle size={20} />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => handleUpdateTodo(todo.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleUpdateTodo(todo.id);
              if (e.key === 'Escape') setEditingTodo(null);
            }}
            autoFocus
            className="w-full px-2 py-1 text-sm border border-indigo-300 rounded focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        ) : (
          <>
            <p
              className={`text-sm font-medium ${
                todo.is_completed
                  ? 'line-through text-gray-500 dark:text-gray-500'
                  : 'text-gray-900 dark:text-white'
              }`}
            >
              {todo.title}
            </p>
            {todo.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {todo.description}
              </p>
            )}
            <div className="flex items-center space-x-3 mt-2">
              <span className={`flex items-center text-xs ${getPriorityColor(todo.priority)}`}>
                <FiFlag size={12} className="mr-1" />
                {todo.priority}
              </span>
              {todo.due_date && (
                <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <FiClock size={12} className="mr-1" />
                  {new Date(todo.due_date).toLocaleDateString()}
                </span>
              )}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      {!isEditing && (
        <div className="flex-shrink-0 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => {
              setEditingTodo(todo.id);
              setEditTitle(todo.title);
            }}
            className="p-1.5 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
          >
            <FiEdit2 size={14} />
          </button>
          <button
            onClick={() => handleDeleteTodo(todo.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
          >
            <FiTrash2 size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
