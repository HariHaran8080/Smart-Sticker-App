import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Download,
  Trash2,
  FolderPlus,
  Loader2,
  Image as ImageIcon,
  Layers,
  X,
} from 'lucide-react';
import { Sticker, StickerPack } from '../types';
import { stickerService } from '../services/sticker.service';
import { packService } from '../services/pack.service';
import { useToast } from '../context/ToastContext';
import { getAssetUrl } from '../services/api';

export const MyStickersPage: React.FC = () => {
  const { success, error } = useToast();

  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [loading, setLoading] = useState(true);

  // Add to Pack Modal state
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const [isAddingToPack, setIsAddingToPack] = useState(false);
  const [newPackName, setNewPackName] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [stickersData, packsData] = await Promise.all([
        stickerService.getStickers(),
        packService.getPacks(),
      ]);
      setStickers(stickersData);
      setPacks(packsData);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load your stickers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sticker?')) return;
    try {
      await stickerService.deleteSticker(id);
      setStickers((prev) => prev.filter((s) => s._id !== id));
      success('Sticker deleted');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to delete sticker');
    }
  };

  const handleDownload = (sticker: Sticker) => {
    const filename = `${sticker.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.${sticker.format}`;
    const url = `/api/stickers/${sticker._id}/download`;
    stickerService.triggerDownload(url, filename);
    success('Sticker downloaded');
  };

  const handleAddToExistingPack = async (packId: string) => {
    if (!selectedSticker) return;
    try {
      await packService.addStickerToPack(packId, selectedSticker._id);
      success('Sticker added to pack!');
      setSelectedSticker(null);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to add sticker to pack');
    }
  };

  const handleCreatePackAndAdd = async () => {
    if (!selectedSticker || !newPackName.trim()) return;
    setIsAddingToPack(true);
    try {
      const newPack = await packService.createPack({
        name: newPackName.trim(),
        stickers: [selectedSticker._id],
      });
      success(`Created "${newPack.name}" and added sticker!`);
      setNewPackName('');
      setSelectedSticker(null);
      loadData();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create pack');
    } finally {
      setIsAddingToPack(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            My Sticker Library
          </h1>
          <p className="text-sm text-zinc-600 mt-1">
            Browse, download, and organize your custom stickers into packs.
          </p>
        </div>

        <Link
          to="/create"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create New Sticker</span>
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
          <p className="text-sm text-zinc-600">Loading your stickers...</p>
        </div>
      ) : stickers.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-600">
            <ImageIcon className="w-6 h-6 text-zinc-600" />
          </div>
          <h2 className="text-base font-bold text-zinc-900">No stickers yet</h2>
          <p className="text-xs text-zinc-600 mt-1 mb-6">
            You haven't saved any stickers yet. Create your first one in seconds!
          </p>
          <Link
            to="/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create a Sticker</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
          {stickers.map((sticker) => (
            <div
              key={sticker._id}
              className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm hover:border-zinc-300 transition-all flex flex-col"
            >
              {/* Sticker Thumbnail */}
              <div className="aspect-square bg-checkerboard flex items-center justify-center p-4 border-b border-zinc-100">
                <img
                  src={getAssetUrl(sticker.stickerImage)}
                  alt={sticker.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                  loading="lazy"
                />
              </div>

              {/* Info & Actions */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 truncate" title={sticker.name}>
                    {sticker.name}
                  </h2>
                  <div className="flex items-center justify-between text-[11px] text-zinc-600 mt-1">
                    <span className="uppercase font-mono">{sticker.format}</span>
                    <span>{sticker.width}×{sticker.height}px</span>
                    <span>{(sticker.fileSize / 1024).toFixed(0)} KB</span>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-zinc-100 flex items-center justify-between gap-1">
                  <button
                    onClick={() => handleDownload(sticker)}
                    className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
                    title="Download Sticker"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setSelectedSticker(sticker)}
                    className="p-1.5 text-zinc-600 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                    title="Add to Sticker Pack"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(sticker._id)}
                    className="p-1.5 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete Sticker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add to Pack Modal */}
      {selectedSticker && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <h2 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand-600" />
                Add to Sticker Pack
              </h2>
              <button
                onClick={() => setSelectedSticker(null)}
                className="text-zinc-600 hover:text-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 mb-4">
              Adding <span className="font-semibold text-zinc-800">{selectedSticker.name}</span> to a collection:
            </p>

            {/* Existing Packs */}
            {packs.length > 0 && (
              <div className="mb-6">
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                  Choose Existing Pack
                </label>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {packs.map((pack) => (
                    <button
                      key={pack._id}
                      onClick={() => handleAddToExistingPack(pack._id)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-zinc-800 hover:bg-zinc-100 rounded-lg flex items-center justify-between border border-zinc-100 transition-colors"
                    >
                      <span className="truncate">{pack.name}</span>
                      <span className="text-[11px] text-zinc-600 shrink-0">
                        {pack.stickers.length} stickers
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Or create new pack */}
            <div className="pt-4 border-t border-zinc-100">
              <label htmlFor="modal-new-pack-name" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Or Create a New Pack
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  id="modal-new-pack-name"
                  type="text"
                  placeholder="e.g. Friends Reactions"
                  value={newPackName}
                  onChange={(e) => setNewPackName(e.target.value)}
                  className="w-full sm:flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  onClick={handleCreatePackAndAdd}
                  disabled={isAddingToPack || !newPackName.trim()}
                  className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-lg transition-colors shrink-0"
                >
                  Create & Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
