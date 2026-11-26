'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  FiDownload, 
  FiImage, 
  FiUpload, 
  FiKey, 
  FiCopy, 
  FiRefreshCw,
  FiFileText,
  FiCheckSquare,
  FiDatabase
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ToolsPage() {
  const [selectedExport, setSelectedExport] = useState({ notes: true, todos: true });
  const [selectedImport, setSelectedImport] = useState({ notes: true, todos: true });
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  
  // Random Key Generator state
  const [keyType, setKeyType] = useState<'uuid' | 'base64' | 'hex'>('uuid');
  const [keyLength, setKeyLength] = useState(32);
  const [generatedKey, setGeneratedKey] = useState('');

  // Export data
  const handleExport = async () => {
    if (!selectedExport.notes && !selectedExport.todos) {
      toast.error('Select at least one type to export');
      return;
    }

    setExporting(true);
    try {
      const data: any = { exportDate: new Date().toISOString() };

      if (selectedExport.notes) {
        const res = await fetch('/api/notes?page=1&limit=10000');
        const json = await res.json();
        if (json.success) data.notes = json.notes;
      }

      if (selectedExport.todos) {
        const res = await fetch('/api/todos');
        const json = await res.json();
        if (json.success) data.todos = json.todos;
      }

      // Download as JSON
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `notylist-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Data exported successfully');
    } catch (error) {
      toast.error('Export failed');
    } finally {
      setExporting(false);
    }
  };

  // Import data
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedImport.notes && !selectedImport.todos) {
      toast.error('Select at least one type to import');
      return;
    }

    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      let imported = 0;

      if (selectedImport.notes && data.notes) {
        for (const note of data.notes) {
          await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: note.title,
              content: note.content,
              category: note.category,
              tags: note.tags || [],
            }),
          });
          imported++;
        }
      }

      if (selectedImport.todos && data.todos) {
        for (const todo of data.todos) {
          await fetch('/api/todos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: todo.title,
              description: todo.description,
              priority: todo.priority || 'medium',
              is_completed: false,
            }),
          });
          imported++;
        }
      }

      toast.success(`Imported ${imported} items successfully`);
    } catch (error) {
      toast.error('Import failed - invalid file format');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Random Key Generator
  const generateKey = () => {
    let key = '';
    
    switch (keyType) {
      case 'uuid':
        key = crypto.randomUUID();
        break;
      case 'base64':
        const bytes = new Uint8Array(keyLength);
        crypto.getRandomValues(bytes);
        key = btoa(String.fromCharCode(...bytes))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        break;
      case 'hex':
        const hexBytes = new Uint8Array(keyLength);
        crypto.getRandomValues(hexBytes);
        key = Array.from(hexBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        break;
    }
    
    setGeneratedKey(key);
  };

  const copyKey = () => {
    navigator.clipboard.writeText(generatedKey);
    toast.success('Key copied to clipboard');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Tools</h1>
          <p className="text-text-secondary mt-2">Utility tools for data management and generation</p>
        </div>

        {/* Import/Export Section */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Export Data */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <FiDownload className="text-primary" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Export Data</h3>
                <p className="text-sm text-text-secondary">Download your data as JSON</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedExport.notes}
                  onChange={(e) => setSelectedExport({ ...selectedExport, notes: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <FiFileText size={16} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Notes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedExport.todos}
                  onChange={(e) => setSelectedExport({ ...selectedExport, todos: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <FiCheckSquare size={16} className="text-text-secondary" />
                <span className="text-sm text-text-primary">To-Do Lists</span>
              </label>
            </div>

            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {exporting ? <LoadingSpinner size="sm" /> : <FiDownload size={18} />}
              {exporting ? 'Exporting...' : 'Export Data'}
            </button>
          </div>

          {/* Import Data */}
          <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <FiUpload className="text-success" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Import Data</h3>
                <p className="text-sm text-text-secondary">Upload JSON backup file</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedImport.notes}
                  onChange={(e) => setSelectedImport({ ...selectedImport, notes: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <FiFileText size={16} className="text-text-secondary" />
                <span className="text-sm text-text-primary">Notes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedImport.todos}
                  onChange={(e) => setSelectedImport({ ...selectedImport, todos: e.target.checked })}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                />
                <FiCheckSquare size={16} className="text-text-secondary" />
                <span className="text-sm text-text-primary">To-Do Lists</span>
              </label>
            </div>

            <label className="block">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={importing}
                className="hidden"
                id="import-file"
              />
              <div className="w-full px-4 py-2.5 bg-success hover:bg-success/90 text-white rounded-lg font-medium transition-colors cursor-pointer text-center disabled:opacity-50 flex items-center justify-center gap-2">
                {importing ? <LoadingSpinner size="sm" /> : <FiUpload size={18} />}
                {importing ? 'Importing...' : 'Import Data'}
              </div>
            </label>
          </div>
        </div>

        {/* Random Key Generator */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
              <FiKey className="text-warning" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-text-primary">Random Key Generator</h3>
              <p className="text-sm text-text-secondary">Generate secure random keys and IDs</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Key Type</label>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as any)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="uuid">UUID (v4)</option>
                <option value="base64">Base64 URL-Safe</option>
                <option value="hex">Hexadecimal</option>
              </select>
            </div>

            {keyType !== 'uuid' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">Length (bytes)</label>
                <input
                  type="number"
                  value={keyLength}
                  onChange={(e) => setKeyLength(Number(e.target.value))}
                  min="8"
                  max="128"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            )}

            <div className="sm:col-span-1 flex items-end">
              <button
                onClick={generateKey}
                className="w-full px-4 py-2 bg-warning hover:bg-warning/90 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <FiRefreshCw size={18} />
                Generate
              </button>
            </div>
          </div>

          {generatedKey && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-primary">Generated Key</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedKey}
                  readOnly
                  className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-text-primary font-mono text-sm"
                />
                <button
                  onClick={copyKey}
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <FiCopy size={16} />
                  Copy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Other Tools Links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <a
            href="/dashboard/qr-generator"
            className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FiImage className="text-primary" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">QR Generator</h4>
                <p className="text-sm text-text-secondary">Create QR codes</p>
              </div>
            </div>
          </a>

          <a
            href="/dashboard/tools"
            className="bg-surface border border-border rounded-xl p-6 hover:border-primary transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FiDatabase className="text-primary" size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary">More Tools</h4>
                <p className="text-sm text-text-secondary">Coming soon...</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
