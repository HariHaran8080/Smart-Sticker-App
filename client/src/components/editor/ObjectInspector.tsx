import React, { useState } from 'react';
import {
  Bookmark,
  RefreshCw,
  Sparkles,
  Lightbulb,
  Scissors,
  Wand2,
  ChevronRight,
  ChevronDown,
  FlipHorizontal,
  FlipVertical,
  AlignCenter,
  AlignVerticalSpaceAround,
  Sliders,
  Layers,
  Crop,
  Loader2,
  Type,
} from 'lucide-react';
import { StickerSettings } from '../../types';

interface ObjectInspectorProps {
  previewUrl: string;
  hasCutout: boolean;
  isRemovingBg: boolean;
  onRemoveBackground: () => void;
  useCutout: boolean;
  onToggleUseCutout: (val: boolean) => void;
  settings: StickerSettings;
  onUpdateSettings: (updater: (prev: StickerSettings) => StickerSettings) => void;
  onReplaceImage: () => void;
  onSave: () => void;
  isSaving: boolean;
  onCloseMobile?: () => void;
}

export const ObjectInspector: React.FC<ObjectInspectorProps> = ({
  previewUrl,
  hasCutout,
  isRemovingBg,
  onRemoveBackground,
  useCutout,
  onToggleUseCutout,
  settings,
  onUpdateSettings,
  onReplaceImage,
  onSave,
  isSaving,
  onCloseMobile,
}) => {
  // Accordion open states
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    text: true,
    shadows: false,
    outline: true,
    reflection: false,
    adjust: false,
    transform: true,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Quick Retouch: bump contrast & sharpness
  const handleRetouch = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      adjust: {
        brightness: prev.adjust?.brightness || 0,
        contrast: Math.min(60, (prev.adjust?.contrast || 0) + 15),
        saturation: Math.min(60, (prev.adjust?.saturation || 0) + 15),
        hue: prev.adjust?.hue || 0,
        blur: 0,
      },
    }));
  };

  // Quick Light On: boost brightness
  const handleLightOn = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      adjust: {
        brightness: Math.min(50, (prev.adjust?.brightness || 0) + 12),
        contrast: prev.adjust?.contrast || 0,
        saturation: prev.adjust?.saturation || 0,
        hue: prev.adjust?.hue || 0,
        blur: prev.adjust?.blur || 0,
      },
    }));
  };

  // Alignments
  const handleAlignCenter = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      position: { ...prev.position, x: 0 },
    }));
  };

  const handleAlignMiddle = () => {
    onUpdateSettings((prev) => ({
      ...prev,
      position: { ...prev.position, y: 0 },
    }));
  };

  // Quick color palettes
  const colorSwatches = ['#ffffff', '#000000', '#00DF81', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <aside className="w-full lg:w-80 bg-zinc-950 border-l border-zinc-800/80 flex flex-col h-full overflow-y-auto custom-scrollbar select-none text-zinc-300">
      {/* 1. Header with Thumbnail, Object title, Save button */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden flex items-center justify-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Thumbnail" className="w-full h-full object-contain" />
            ) : (
              <div className="w-3 h-3 rounded-full bg-zinc-700" />
            )}
          </div>
          <span className="text-sm font-semibold text-white">Object</span>
        </div>

        <div className="flex items-center gap-2">
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-zinc-950 bg-brand-500 hover:bg-brand-400 rounded-lg shadow-sm transition-colors"
            >
              <span>Done</span>
            </button>
          )}

          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg shadow-sm transition-colors"
            title="Save sticker to your collection library"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
            ) : (
              <Bookmark className="w-3.5 h-3.5 text-brand-400" />
            )}
            <span>Save to Collection</span>
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* 2. Top Action Pills: Replace, Retouch, Light On */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onReplaceImage}
            className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-center group"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400 group-hover:text-brand-400 transition-colors" />
            <span className="text-[11px] font-medium">Replace</span>
          </button>

          <button
            onClick={handleRetouch}
            className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-center group"
          >
            <Sparkles className="w-4 h-4 text-zinc-400 group-hover:text-amber-400 transition-colors" />
            <span className="text-[11px] font-medium">Retouch</span>
          </button>

          <button
            onClick={handleLightOn}
            className="flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-300 hover:text-white transition-all text-center group"
          >
            <Lightbulb className="w-4 h-4 text-zinc-400 group-hover:text-yellow-400 transition-colors" />
            <span className="text-[11px] font-medium">Light On</span>
          </button>
        </div>

        {/* 3. Align to canvas */}
        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Align to canvas
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleAlignCenter}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-200 hover:text-white transition-colors"
            >
              <AlignCenter className="w-3.5 h-3.5 text-zinc-400" />
              <span>Center</span>
            </button>
            <button
              onClick={handleAlignMiddle}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-200 hover:text-white transition-colors"
            >
              <AlignVerticalSpaceAround className="w-3.5 h-3.5 text-zinc-400" />
              <span>Middle</span>
            </button>
          </div>
        </div>

        {/* 4. Remove Background Card */}
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-semibold text-zinc-200">Remove background</span>
            </div>

            {/* Switch Toggle */}
            <button
              type="button"
              onClick={() => onToggleUseCutout(!useCutout)}
              className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
                useCutout ? 'bg-brand-500 justify-end' : 'bg-zinc-800 justify-start'
              }`}
            >
              <div className="bg-zinc-950 w-3.5 h-3.5 rounded-full shadow-md" />
            </button>
          </div>

          <button
            onClick={onRemoveBackground}
            disabled={isRemovingBg}
            className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 border border-zinc-700/80 rounded-lg text-xs font-semibold text-zinc-200 hover:text-white transition-colors"
          >
            {isRemovingBg ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-brand-400" />
            )}
            <span>{hasCutout ? 'Refine Cutout' : 'Generate AI Cutout'}</span>
          </button>
        </div>

        {/* Text & Typography Accordion */}
        <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40">
          <div
            onClick={() => toggleSection('text')}
            className="flex items-center justify-between px-3.5 py-3 cursor-pointer hover:bg-zinc-900/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Type className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-semibold text-zinc-200">Text & Typography</span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => toggleSection('text')}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {openSections.text ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.text && (
            <div className="p-3.5 pt-0 space-y-3.5 border-t border-zinc-800/60 text-xs">
              {/* Text Input */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-medium text-zinc-400">Content</label>
                <input
                  type="text"
                  value={settings.text.content}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      text: { ...prev.text, content: e.target.value },
                    }))
                  }
                  placeholder="Caption, quote, meme..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Style Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">1-Click Presets</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        text: {
                          ...prev.text,
                          color: '#ffffff',
                          strokeColor: '#000000',
                          strokeWidth: 4,
                          backgroundColor: 'none',
                          fontFamily: "'Impact', 'Arial Black', sans-serif",
                          bold: true,
                        },
                      }))
                    }
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[11px] font-bold text-white text-center transition-all hover:scale-[1.02]"
                  >
                    💥 Meme
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        text: {
                          ...prev.text,
                          color: '#00f0ff',
                          strokeColor: '#581c87',
                          strokeWidth: 3,
                          backgroundColor: 'rgba(0,0,0,0.65)',
                          fontFamily: "'Trebuchet MS', sans-serif",
                          bold: true,
                        },
                      }))
                    }
                    className="py-1.5 px-2 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800/60 rounded-lg text-[11px] font-bold text-cyan-300 text-center transition-all hover:scale-[1.02]"
                  >
                    ⚡ Neon
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        text: {
                          ...prev.text,
                          color: '#fde047',
                          strokeColor: '#18181b',
                          strokeWidth: 4,
                          backgroundColor: 'none',
                          fontFamily: "'Comic Sans MS', cursive",
                          bold: true,
                        },
                      }))
                    }
                    className="py-1.5 px-2 bg-amber-950/60 hover:bg-amber-900 border border-amber-800/60 rounded-lg text-[11px] font-bold text-amber-300 text-center transition-all hover:scale-[1.02]"
                  >
                    🗯️ Comic
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        text: {
                          ...prev.text,
                          color: '#ffffff',
                          strokeColor: 'transparent',
                          strokeWidth: 0,
                          backgroundColor: 'rgba(0,0,0,0.75)',
                          fontFamily: "'Arial Black', sans-serif",
                        },
                      }))
                    }
                    className="py-1.5 px-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-[11px] font-bold text-brand-300 text-center transition-all hover:scale-[1.02]"
                  >
                    🏷️ Pill Badge
                  </button>
                </div>
              </div>

              {/* Font Family */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">Font</label>
                <select
                  value={settings.text.fontFamily || "'Impact', 'Arial Black', sans-serif"}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      text: { ...prev.text, fontFamily: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="'Impact', 'Arial Black', sans-serif">Impact (Meme)</option>
                  <option value="'Arial Black', sans-serif">Arial Black (Bold)</option>
                  <option value="'Comic Sans MS', cursive">Comic (Playful)</option>
                  <option value="'Trebuchet MS', sans-serif">Trebuchet (Modern)</option>
                  <option value="'Georgia', serif">Georgia (Serif)</option>
                  <option value="'Courier New', monospace">Courier (Monospace)</option>
                </select>
              </div>

              {/* Color & Outline */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Fill Color</label>
                  <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5">
                    <input
                      type="color"
                      value={settings.text.color}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          text: { ...prev.text, color: e.target.value },
                        }))
                      }
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[11px] font-mono text-zinc-400">{settings.text.color}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-400">Outline Color</label>
                  <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5">
                    <input
                      type="color"
                      value={settings.text.strokeColor || '#000000'}
                      onChange={(e) =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          text: { ...prev.text, strokeColor: e.target.value },
                        }))
                      }
                      className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-[11px] font-mono text-zinc-400">{settings.text.strokeColor || '#000000'}</span>
                  </div>
                </div>
              </div>

              {/* Font Size Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Font Size</span>
                  <span className="font-mono text-amber-400">{settings.text.fontSize || 32}px</span>
                </div>
                <input
                  type="range"
                  min="16"
                  max="72"
                  step="2"
                  value={settings.text.fontSize || 32}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      text: { ...prev.text, fontSize: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-amber-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Outline Width Slider */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Outline Thickness</span>
                  <span className="font-mono text-amber-400">{settings.text.strokeWidth !== undefined ? settings.text.strokeWidth : 3}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={settings.text.strokeWidth !== undefined ? settings.text.strokeWidth : 3}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      text: { ...prev.text, strokeWidth: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-amber-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Position Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400">Position Placement</label>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        text: { ...prev.text, align: 'top', y: 48 + (prev.text.fontSize || 32), x: 256 },
                      }))
                    }
                    className={`py-1.5 text-center text-[11px] rounded-lg border transition-all ${
                      settings.text.align === 'top'
                        ? 'bg-amber-400 text-zinc-950 font-bold border-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    Top
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        text: { ...prev.text, align: 'center', y: 256, x: 256 },
                      }))
                    }
                    className={`py-1.5 text-center text-[11px] rounded-lg border transition-all ${
                      settings.text.align === 'center'
                        ? 'bg-amber-400 text-zinc-950 font-bold border-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        text: { ...prev.text, align: 'bottom', y: 460, x: 256 },
                      }))
                    }
                    className={`py-1.5 text-center text-[11px] rounded-lg border transition-all ${
                      settings.text.align === 'bottom'
                        ? 'bg-amber-400 text-zinc-950 font-bold border-amber-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white'
                    }`}
                  >
                    Bottom
                  </button>
                </div>
              </div>

              {/* Pill Backdrop Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-400">Pill Badge Backdrop</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      text: {
                        ...prev.text,
                        backgroundColor:
                          prev.text.backgroundColor && prev.text.backgroundColor !== 'none'
                            ? 'none'
                            : 'rgba(0,0,0,0.75)',
                      },
                    }))
                  }
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                    settings.text.backgroundColor && settings.text.backgroundColor !== 'none'
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {settings.text.backgroundColor && settings.text.backgroundColor !== 'none'
                    ? 'Enabled'
                    : 'Disabled'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 5. Shadows Accordion */}
        <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40">
          <div
            onClick={() => toggleSection('shadows')}
            className="flex items-center justify-between px-3.5 py-3 cursor-pointer hover:bg-zinc-900/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full border border-brand-400 bg-brand-500/20 shadow-sm" />
              <span className="text-xs font-semibold text-zinc-200">Shadows</span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    shadow: {
                      enabled: !prev.shadow?.enabled,
                      color: prev.shadow?.color || '#000000',
                      blur: prev.shadow?.blur ?? 14,
                      offsetX: prev.shadow?.offsetX ?? 0,
                      offsetY: prev.shadow?.offsetY ?? 8,
                      opacity: prev.shadow?.opacity ?? 0.4,
                    },
                  }))
                }
                className={`w-9 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                  settings.shadow?.enabled ? 'bg-brand-500 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="bg-zinc-950 w-3.5 h-3.5 rounded-full shadow-md" />
              </button>

              <button
                onClick={() => toggleSection('shadows')}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {openSections.shadows ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.shadows && (
            <div className="px-3.5 pb-4 pt-1 space-y-3.5 border-t border-zinc-800/60 animate-fade-in text-xs">
              {/* Blur Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Blur</span>
                  <span className="font-mono text-zinc-300">{settings.shadow?.blur ?? 14}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.shadow?.blur ?? 14}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      shadow: { ...prev.shadow!, enabled: true, blur: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Offset Y (Elevation) */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Distance / Offset Y</span>
                  <span className="font-mono text-zinc-300">{settings.shadow?.offsetY ?? 8}px</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="40"
                  value={settings.shadow?.offsetY ?? 8}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      shadow: { ...prev.shadow!, enabled: true, offsetY: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Opacity */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Opacity</span>
                  <span className="font-mono text-zinc-300">
                    {Math.round((settings.shadow?.opacity ?? 0.4) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={settings.shadow?.opacity ?? 0.4}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      shadow: { ...prev.shadow!, enabled: true, opacity: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Color Swatches */}
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1.5">Shadow Color</span>
                <div className="flex items-center gap-2">
                  {colorSwatches.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          shadow: { ...prev.shadow!, enabled: true, color: c },
                        }))
                      }
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border ${
                        settings.shadow?.color === c ? 'border-white scale-110' : 'border-zinc-700'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={settings.shadow?.color || '#000000'}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        shadow: { ...prev.shadow!, enabled: true, color: e.target.value },
                      }))
                    }
                    className="w-5 h-5 rounded cursor-pointer bg-transparent"
                    title="Custom color"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 6. Outline Accordion */}
        <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40">
          <div
            onClick={() => toggleSection('outline')}
            className="flex items-center justify-between px-3.5 py-3 cursor-pointer hover:bg-zinc-900/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white bg-transparent" />
              <span className="text-xs font-semibold text-zinc-200">Outline / Border</span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    outline: {
                      ...prev.outline,
                      enabled: !prev.outline.enabled,
                    },
                  }))
                }
                className={`w-9 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                  settings.outline.enabled ? 'bg-brand-500 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="bg-zinc-950 w-3.5 h-3.5 rounded-full shadow-md" />
              </button>

              <button
                onClick={() => toggleSection('outline')}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {openSections.outline ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.outline && (
            <div className="px-3.5 pb-4 pt-1 space-y-3.5 border-t border-zinc-800/60 animate-fade-in text-xs">
              {/* Style Presets */}
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'white', label: 'Classic White' },
                  { id: 'black', label: 'Bold Black' },
                  { id: 'custom', label: 'Custom Tint' },
                  { id: 'soft', label: 'Feathered' },
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        outline: {
                          ...prev.outline,
                          enabled: true,
                          style: st.id as any,
                        },
                      }))
                    }
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border text-center transition-colors ${
                      settings.outline.style === st.id
                        ? 'bg-zinc-800 border-brand-500 text-white font-semibold'
                        : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Stroke Width Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Border Width</span>
                  <span className="font-mono text-zinc-300">{settings.outline.width}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="32"
                  value={settings.outline.width}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      outline: { ...prev.outline, width: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Color Selection for Custom outline */}
              <div>
                <span className="text-[11px] text-zinc-400 block mb-1.5">Color</span>
                <div className="flex items-center gap-2">
                  {colorSwatches.map((c) => (
                    <button
                      key={c}
                      onClick={() =>
                        onUpdateSettings((prev) => ({
                          ...prev,
                          outline: { ...prev.outline, style: 'custom', color: c },
                        }))
                      }
                      style={{ backgroundColor: c }}
                      className={`w-5 h-5 rounded-full border ${
                        settings.outline.color === c ? 'border-brand-400 scale-110' : 'border-zinc-700'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={settings.outline.color || '#ffffff'}
                    onChange={(e) =>
                      onUpdateSettings((prev) => ({
                        ...prev,
                        outline: { ...prev.outline, style: 'custom', color: e.target.value },
                      }))
                    }
                    className="w-5 h-5 rounded cursor-pointer bg-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 7. Reflection Accordion */}
        <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40">
          <div
            onClick={() => toggleSection('reflection')}
            className="flex items-center justify-between px-3.5 py-3 cursor-pointer hover:bg-zinc-900/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-3.5 h-3.5 rounded-xs border-b-2 border-brand-400 opacity-80" />
              <span className="text-xs font-semibold text-zinc-200">Reflection</span>
            </div>

            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    reflection: {
                      enabled: !prev.reflection?.enabled,
                      opacity: prev.reflection?.opacity ?? 0.3,
                      distance: prev.reflection?.distance ?? 10,
                    },
                  }))
                }
                className={`w-9 h-4.5 flex items-center rounded-full p-0.5 transition-colors ${
                  settings.reflection?.enabled ? 'bg-brand-500 justify-end' : 'bg-zinc-800 justify-start'
                }`}
              >
                <div className="bg-zinc-950 w-3.5 h-3.5 rounded-full shadow-md" />
              </button>

              <button
                onClick={() => toggleSection('reflection')}
                className="text-zinc-500 hover:text-zinc-300"
              >
                {openSections.reflection ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {openSections.reflection && (
            <div className="px-3.5 pb-4 pt-1 space-y-3.5 border-t border-zinc-800/60 animate-fade-in text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Reflection Opacity</span>
                  <span className="font-mono text-zinc-300">
                    {Math.round((settings.reflection?.opacity ?? 0.3) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={settings.reflection?.opacity ?? 0.3}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      reflection: {
                        ...prev.reflection!,
                        enabled: true,
                        opacity: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Mirror Distance</span>
                  <span className="font-mono text-zinc-300">
                    {settings.reflection?.distance ?? 10}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  value={settings.reflection?.distance ?? 10}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      reflection: {
                        ...prev.reflection!,
                        enabled: true,
                        distance: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* 8. Adjust (Color & Light) Accordion */}
        <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40">
          <div
            onClick={() => toggleSection('adjust')}
            className="flex items-center justify-between px-3.5 py-3 cursor-pointer hover:bg-zinc-900/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-200">Adjust</span>
            </div>

            <button
              onClick={() => toggleSection('adjust')}
              className="text-zinc-500 hover:text-zinc-300"
            >
              {openSections.adjust ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {openSections.adjust && (
            <div className="px-3.5 pb-4 pt-1 space-y-3.5 border-t border-zinc-800/60 animate-fade-in text-xs">
              {/* Brightness */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono text-zinc-300">
                    {settings.adjust?.brightness ?? 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  value={settings.adjust?.brightness ?? 0}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      adjust: { ...prev.adjust!, brightness: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono text-zinc-300">
                    {settings.adjust?.contrast ?? 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  value={settings.adjust?.contrast ?? 0}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      adjust: { ...prev.adjust!, contrast: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Saturation</span>
                  <span className="font-mono text-zinc-300">
                    {settings.adjust?.saturation ?? 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={settings.adjust?.saturation ?? 0}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      adjust: { ...prev.adjust!, saturation: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Hue Rotation */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Hue Rotate</span>
                  <span className="font-mono text-zinc-300">{settings.adjust?.hue ?? 0}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={settings.adjust?.hue ?? 0}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      adjust: { ...prev.adjust!, hue: Number(e.target.value) },
                    }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    adjust: { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0 },
                  }))
                }
                className="w-full py-1.5 text-center text-[11px] text-zinc-400 hover:text-white bg-zinc-800/80 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Reset Adjustments
              </button>
            </div>
          )}
        </div>

        {/* 9. Blend Mode */}
        <div className="flex items-center justify-between px-3.5 py-3 border border-zinc-800/80 rounded-xl bg-zinc-900/40">
          <div className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-semibold text-zinc-200">Blend</span>
          </div>

          <select
            value={settings.blend || 'normal'}
            onChange={(e) =>
              onUpdateSettings((prev) => ({
                ...prev,
                blend: e.target.value,
              }))
            }
            className="bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-200 rounded-lg px-2.5 py-1 focus:outline-none focus:border-brand-500"
          >
            <option value="normal">Normal</option>
            <option value="multiply">Multiply</option>
            <option value="screen">Screen</option>
            <option value="overlay">Overlay</option>
            <option value="darken">Darken</option>
            <option value="lighten">Lighten</option>
          </select>
        </div>

        {/* 10. Transform Accordion */}
        <div className="border border-zinc-800/80 rounded-xl overflow-hidden bg-zinc-900/40">
          <div
            onClick={() => toggleSection('transform')}
            className="flex items-center justify-between px-3.5 py-3 cursor-pointer hover:bg-zinc-900/80 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Crop className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-xs font-semibold text-zinc-200">Transform</span>
            </div>

            <button
              onClick={() => toggleSection('transform')}
              className="text-zinc-500 hover:text-zinc-300"
            >
              {openSections.transform ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {openSections.transform && (
            <div className="px-3.5 pb-4 pt-1 space-y-3.5 border-t border-zinc-800/60 animate-fade-in text-xs">
              {/* Scale Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Scale / Zoom</span>
                  <span className="font-mono text-zinc-300">
                    {Math.round(settings.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.2"
                  step="0.05"
                  value={settings.scale}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({ ...prev, scale: Number(e.target.value) }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex gap-1.5 pt-1.5">
                  {[0.5, 0.75, 1.0, 1.25, 1.5].map((s) => (
                    <button
                      key={s}
                      onClick={() => onUpdateSettings((prev) => ({ ...prev, scale: s }))}
                      className={`flex-1 py-1 text-[10px] font-semibold rounded border transition-colors ${
                        Math.abs(settings.scale - s) < 0.05
                          ? 'bg-brand-500 text-zinc-950 border-brand-500'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {Math.round(s * 100)}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation Slider */}
              <div>
                <div className="flex justify-between text-[11px] text-zinc-400 mb-1">
                  <span>Rotation Angle</span>
                  <span className="font-mono text-zinc-300">{settings.rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={settings.rotation}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({ ...prev, rotation: Number(e.target.value) }))
                  }
                  className="w-full accent-brand-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Flip Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      flip: {
                        horizontal: !prev.flip?.horizontal,
                        vertical: prev.flip?.vertical ?? false,
                      },
                    }))
                  }
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    settings.flip?.horizontal
                      ? 'bg-zinc-800 border-brand-500 text-white'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>

                <button
                  onClick={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      flip: {
                        horizontal: prev.flip?.horizontal ?? false,
                        vertical: !prev.flip?.vertical,
                      },
                    }))
                  }
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    settings.flip?.vertical
                      ? 'bg-zinc-800 border-brand-500 text-white'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>
              </div>

              <button
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    scale: 1.0,
                    rotation: 0,
                    flip: { horizontal: false, vertical: false },
                    position: { x: 0, y: 0 },
                  }))
                }
                className="w-full py-1.5 text-center text-[11px] text-zinc-400 hover:text-white bg-zinc-800/80 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Reset Transform
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
