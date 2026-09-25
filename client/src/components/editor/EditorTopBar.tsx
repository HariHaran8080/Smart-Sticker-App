import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Plus,
  Type,
  LayoutTemplate,
  Layers,
  Sparkles,
  Maximize2,
  Download,
  Bookmark,
  Loader2,
  ChevronDown,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Grid,
  Sliders,
  Scaling,
} from 'lucide-react';
import { StickerSettings } from '../../types';

interface EditorTopBarProps {
  stickerName: string;
  onStickerNameChange: (name: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenTemplates: () => void;
  onTriggerInsert: () => void;
  onToggleText: () => void;
  settings: StickerSettings;
  onUpdateSettings: (updater: (prev: StickerSettings) => StickerSettings) => void;
  onSave: () => void;
  onDownload: () => void;
  onSaveChanges?: () => void;
  isSaving: boolean;
  isDownloading: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  checkerTheme: 'light' | 'dark';
  onToggleCheckerTheme: () => void;
  onToggleInspector?: () => void;
  isInspectorOpen?: boolean;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  stickerName,
  onStickerNameChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenTemplates,
  onTriggerInsert,
  onToggleText,
  settings,
  onUpdateSettings,
  onSave,
  onDownload,
  onSaveChanges,
  isSaving,
  isDownloading,
  zoom,
  onZoomChange,
  checkerTheme,
  onToggleCheckerTheme,
  onToggleInspector,
  isInspectorOpen,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const closeMenu = () => setActiveMenu(null);

  // Background presets
  const bgPresets = [
    { label: 'Transparent', type: 'transparent' as const, color: 'transparent', preview: 'bg-checkerboard' },
    { label: 'Studio Dark', type: 'solid' as const, color: '#18181b', preview: 'bg-zinc-900' },
    { label: 'Clean White', type: 'solid' as const, color: '#ffffff', preview: 'bg-white border border-zinc-300' },
    { label: 'Stage Spotlight', type: 'solid' as const, color: '#0f172a', preview: 'bg-slate-900' },
    { label: 'Emerald Deep', type: 'solid' as const, color: '#013620', preview: 'bg-brand-950' },
  ];

  // AI Shadow presets
  const shadowPresets = [
    {
      name: 'None',
      shadow: { enabled: false, color: '#000000', blur: 0, offsetX: 0, offsetY: 0, opacity: 0 },
    },
    {
      name: 'Soft Drop',
      shadow: { enabled: true, color: '#000000', blur: 14, offsetX: 0, offsetY: 8, opacity: 0.35 },
    },
    {
      name: '3D Floating',
      shadow: { enabled: true, color: '#000000', blur: 26, offsetX: 0, offsetY: 20, opacity: 0.5 },
    },
    {
      name: 'Contact Shadow',
      shadow: { enabled: true, color: '#000000', blur: 6, offsetX: 0, offsetY: 4, opacity: 0.6 },
    },
    {
      name: 'Neon Cyan Glow',
      shadow: { enabled: true, color: '#00f0ff', blur: 24, offsetX: 0, offsetY: 0, opacity: 0.8 },
    },
    {
      name: 'Neon Magenta Glow',
      shadow: { enabled: true, color: '#ff007f', blur: 24, offsetX: 0, offsetY: 0, opacity: 0.8 },
    },
  ];

  // Resize presets
  const resizePresets = [
    { name: 'WhatsApp & Telegram (512×512)', size: 512, badge: 'Standard' },
    { name: 'Discord Custom Emoji (128×128)', size: 128, badge: 'Emoji' },
    { name: 'High Res HD (1024×1024)', size: 1024, badge: 'Print' },
    { name: 'Original Resolution', size: 0, badge: 'Raw' },
  ];

  return (
    <header className="bg-zinc-950 border-b border-zinc-800/80 select-none relative z-40">
      <div className="h-14 px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Home & History Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            to="/create"
            className="p-1.5 sm:p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/70 rounded-lg transition-colors"
            title="Back to upload"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="h-4 w-px bg-zinc-800 mx-0.5 sm:mx-1" />

          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="p-1.5 sm:p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 hover:bg-zinc-800/70 rounded-lg transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="p-1.5 sm:p-2 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-400 hover:bg-zinc-800/70 rounded-lg transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-zinc-800 mx-0.5 sm:mx-1 hidden xs:block" />

          {/* Sticker Name Input */}
          <input
            type="text"
            value={stickerName}
            onChange={(e) => onStickerNameChange(e.target.value)}
            placeholder="Untitled Sticker"
            className="text-xs sm:text-sm font-medium text-zinc-200 bg-transparent hover:bg-zinc-900/60 focus:bg-zinc-900 px-2 py-1 rounded-md border border-transparent focus:border-zinc-700 focus:outline-none max-w-[90px] xs:max-w-[130px] sm:max-w-[160px] truncate transition-colors"
          />
        </div>

      {/* Center: PhotoRoom Studio Action Bar */}
      <div className="hidden md:flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-zinc-800">
        {/* Insert Image */}
        <button
          onClick={onTriggerInsert}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-brand-400" />
          <span>Insert</span>
        </button>

        {/* Add Text */}
        <button
          onClick={onToggleText}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <Type className="w-3.5 h-3.5 text-amber-400" />
          <span>Add text</span>
        </button>

        {/* Templates */}
        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-emerald-400" />
          <span>Templates</span>
        </button>

        {/* Backgrounds Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('backgrounds')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeMenu === 'backgrounds'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Backgrounds</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {activeMenu === 'backgrounds' && (
            <div className="absolute top-full left-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 py-1 block">
                Canvas Backdrop
              </span>
              {bgPresets.map((bg) => {
                const isSelected =
                  bg.type === 'transparent'
                    ? !settings.canvasBackground || settings.canvasBackground.type === 'transparent'
                    : settings.canvasBackground?.color === bg.color;
                return (
                  <button
                    key={bg.label}
                    onClick={() => {
                      onUpdateSettings((prev) => ({
                        ...prev,
                        canvasBackground: {
                          type: bg.type,
                          color: bg.color,
                        },
                      }));
                      closeMenu();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-md ${bg.preview}`} />
                      <span>{bg.label}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Shadows Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('shadows')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeMenu === 'shadows' ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>AI Shadows</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {activeMenu === 'shadows' && (
            <div className="absolute top-full left-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 py-1 block">
                Shadow Presets
              </span>
              {shadowPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    onUpdateSettings((prev) => ({
                      ...prev,
                      shadow: preset.shadow,
                    }));
                    closeMenu();
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
                >
                  <span>{preset.name}</span>
                  {settings.shadow?.enabled === preset.shadow.enabled &&
                    settings.shadow?.color === preset.shadow.color && (
                      <Check className="w-3.5 h-3.5 text-brand-400" />
                    )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Resize Dropdown */}
        <div className="relative">
          <button
            onClick={() => toggleMenu('resize')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeMenu === 'resize' ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Resize</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {activeMenu === 'resize' && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-2 z-50 animate-fade-in">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 px-2 py-1 block">
                Target Resolution
              </span>
              {resizePresets.map((r) => {
                const isSelected = settings.targetSize === r.size;
                return (
                  <button
                    key={r.name}
                    onClick={() => {
                      onUpdateSettings((prev) => ({
                        ...prev,
                        targetSize: r.size,
                      }));
                      closeMenu();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                      <span>{r.name}</span>
                    </div>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {r.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Export & Save Controls */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls */}
        <div className="hidden lg:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800 text-xs text-zinc-400">
          <button
            onClick={() => onZoomChange(Math.max(0.4, zoom - 0.1))}
            className="p-1 hover:text-white hover:bg-zinc-800 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="px-1 text-[11px] font-mono min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => onZoomChange(Math.min(2.0, zoom + 0.1))}
            className="p-1 hover:text-white hover:bg-zinc-800 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onZoomChange(1.0)}
            className="p-1 hover:text-white hover:bg-zinc-800 rounded text-[10px]"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Checkerboard toggle button */}
        <button
          onClick={onToggleCheckerTheme}
          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
          title={`Switch to ${checkerTheme === 'light' ? 'Dark' : 'Light'} Grid`}
        >
          <Grid className="w-3.5 h-3.5" />
        </button>

        {/* Format Selector */}
        <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800 text-[11px] font-medium">
          <button
            onClick={() => onUpdateSettings((prev) => ({ ...prev, exportFormat: 'webp' }))}
            className={`px-2 py-1 rounded-md transition-colors ${
              settings.exportFormat === 'webp'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            WebP
          </button>
          <button
            onClick={() => onUpdateSettings((prev) => ({ ...prev, exportFormat: 'png' }))}
            className={`px-2 py-1 rounded-md transition-colors ${
              settings.exportFormat === 'png'
                ? 'bg-zinc-800 text-white font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            PNG
          </button>
        </div>

        {/* Download Button (Caribbean green styling) */}
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-zinc-950 bg-brand-500 hover:bg-brand-400 active:bg-brand-600 disabled:opacity-50 rounded-lg shadow-sm transition-all"
        >
          {isDownloading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-950" />
          ) : (
            <Download className="w-3.5 h-3.5 text-zinc-950" />
          )}
          <span>Download</span>
        </button>

        {/* Save Changes Button */}
        {onSaveChanges && (
          <button
            onClick={onSaveChanges}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-800 border border-zinc-700/80 hover:border-brand-500/50 rounded-lg shadow-sm transition-all"
            title="Save current modifications and canvas changes"
          >
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Save Changes</span>
          </button>
        )}

        {/* Save to Collection */}
        <button
          onClick={onSave}
          disabled={isSaving}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 rounded-lg transition-colors"
          title="Save sticker to your collection library"
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
          ) : (
            <Bookmark className="w-3.5 h-3.5 text-brand-400" />
          )}
          <span>Save to Collection</span>
        </button>

        {/* Mobile Tools / Inspector Drawer Toggle */}
        {onToggleInspector && (
          <button
            onClick={onToggleInspector}
            className={`lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              isInspectorOpen
                ? 'bg-brand-500 text-zinc-950 border-brand-400 font-bold shadow-sm'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:text-white'
            }`}
            title="Toggle Edit Tools"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Effects</span>
          </button>
        )}
      </div>
      </div>

      {/* Mobile Studio Action Bar (< md devices) */}
      <div className="md:hidden flex items-center gap-1.5 px-3 py-1.5 border-t border-zinc-800/80 overflow-x-auto no-scrollbar bg-zinc-950/95 relative z-30">
        <button
          onClick={onTriggerInsert}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg shrink-0 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 text-brand-400" />
          <span>Insert</span>
        </button>

        <button
          onClick={onToggleText}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg shrink-0 transition-colors"
        >
          <Type className="w-3.5 h-3.5 text-amber-400" />
          <span>Text</span>
        </button>

        <button
          onClick={onOpenTemplates}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg shrink-0 transition-colors"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-emerald-400" />
          <span>Templates</span>
        </button>

        <button
          onClick={() => toggleMenu('backgrounds')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg shrink-0 transition-colors ${
            activeMenu === 'backgrounds' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Backdrops</span>
        </button>

        <button
          onClick={() => toggleMenu('shadows')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg shrink-0 transition-colors ${
            activeMenu === 'shadows' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Shadows</span>
        </button>

        <button
          onClick={() => toggleMenu('resize')}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg shrink-0 transition-colors ${
            activeMenu === 'resize' ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
          }`}
        >
          <Scaling className="w-3.5 h-3.5 text-emerald-400" />
          <span>Resize</span>
        </button>
      </div>
    </header>
  );
};
