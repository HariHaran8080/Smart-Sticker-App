import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, Link as LinkIcon, ArrowRight, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { imageService } from '../services/image.service';
import { useToast } from '../context/ToastContext';
import { getAssetUrl } from '../services/api';

// Curated public sample images for quick testing
const SAMPLES = [
  {
    name: 'Happy Dog',
    url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Curious Cat',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80',
  },
  {
    name: 'Panda Reaction',
    url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?auto=format&fit=crop&w=500&q=80',
  },
];

export const CreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { error } = useToast();

  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [previewData, setPreviewData] = useState<{
    url: string;
    width: number;
    height: number;
    format: string;
    size: number;
  } | null>(null);

  // File dropzone handler
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    onDrop: async (acceptedFiles, fileRejections) => {
      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        error(rejection.errors[0]?.message || 'File upload rejected');
        return;
      }
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setLoading(true);
      setLoadingMessage('Uploading and processing image...');

      try {
        const res = await imageService.uploadImage(file);
        setPreviewData(res);
      } catch (err: any) {
        error(err.response?.data?.message || 'Failed to upload image. Please try another.');
      } finally {
        setLoading(false);
      }
    },
  });

  // URL fetch handler
  const handleFetchUrl = async (targetUrl?: string) => {
    const urlToFetch = targetUrl || urlInput.trim();
    if (!urlToFetch) {
      error('Please enter an image URL');
      return;
    }

    setLoading(true);
    setLoadingMessage('Safely fetching image from URL...');

    try {
      const res = await imageService.fetchFromUrl(urlToFetch);
      setPreviewData(res);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to fetch image from URL. Ensure the URL is public and ends with an image format.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToEditor = () => {
    if (!previewData) return;
    navigate('/editor', {
      state: {
        originalUrl: previewData.url,
        width: previewData.width,
        height: previewData.height,
        format: previewData.format,
      },
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
          Create a New Sticker
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          Upload an image from your device or paste a public web link.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Selection */}
        <div className="md:col-span-7 bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-zinc-200 mb-6">
            <button
              onClick={() => setActiveTab('upload')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors mr-6 ${
                activeTab === 'upload'
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-600 hover:text-zinc-800'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Upload Image</span>
            </button>
            <button
              onClick={() => setActiveTab('url')}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === 'url'
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-600 hover:text-zinc-800'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>Image URL</span>
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-brand-500 bg-brand-50/50'
                    : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50/50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-white shadow-sm border border-zinc-200 flex items-center justify-center mx-auto mb-3 text-zinc-600">
                  <Upload className="w-5 h-5 text-zinc-700" />
                </div>
                <p className="text-sm font-semibold text-zinc-800">
                  {isDragActive ? 'Drop your image here' : 'Click to upload or drag & drop'}
                </p>
                <p className="text-xs text-zinc-600 mt-1">
                  Supports PNG, JPG, JPEG, WEBP, GIF (up to 10MB)
                </p>
              </div>
            </div>
          )}

          {/* URL Tab */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label htmlFor="image-url-input" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                  Direct Image URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="image-url-input"
                    type="url"
                    placeholder="https://example.com/image.png"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={loading}
                    className="w-full sm:flex-1 px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  />
                  <button
                    onClick={() => handleFetchUrl()}
                    disabled={loading || !urlInput.trim()}
                    className="w-full sm:w-auto px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shrink-0"
                  >
                    Fetch
                  </button>
                </div>
                <p className="text-xs text-zinc-600 mt-2 flex items-start gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>For best results, provide a direct URL ending in .png, .jpg, or .webp.</span>
                </p>
              </div>

              {/* Sample Images */}
              <div className="pt-4 border-t border-zinc-100">
                <p className="text-xs font-semibold text-zinc-600 mb-2">Or test with a sample image:</p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLES.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => {
                        setUrlInput(s.url);
                        handleFetchUrl(s.url);
                      }}
                      className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-md transition-colors"
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading status */}
          {loading && (
            <div className="mt-6 p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-brand-600 animate-spin shrink-0" />
              <p className="text-sm font-medium text-zinc-800">{loadingMessage}</p>
            </div>
          )}
        </div>

        {/* Right Column: Preview & Action */}
        <div className="md:col-span-5 bg-white rounded-xl border border-zinc-200 p-6 shadow-sm flex flex-col items-center justify-center min-h-[350px]">
          {previewData ? (
            <div className="w-full flex flex-col items-center">
              <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-3 self-start">
                Image Preview
              </div>

              <div className="w-full aspect-square max-w-[260px] rounded-lg bg-checkerboard border border-zinc-200 flex items-center justify-center p-2 overflow-hidden shadow-inner mb-4">
                <img
                  src={getAssetUrl(previewData.url)}
                  alt="Upload preview"
                  className="max-h-full max-w-full object-contain rounded"
                />
              </div>

              <div className="w-full text-xs text-zinc-600 space-y-1 mb-6 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                <div className="flex justify-between">
                  <span>Dimensions:</span>
                  <span className="font-mono font-medium text-zinc-800">
                    {previewData.width} × {previewData.height} px
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-mono font-medium text-zinc-800 uppercase">
                    {previewData.format}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>File size:</span>
                  <span className="font-mono font-medium text-zinc-800">
                    {(previewData.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              <button
                onClick={handleContinueToEditor}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-sm transition-all hover:gap-3"
              >
                <span>Continue to Editor</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="text-center p-6 text-zinc-600">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3 text-zinc-600">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-600">No image loaded yet</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-[200px] mx-auto">
                Upload a file or paste a URL on the left to preview it here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
