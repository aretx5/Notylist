'use client';

import { useState, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FiDownload, FiCopy, FiCheck, FiZap, FiUpload, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import LoadingSpinner from '@/components/LoadingSpinner';

const PRESETS = [
  { label: 'URL',      value: 'https://example.com' },
  { label: 'Email',   value: 'mailto:you@email.com' },
  { label: 'Phone',   value: 'tel:+1234567890' },
  { label: 'WiFi',    value: 'WIFI:T:WPA;S:MyNetwork;P:password;;' },
  { label: 'WhatsApp',value: 'https://wa.me/1234567890' },
];

const THEMES = [
  { name: 'Classic',  dark: '#000000', light: '#ffffff' },
  { name: 'Indigo',   dark: '#6655F5', light: '#ffffff' },
  { name: 'Ocean',    dark: '#0ea5e9', light: '#f0f9ff' },
  { name: 'Forest',   dark: '#059669', light: '#f0fdf4' },
  { name: 'Rose',     dark: '#f43f5e', light: '#fff1f2' },
  { name: 'Amber',    dark: '#d97706', light: '#fffbeb' },
  { name: 'Dark',     dark: '#e2e8f0', light: '#0f172a' },
  { name: 'Violet',   dark: '#7c3aed', light: '#faf5ff' },
];

const FRAMES = [
  { id: 'none',   label: 'None' },
  { id: 'square', label: 'Square' },
  { id: 'round',  label: 'Rounded' },
  { id: 'shadow', label: 'Shadow' },
];

export default function QRGeneratorPage() {
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [themeIdx, setThemeIdx] = useState(0);
  const [size, setSize] = useState(300);
  const [frame, setFrame] = useState('round');
  const [centerImage, setCenterImage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generate = async () => {
    if (!text.trim()) { toast.error('Enter some text first'); return; }
    setLoading(true);
    try {
      const t = THEMES[themeIdx];
      const qrSize = Math.max(size, 400); // generate at high res

      const url = await QRCode.toDataURL(text.trim(), {
        width: qrSize,
        margin: 2,
        color: { dark: t.dark, light: t.light },
        errorCorrectionLevel: 'H', // H needed for center image overlay
      });

      if (centerImage) {
        // Composite center logo onto QR
        const composed = await composeWithLogo(url, centerImage, qrSize);
        setQrCode(composed);
      } else {
        setQrCode(url);
      }
      toast.success('QR code ready!');
    } catch {
      toast.error('Failed to generate');
    } finally {
      setLoading(false);
    }
  };

  const composeWithLogo = (qrDataUrl: string, logoDataUrl: string, qrSize: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = qrSize;
      canvas.height = qrSize;
      const ctx = canvas.getContext('2d')!;

      const qrImg = new Image();
      qrImg.onload = () => {
        ctx.drawImage(qrImg, 0, 0, qrSize, qrSize);
        const logoImg = new Image();
        logoImg.onload = () => {
          const logoSize = qrSize * 0.22;
          const x = (qrSize - logoSize) / 2;
          const y = (qrSize - logoSize) / 2;
          // White background circle behind logo
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(x - 6, y - 6, logoSize + 12, logoSize + 12, 8);
          ctx.fill();
          ctx.drawImage(logoImg, x, y, logoSize, logoSize);
          resolve(canvas.toDataURL('image/png'));
        };
        logoImg.src = logoDataUrl;
      };
      qrImg.src = qrDataUrl;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setCenterImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const download = () => {
    const a = document.createElement('a');
    a.download = 'qrcode.png';
    a.href = qrCode;
    a.click();
    toast.success('Downloaded!');
  };

  const copy = async () => {
    try {
      const res = await fetch(qrCode);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setCopied(true);
      toast.success('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy not supported in this browser');
    }
  };

  const frameClass = (f: string, hasQr: boolean) => {
    const base = 'overflow-hidden transition-all';
    if (!hasQr) return base;
    if (f === 'square') return `${base} rounded-none`;
    if (f === 'round')  return `${base} rounded-2xl`;
    if (f === 'shadow') return `${base} rounded-2xl shadow-2xl shadow-primary-500/30`;
    return base;
  };

  const displaySize = Math.min(size, 260);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-text-primary">QR Generator</h1>
          <p className="text-sm text-text-secondary mt-0.5">Generate, style, and download QR codes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* ── Left panel ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Input */}
            <div className="card p-4 space-y-3">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Content</label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="URL, text, WiFi credentials…"
                rows={3}
                className="input w-full resize-none text-sm"
              />
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => setText(p.value)}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-text-secondary hover:text-text-primary border border-white/10 transition-colors">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="card p-4 space-y-3">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Color Theme</label>
              <div className="grid grid-cols-8 gap-2">
                {THEMES.map((t, i) => (
                  <button key={t.name} onClick={() => setThemeIdx(i)} title={t.name}
                    className={`h-9 rounded-lg border-2 transition-all ${themeIdx === i ? 'border-primary-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105 hover:border-white/20'}`}
                    style={{ background: `linear-gradient(135deg, ${t.dark} 50%, ${t.light} 50%)` }}
                  />
                ))}
              </div>
              <p className="text-xs text-text-muted">{THEMES[themeIdx].name}</p>
            </div>

            {/* Frame + Size */}
            <div className="card p-4 space-y-4">
              {/* Frame */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Frame</label>
                <div className="grid grid-cols-4 gap-2">
                  {FRAMES.map(f => (
                    <button key={f.id} onClick={() => setFrame(f.id)}
                      className={`py-2 text-xs font-medium rounded-lg border transition-colors ${
                        frame === f.id ? 'border-primary-500 bg-primary/10 text-primary-400' : 'border-border text-text-secondary hover:border-primary/40'
                      }`}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Size — {size}px</label>
                <input type="range" min={200} max={600} step={50} value={size}
                  onChange={e => setSize(+e.target.value)}
                  className="w-full accent-primary-500 h-1.5" />
              </div>

              {/* Center image */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Center Logo</label>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                {centerImage ? (
                  <div className="flex items-center gap-3">
                    <img src={centerImage} alt="logo" className="w-10 h-10 rounded-lg object-cover border border-border" />
                    <span className="text-xs text-text-secondary flex-1">Logo selected</span>
                    <button onClick={() => { setCenterImage(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="p-1.5 hover:bg-white/10 rounded-lg text-text-muted hover:text-text-primary transition-colors">
                      <FiX size={14} />
                    </button>
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 text-sm text-text-secondary border border-dashed border-border hover:border-primary/50 hover:text-text-primary rounded-xl py-3 transition-colors">
                    <FiUpload size={15} /> Upload image
                  </button>
                )}
              </div>
            </div>

            {/* Generate */}
            <button onClick={generate} disabled={loading || !text.trim()} className="btn-primary w-full">
              {loading ? <LoadingSpinner size="sm" /> : <FiZap size={16} />}
              {loading ? 'Generating…' : 'Generate QR Code'}
            </button>
          </div>

          {/* ── Right panel: Preview ── */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="card p-5 flex-1 flex flex-col items-center justify-center gap-4 min-h-64">
              {qrCode ? (
                <>
                  <div className={frameClass(frame, true)}>
                    <img src={qrCode} alt="QR Code"
                      style={{ width: displaySize, height: displaySize }}
                      className="block"
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <button onClick={download} className="btn-primary flex-1 text-sm py-2.5">
                      <FiDownload size={15} /> Download
                    </button>
                    <button onClick={copy} className="btn-secondary flex-1 text-sm py-2.5">
                      {copied ? <FiCheck size={15} /> : <FiCopy size={15} />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-2 py-8">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-dashed border-border flex items-center justify-center mx-auto">
                    <span className="text-2xl opacity-30">▦</span>
                  </div>
                  <p className="text-sm font-medium text-text-secondary">Preview</p>
                  <p className="text-xs text-text-muted">Your QR code appears here</p>
                </div>
              )}
            </div>

            {/* Theme preview badge */}
            {qrCode && (
              <div className="card p-3 flex items-center gap-2 text-xs text-text-secondary">
                <div className="w-5 h-5 rounded"
                  style={{ background: `linear-gradient(135deg, ${THEMES[themeIdx].dark} 50%, ${THEMES[themeIdx].light} 50%)` }} />
                <span>{THEMES[themeIdx].name} · {frame} frame · {size}px</span>
              </div>
            )}
          </div>

        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </DashboardLayout>
  );
}
