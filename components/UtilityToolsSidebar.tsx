'use client';

import { useState } from 'react';
import {
  FiDownload,
  FiImage,
  FiX,
  FiLoader,
  FiAlertCircle,
  FiCheck,
} from 'react-icons/fi';
import { SiInstagram, SiPinterest } from 'react-icons/si';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';

type ToolTab = 'instagram' | 'pinterest' | 'qr';

export default function UtilityToolsSidebar() {
  const [activeTab, setActiveTab] = useState<ToolTab>('instagram');

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <FiDownload className="mr-2 text-indigo-600" size={20} />
          Utility Tools
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Download & generate tools
        </p>
      </div>

      {/* Tool Tabs */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'instagram'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <SiInstagram size={14} />
            <span>Instagram</span>
          </button>
          <button
            onClick={() => setActiveTab('pinterest')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'pinterest'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <SiPinterest size={14} />
            <span>Pinterest</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'qr'
                ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FiImage size={14} />
            <span>QR Code</span>
          </button>
        </div>
      </div>

      {/* Tool Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'instagram' && <InstagramDownloader />}
        {activeTab === 'pinterest' && <PinterestDownloader />}
        {activeTab === 'qr' && <QRCodeGenerator />}
      </div>
    </div>
  );
}

function InstagramDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDownload = async () => {
    if (!url.trim()) {
      toast.error('Please enter an Instagram URL');
      return;
    }

    if (!url.includes('instagram.com')) {
      toast.error('Please enter a valid Instagram URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/tools/instagram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.media);
        toast.success('Media fetched successfully!');
      } else {
        toast.error(data.message || 'Failed to fetch media');
      }
    } catch (error) {
      toast.error('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Instagram Post or Reel URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.instagram.com/p/..."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Supports posts, reels, and IGTV videos
        </p>
      </div>

      <button
        onClick={handleDownload}
        disabled={loading || !url.trim()}
        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <FiLoader className="animate-spin" size={18} />
            <span>Fetching...</span>
          </>
        ) : (
          <>
            <FiDownload size={18} />
            <span>Get Download Link</span>
          </>
        )}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <FiCheck className="text-green-600 dark:text-green-400" size={18} />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Ready to Download
            </span>
          </div>
          
          {result.thumbnail && (
            <img
              src={result.thumbnail}
              alt="Preview"
              className="w-full rounded-lg mb-3"
            />
          )}

          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Type: {result.type || 'Video'}
            </p>
            <a
              href={result.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
            >
              Download {result.type === 'image' ? 'Image' : 'Video'}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function PinterestDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDownload = async () => {
    if (!url.trim()) {
      toast.error('Please enter a Pinterest URL');
      return;
    }

    if (!url.includes('pinterest.com')) {
      toast.error('Please enter a valid Pinterest URL');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/tools/pinterest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.media);
        toast.success('Media fetched successfully!');
      } else {
        toast.error(data.message || 'Failed to fetch media');
      }
    } catch (error) {
      toast.error('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Pinterest Video URL
        </label>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.pinterest.com/pin/..."
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Paste any Pinterest pin URL
        </p>
      </div>

      <button
        onClick={handleDownload}
        disabled={loading || !url.trim()}
        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <FiLoader className="animate-spin" size={18} />
            <span>Fetching...</span>
          </>
        ) : (
          <>
            <FiDownload size={18} />
            <span>Get Download Link</span>
          </>
        )}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <FiCheck className="text-green-600 dark:text-green-400" size={18} />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Ready to Download
            </span>
          </div>
          
          {result.thumbnail && (
            <img
              src={result.thumbnail}
              alt="Preview"
              className="w-full rounded-lg mb-3"
            />
          )}

          <a
            href={result.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            Download Video
          </a>
        </div>
      )}
    </div>
  );
}

function QRCodeGenerator() {
  const [text, setText] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);

  const generateQR = async () => {
    if (!text.trim()) {
      toast.error('Please enter text or URL');
      return;
    }

    setLoading(true);

    try {
      const qrDataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      setQrCode(qrDataUrl);
      toast.success('QR Code generated!');
    } catch (error) {
      toast.error('Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCode;
    link.click();
    toast.success('QR Code downloaded!');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Text or URL
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text, URL, or any data..."
          rows={4}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Website URL, contact info, WiFi credentials, etc.
        </p>
      </div>

      <button
        onClick={generateQR}
        disabled={loading || !text.trim()}
        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <FiLoader className="animate-spin" size={18} />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <FiImage size={18} />
            <span>Generate QR Code</span>
          </>
        )}
      </button>

      {qrCode && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex justify-center mb-4">
            <img src={qrCode} alt="QR Code" className="w-64 h-64 rounded-lg" />
          </div>
          
          <button
            onClick={downloadQR}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <FiDownload size={16} />
            <span>Download QR Code</span>
          </button>
        </div>
      )}
    </div>
  );
}
