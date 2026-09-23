import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Plus, Download, Trash2, Loader2, ArrowRight, X } from 'lucide-react';
import { StickerPack } from '../types';
import { packService } from '../services/pack.service';
import { useToast } from '../context/ToastContext';
import { getAssetUrl } from '../services/api';

export const PacksPage: React.FC = () => {
  const { success, error } = useToast();

  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [loading, setLoading] = useState(true);

  // Create pack modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPackName, setNewPackName] = useState('');
  const [newPackDesc, setNewPackDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const data = await packService.getPacks();
      setPacks(data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load sticker packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPacks();
  }, []);

  const handleCreatePack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPackName.trim()) return;

    setIsCreating(true);
    try {
      await packService.createPack({
        name: newPackName.trim(),
        description: newPackDesc.trim(),
      });
      success('Sticker pack created successfully');
      setNewPackName('');
      setNewPackDesc('');
      setIsModalOpen(false);
      loadPacks();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create pack');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePack = async (id: string, name: string) => {
    if (!window.confirm(`Delete sticker pack "${name}"?`)) return;
    try {
      await packService.deletePack(id);
      setPacks((prev) => prev.filter((p) => p._id !== id));
      success('Pack deleted');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete pack');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Sticker Packs & Collections
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Group your stickers into theme packs and download entire collections as a single ZIP.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Pack</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
          <p className="text-sm text-zinc-600">Loading sticker packs...</p>
        </div>
      ) : packs.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <Layers className="w-6 h-6 text-zinc-600" />
          </div>
          <h2 className="text-base font-bold text-zinc-900">No sticker packs yet</h2>
          <p className="text-xs text-zinc-600 mt-1 mb-6">
            Create collections like "Memes", "Work Reactions", or "Friends" to organize and download in bulk.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Pack</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {packs.map((pack) => {
            const hasStickers = pack.stickers && pack.stickers.length > 0;
            return (
              <div
                key={pack._id}
                className="bg-white rounded-xl border border-zinc-200 p-5 shadow-sm hover:border-zinc-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900 leading-snug">
                        {pack.name}
                      </h2>
                      <p className="text-xs text-zinc-600 mt-0.5 line-clamp-2">
                        {pack.description || 'No description provided'}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeletePack(pack._id, pack.name)}
                      className="text-zinc-600 hover:text-red-600 p-1 rounded transition-colors"
                      title="Delete pack"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Preview Thumbnails Grid */}
                  <div className="mt-4 aspect-video bg-zinc-50 border border-zinc-200 rounded-lg p-2.5 flex items-center justify-center overflow-hidden">
                    {hasStickers ? (
                      <div className="grid grid-cols-4 gap-1.5 w-full h-full items-center justify-items-center">
                        {pack.stickers.slice(0, 8).map((sticker) => (
                          <div
                            key={sticker._id}
                            className="w-10 h-10 rounded bg-checkerboard border border-zinc-200 p-0.5 flex items-center justify-center"
                          >
                            <img
                              src={getAssetUrl(sticker.stickerImage)}
                              alt={sticker.name}
                              className="max-w-full max-h-full object-contain"
                              loading="lazy"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-zinc-600">
                        <p className="font-medium">Pack is empty</p>
                        <p className="text-[11px] text-zinc-600 mt-0.5">Add stickers from My Stickers</p>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-zinc-600 font-medium mt-3">
                    {pack.stickers.length} {pack.stickers.length === 1 ? 'sticker' : 'stickers'}
                  </div>
                </div>

                {/* Pack Actions */}
                <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/packs/${pack._id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 hover:text-zinc-900 transition-colors"
                  >
                    <span>View Pack</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {hasStickers && (
                    <a
                      href={packService.getPackDownloadUrl(pack._id)}
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download ZIP</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Pack Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <h2 className="text-base font-bold text-zinc-900">Create Sticker Pack</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-600 hover:text-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePack} className="space-y-4">
              <div>
                <label htmlFor="pack-name-input" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Pack Name
                </label>
                <input
                  id="pack-name-input"
                  type="text"
                  required
                  placeholder="e.g. Funny Friends, Reaction Pack"
                  value={newPackName}
                  onChange={(e) => setNewPackName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label htmlFor="pack-description-input" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="pack-description-input"
                  rows={3}
                  placeholder="Short description of this sticker pack"
                  value={newPackDesc}
                  onChange={(e) => setNewPackDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newPackName.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {isCreating ? 'Creating...' : 'Create Pack'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
