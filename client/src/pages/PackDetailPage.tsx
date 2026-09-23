import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Trash2, Plus, Loader2, Layers } from 'lucide-react';
import { StickerPack, Sticker } from '../types';
import { packService } from '../services/pack.service';
import { stickerService } from '../services/sticker.service';
import { useToast } from '../context/ToastContext';
import { getAssetUrl } from '../services/api';

export const PackDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [pack, setPack] = useState<StickerPack | null>(null);
  const [loading, setLoading] = useState(true);

  // Add sticker modal
  const [allStickers, setAllStickers] = useState<Sticker[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  const loadPack = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await packService.getPackById(id);
      setPack(data);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to load pack details');
      navigate('/packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPack();
  }, [id]);

  const handleRemoveSticker = async (stickerId: string) => {
    if (!id || !pack) return;
    try {
      await packService.removeStickerFromPack(id, stickerId);
      success('Sticker removed from pack');
      loadPack();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to remove sticker');
    }
  };

  const handleOpenAddModal = async () => {
    try {
      const userStickers = await stickerService.getStickers();
      setAllStickers(userStickers);
      setShowAddModal(true);
    } catch (err: any) {
      error('Failed to load user stickers');
    }
  };

  const handleAddSticker = async (stickerId: string) => {
    if (!id) return;
    try {
      await packService.addStickerToPack(id, stickerId);
      success('Sticker added to pack');
      setShowAddModal(false);
      loadPack();
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to add sticker');
    }
  };

  if (loading || !pack) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-3" />
        <p className="text-sm text-zinc-600">Loading sticker pack...</p>
      </div>
    );
  }

  const hasStickers = pack.stickers && pack.stickers.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-zinc-200">
        <Link
          to="/packs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 mb-4 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Packs</span>
        </Link>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-brand-600" />
              {pack.name}
            </h1>
            {pack.description && (
              <p className="text-sm text-zinc-600 mt-1">{pack.description}</p>
            )}
            <p className="text-xs text-zinc-600 font-mono mt-1">
              {pack.stickers.length} {pack.stickers.length === 1 ? 'sticker' : 'stickers'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Stickers</span>
            </button>

            {hasStickers && (
              <a
                href={packService.getPackDownloadUrl(pack._id)}
                download
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download ZIP</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Grid of stickers */}
      {!hasStickers ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center max-w-md mx-auto shadow-sm">
          <p className="text-sm font-semibold text-zinc-800">This pack is empty</p>
          <p className="text-xs text-zinc-600 mt-1 mb-4">
            Add stickers from your library to this collection.
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Sticker</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5">
          {pack.stickers.map((sticker) => (
            <div
              key={sticker._id}
              className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="aspect-square bg-checkerboard flex items-center justify-center p-4 border-b border-zinc-100">
                <img
                  src={getAssetUrl(sticker.stickerImage)}
                  alt={sticker.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-sm"
                  loading="lazy"
                />
              </div>

              <div className="p-3.5 flex items-center justify-between">
                <div>
                  <h2 className="text-xs font-bold text-zinc-900 truncate max-w-[140px]">
                    {sticker.name}
                  </h2>
                  <span className="text-[10px] text-zinc-600 uppercase font-mono">
                    {sticker.format} · {sticker.width}×{sticker.height}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <a
                    href={`/api/stickers/${sticker._id}/download`}
                    download
                    className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                    title="Download individual sticker"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleRemoveSticker(sticker._id)}
                    className="p-1.5 text-zinc-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Remove from pack"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Sticker Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-zinc-200 max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <h2 className="text-base font-bold text-zinc-900">Add Sticker to {pack.name}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-600 hover:text-zinc-800"
              >
                ✕
              </button>
            </div>

            {allStickers.length === 0 ? (
              <p className="text-xs text-zinc-600 py-6 text-center">
                No stickers available in your library. Create one first!
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 max-h-80 overflow-y-auto pr-1">
                {allStickers.map((s) => {
                  const alreadyInPack = pack.stickers.some((existing) => existing._id === s._id);
                  return (
                    <button
                      key={s._id}
                      disabled={alreadyInPack}
                      onClick={() => handleAddSticker(s._id)}
                      className={`p-2 rounded-lg border text-left flex flex-col items-center gap-1.5 transition-all ${
                        alreadyInPack
                          ? 'opacity-40 border-zinc-200 cursor-not-allowed bg-zinc-50'
                          : 'border-zinc-200 hover:border-zinc-400 bg-white'
                      }`}
                    >
                      <div className="w-16 h-16 bg-checkerboard rounded flex items-center justify-center p-1">
                        <img
                          src={getAssetUrl(s.stickerImage)}
                          alt={s.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-[11px] font-semibold text-zinc-800 truncate w-full text-center">
                        {s.name}
                      </span>
                      {alreadyInPack && (
                        <span className="text-[9px] text-zinc-600">In pack</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
