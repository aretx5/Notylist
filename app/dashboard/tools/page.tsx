'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  FiDownload,
  FiImage,
  FiLoader,
  FiCheck,
  FiAlertCircle,
  FiExternalLink,
} from 'react-icons/fi';
import { SiInstagram, SiPinterest } from 'react-icons/si';
import toast from 'react-hot-toast';

type ToolTab = 'instagram' | 'pinterest';

export default function ToolsPage() {
  const [activeTab, setActiveTab] = useState<ToolTab>('instagram');

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Download Tools
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Download videos and images from Instagram and Pinterest
          </p>
        </div>

        {/* Tool Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('instagram')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'instagram'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <SiInstagram size={20} />
              <span>Instagram</span>
            </button>
            <button
              onClick={() => setActiveTab('pinterest')}
              className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                activeTab === 'pinterest'
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <SiPinterest size={20} />
              <span>Pinterest</span>
            </button>
          </div>
        </div>

        {/* Tool Content */}
        {activeTab === 'instagram' && <InstagramDownloader />}
        {activeTab === 'pinterest' && <PinterestDownloader />}
      </div>
    </DashboardLayout>
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

    // More flexible URL validation
    const instagramPattern = /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i;
    if (!instagramPattern.test(url)) {
      toast.error('Please enter a valid Instagram post/reel URL');
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
        // Show fallback instructions
        if (data.instructions) {
          setResult({ fallback: true, instructions: data.instructions });
        }
        toast.error(data.message || 'Failed to fetch media');
      }
    } catch (error) {
      toast.error('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Instagram Post or Reel URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/p/... or /reel/..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Supports posts, reels, and IGTV videos
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={20} />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <FiDownload size={20} />
                <span>Get Download Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && !result.fallback && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiCheck className="text-green-600 dark:text-green-400" size={24} />
            <span className="text-lg font-semibold text-green-900 dark:text-green-100">
              Ready to Download
            </span>
          </div>
          
          {result.thumbnail && (
            <img
              src={result.thumbnail}
              alt="Preview"
              className="w-full rounded-lg mb-4 max-h-96 object-cover"
            />
          )}

          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Type:</span>
              <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded">
                {result.type === 'image' ? 'Image' : 'Video'}
              </span>
            </div>
            
            <a
              href={result.url}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <FiDownload size={20} />
              <span>Download {result.type === 'image' ? 'Image' : 'Video'}</span>
            </a>
          </div>
        </div>
      )}

      {/* Fallback Instructions */}
      {result && result.fallback && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start space-x-3 mb-4">
            <FiAlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Alternative Download Methods
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                Try these methods to download Instagram content:
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {Object.entries(result.instructions).map(([key, value]) => (
              <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1 capitalize">
                  {key.replace('method', 'Method ')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{value as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How to Use */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How to Use
        </h3>
        <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Open Instagram and find the post or reel you want to download</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Click the three dots (•••) and select "Copy link"</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Paste the link in the input field above</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <span>Click "Get Download Link" and wait for the result</span>
          </li>
        </ol>
      </div>
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

    // Support both pinterest.com and pin.it short URLs
    const pinterestPattern = /(?:https?:\/\/)?(?:www\.)?(?:pinterest\.com\/pin\/(\d+)|pin\.it\/([A-Za-z0-9]+))/i;
    if (!pinterestPattern.test(url)) {
      toast.error('Please enter a valid Pinterest URL (pinterest.com/pin/... or pin.it/...)');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // If it's a pin.it URL, we need to expand it first or pass it as-is
      let processedUrl = url;
      
      // Ensure the URL has a protocol
      if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
        processedUrl = 'https://' + processedUrl;
      }

      const response = await fetch('/api/tools/pinterest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: processedUrl }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.media);
        toast.success('Media fetched successfully!');
      } else {
        // Show fallback instructions
        if (data.instructions) {
          setResult({ fallback: true, instructions: data.instructions });
        }
        toast.error(data.message || 'Failed to fetch media');
      }
    } catch (error) {
      toast.error('Failed to fetch media');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pinterest Pin URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.pinterest.com/pin/..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Paste any Pinterest pin URL with video content
            </p>
          </div>

          <button
            onClick={handleDownload}
            disabled={loading || !url.trim()}
            className="w-full flex items-center justify-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin" size={20} />
                <span>Fetching...</span>
              </>
            ) : (
              <>
                <FiDownload size={20} />
                <span>Get Download Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result */}
      {result && !result.fallback && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FiCheck className="text-green-600 dark:text-green-400" size={24} />
            <span className="text-lg font-semibold text-green-900 dark:text-green-100">
              Ready to Download
            </span>
          </div>
          
          {result.thumbnail && (
            <img
              src={result.thumbnail}
              alt="Preview"
              className="w-full rounded-lg mb-4 max-h-96 object-cover"
            />
          )}

          <a
            href={result.url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            <FiDownload size={20} />
            <span>Download Video</span>
          </a>
        </div>
      )}

      {/* Fallback Instructions */}
      {result && result.fallback && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
          <div className="flex items-start space-x-3 mb-4">
            <FiAlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Alternative Download Methods
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
                Try these methods to download Pinterest content:
              </p>
            </div>
          </div>
          
          <div className="space-y-3">
            {Object.entries(result.instructions).map(([key, value]) => (
              <div key={key} className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-1 capitalize">
                  {key.replace('method', 'Method ')}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{value as string}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How to Use */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          How to Use
        </h3>
        <ol className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Open Pinterest and find the pin you want to download</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Click on the pin to open it in full view</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Copy the URL from your browser's address bar</span>
          </li>
          <li className="flex items-start space-x-3">
            <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <span>Paste the link in the input field above and click "Get Download Link"</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
