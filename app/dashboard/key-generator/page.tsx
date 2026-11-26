'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FiKey, FiCopy, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function KeyGeneratorPage() {
  const [keyType, setKeyType] = useState<'uuid' | 'base64' | 'hex'>('uuid');
  const [keyLength, setKeyLength] = useState(32);
  const [generatedKey, setGeneratedKey] = useState('');

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
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Random Key Generator</h1>
          <p className="text-text-secondary mt-2">Generate secure random keys and IDs for your projects</p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-8 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-xl bg-warning/10 flex items-center justify-center">
              <FiKey className="text-warning" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Generate Keys</h3>
              <p className="text-sm text-text-secondary">Cryptographically secure random keys</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-3">Key Type</label>
              <select
                value={keyType}
                onChange={(e) => setKeyType(e.target.value as any)}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              >
                <option value="uuid">UUID v4</option>
                <option value="base64">Base64 URL-Safe</option>
                <option value="hex">Hexadecimal</option>
              </select>
              <p className="text-xs text-text-muted mt-2">
                {keyType === 'uuid' && 'Standard universally unique identifier'}
                {keyType === 'base64' && 'URL-safe base64 encoded string'}
                {keyType === 'hex' && 'Hexadecimal string (0-9, a-f)'}
              </p>
            </div>

            {keyType !== 'uuid' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">Length (bytes)</label>
                <input
                  type="number"
                  value={keyLength}
                  onChange={(e) => setKeyLength(Number(e.target.value))}
                  min="8"
                  max="128"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <p className="text-xs text-text-muted mt-2">
                  Output length: {keyType === 'base64' ? Math.ceil(keyLength * 4 / 3) : keyLength * 2} characters
                </p>
              </div>
            )}
          </div>

          <button
            onClick={generateKey}
            className="w-full px-6 py-4 bg-warning hover:bg-warning/90 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-3 text-lg active:scale-95"
          >
            <FiRefreshCw size={22} />
            Generate New Key
          </button>

          {generatedKey && (
            <div className="space-y-3 pt-4 border-t border-border">
              <label className="block text-sm font-medium text-text-primary">Generated Key</label>
              <div className="relative">
                <textarea
                  value={generatedKey}
                  readOnly
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-text-primary font-mono text-sm resize-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  onClick={copyKey}
                  className="absolute top-3 right-3 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all flex items-center gap-2"
                >
                  <FiCopy size={16} />
                  Copy
                </button>
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Length: {generatedKey.length} characters</span>
                <span>Type: {keyType.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-primary font-semibold text-sm mb-1">UUID v4</div>
            <div className="text-text-muted text-xs">128-bit unique identifier, universally recognized</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-primary font-semibold text-sm mb-1">Base64</div>
            <div className="text-text-muted text-xs">URL-safe encoding, compact representation</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4">
            <div className="text-primary font-semibold text-sm mb-1">Hexadecimal</div>
            <div className="text-text-muted text-xs">Lowercase hex string, easy to read</div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h4 className="font-semibold text-text-primary mb-3">Common Use Cases</h4>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>API Keys:</strong> Generate secure keys for API authentication</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Session Tokens:</strong> Create unique session identifiers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Database IDs:</strong> Generate unique record identifiers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span><strong>Passwords:</strong> Create temporary secure passwords</span>
            </li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}
