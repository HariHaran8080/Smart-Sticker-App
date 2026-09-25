import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StickerSettings } from '../types';
import { stickerService } from '../services/sticker.service';
import { imageService } from '../services/image.service';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../services/api';
import { Sliders } from 'lucide-react';
import { EditorTopBar } from '../components/editor/EditorTopBar';
import { InteractiveCanvas } from '../components/editor/InteractiveCanvas';
import { ObjectInspector } from '../components/editor/ObjectInspector';
import { TemplatesModal, TemplatePreset, TEMPLATE_PRESETS } from '../components/editor/TemplatesModal';

export const EditorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [originalUrl, setOriginalUrl] = useState<string>(location.state?.originalUrl || '');
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [useCutout, setUseCutout] = useState(true);

  // If no image is provided, redirect to /create
  useEffect(() => {
    if (!originalUrl) {
      navigate('/create');
    }
  }, [originalUrl, navigate]);

  // Loading & generation states
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [zoom, setZoom] = useState(1.0);
  const [checkerTheme, setCheckerTheme] = useState<'light' | 'dark'>('dark');
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Sticker naming & initial settings
  const [stickerName, setStickerName] = useState('My Sticker');
  const [settings, setSettings] = useState<StickerSettings>({
    rotation: 0,
    scale: 1.0,
    position: { x: 0, y: 0 },
    outline: {
      enabled: true,
      style: 'white',
      color: '#ffffff',
      width: 8,
    },
    shadow: {
      enabled: false,
      color: '#000000',
      blur: 14,
      offsetX: 0,
      offsetY: 8,
      opacity: 0.4,
    },
    reflection: {
      enabled: false,
      opacity: 0.3,
      distance: 10,
    },
    adjust: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      hue: 0,
      blur: 0,
    },
    blend: 'normal',
    flip: {
      horizontal: false,
      vertical: false,
    },
    canvasBackground: {
      type: 'transparent',
      color: 'transparent',
    },
    text: {
      content: '',
      fontSize: 32,
      color: '#ffffff',
      bold: true,
      align: 'bottom',
    },
    emoji: {
      symbol: '',
      position: 'top-right',
      size: 48,
    },
    exportFormat: 'webp',
    targetSize: 512,
  });

  // History Stack for Undo / Redo
  const [history, setHistory] = useState<StickerSettings[]>([settings]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const pushHistory = useCallback(
    (newSettings: StickerSettings) => {
      setHistory((prev) => {
        const next = prev.slice(0, historyIndex + 1);
        next.push(newSettings);
        if (next.length > 30) next.shift(); // keep max 30 snapshots
        return next;
      });
      setHistoryIndex((prev) => Math.min(prev + 1, 29));
    },
    [historyIndex]
  );

  const handleUpdateSettings = useCallback(
    (updater: (prev: StickerSettings) => StickerSettings) => {
      setSettings((prev) => {
        const updated = updater(prev);
        pushHistory(updated);
        return updated;
      });
    },
    [pushHistory]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setSettings(history[newIndex]);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setSettings(history[newIndex]);
    }
  }, [historyIndex, history]);

  // Keyboard shortcuts for Undo (Ctrl+Z) and Redo (Ctrl+Y / Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Loaded Image state for Canvas
  const [loadedImg, setLoadedImg] = useState<HTMLImageElement | null>(null);

  // Active source depends on useCutout toggle
  const activeSourceUrl = useCutout && processedUrl ? processedUrl : originalUrl;

  useEffect(() => {
    if (!activeSourceUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = getAssetUrl(activeSourceUrl);
    img.onload = () => {
      setLoadedImg(img);
    };
  }, [activeSourceUrl]);

  // Background removal trigger
  const handleRemoveBackground = async () => {
    if (!originalUrl) return;
    setIsRemovingBg(true);

    try {
      const res = await stickerService.removeBackground(originalUrl);
      setProcessedUrl(res.processedUrl);
      setUseCutout(true);
      success(`Background removed with ${res.provider}!`);
    } catch (err: any) {
      error(err.response?.data?.message || 'Background removal failed');
    } finally {
      setIsRemovingBg(false);
    }
  };

  // Hidden File input ref for Replace Image / Insert
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleTriggerInsert = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      const res = await imageService.uploadImage(file);
      setOriginalUrl(res.url);
      setProcessedUrl(null);
      setUseCutout(false);
      setStickerName(file.name.replace(/\.[^/.]+$/, ''));
      success('Image replaced successfully!');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to upload replacement image');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // AI Prompt interpretation
  const handleQuickPrompt = (promptText: string) => {
    const p = promptText.toLowerCase().trim();

    if (p.includes('neon') || p.includes('glow')) {
      const preset = TEMPLATE_PRESETS.find((t) => t.id === 'cyberpunk-neon');
      if (preset) handleApplyTemplate(preset);
      success('Applied Cyberpunk Neon glow styling!');
    } else if (p.includes('3d') || p.includes('float') || p.includes('elevation')) {
      const preset = TEMPLATE_PRESETS.find((t) => t.id === '3d-float');
      if (preset) handleApplyTemplate(preset);
      success('Applied 3D Floating shadow & reflection!');
    } else if (p.includes('comic') || p.includes('pop') || p.includes('art')) {
      const preset = TEMPLATE_PRESETS.find((t) => t.id === 'comic-pop');
      if (preset) handleApplyTemplate(preset);
      success('Applied Comic Pop Art outline!');
    } else if (p.includes('die cut') || p.includes('white border') || p.includes('sticker')) {
      const preset = TEMPLATE_PRESETS.find((t) => t.id === 'classic-die-cut');
      if (preset) handleApplyTemplate(preset);
      success('Applied Classic Die-Cut White outline!');
    } else if (p.includes('gold') || p.includes('hologram') || p.includes('foil')) {
      const preset = TEMPLATE_PRESETS.find((t) => t.id === 'hologram-foil');
      if (preset) handleApplyTemplate(preset);
      success('Applied Holographic Foil effect!');
    } else {
      // General enhancement
      handleUpdateSettings((prev) => ({
        ...prev,
        outline: { enabled: true, style: 'white', color: '#ffffff', width: 8 },
        shadow: { enabled: true, color: '#000000', blur: 16, offsetX: 0, offsetY: 8, opacity: 0.4 },
        adjust: { brightness: 5, contrast: 15, saturation: 15, hue: 0, blur: 0 },
      }));
      success(`Applied aesthetic edit for "${promptText}"!`);
    }
  };

  // Apply template preset
  const handleApplyTemplate = (preset: TemplatePreset) => {
    handleUpdateSettings((prev) => ({
      ...prev,
      ...preset.settings,
      outline: { ...prev.outline, ...preset.settings.outline },
      shadow: { ...prev.shadow!, ...preset.settings.shadow },
      reflection: { ...prev.reflection!, ...preset.settings.reflection },
      adjust: { ...prev.adjust!, ...preset.settings.adjust },
    }));
  };

  // Download sticker
  const handleDownload = async () => {
    if (!originalUrl) return;
    setIsDownloading(true);

    try {
      const res = await stickerService.createSticker({
        originalUrl,
        processedUrl: useCutout && processedUrl ? processedUrl : undefined,
        name: stickerName,
        settings,
      });

      const effectiveFormat = res.format || settings.exportFormat || 'png';
      const filename = `${stickerName.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.${effectiveFormat}`;
      await stickerService.triggerDownload(res.downloadUrl, filename);
      success(`Sticker downloaded as high quality ${effectiveFormat.toUpperCase()}!`);
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to generate sticker for download');
    } finally {
      setIsDownloading(false);
    }
  };

  // Save to account
  const handleSaveToAccount = async () => {
    if (!user) {
      info('Please sign in or create an account to save stickers to your library');
      navigate('/login', { state: { returnTo: location.pathname, stickerState: location.state } });
      return;
    }

    setIsSaving(true);
    try {
      await stickerService.createSticker({
        originalUrl,
        processedUrl: useCutout && processedUrl ? processedUrl : undefined,
        name: stickerName,
        settings,
      });

      success('Sticker saved to your library!');
      navigate('/stickers');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to save sticker');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-zinc-950 text-white overflow-hidden">
      {/* Hidden File Input for Insert/Replace */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Top Navigation & Tool Bar */}
      <EditorTopBar
        stickerName={stickerName}
        onStickerNameChange={setStickerName}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onTriggerInsert={handleTriggerInsert}
        onToggleText={() => setShowTextEditor((prev) => !prev)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onSave={handleSaveToAccount}
        onDownload={handleDownload}
        isSaving={isSaving}
        isDownloading={isDownloading}
        zoom={zoom}
        onZoomChange={setZoom}
        checkerTheme={checkerTheme}
        onToggleCheckerTheme={() =>
          setCheckerTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
        }
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen((prev) => !prev)}
      />

      {/* Main Studio Body: Canvas on Left, Inspector on Right */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Interactive Studio Canvas View */}
        <div className={`flex-1 flex flex-col h-full overflow-hidden ${isInspectorOpen ? 'hidden lg:flex' : 'flex'}`}>
          <InteractiveCanvas
            loadedImg={loadedImg}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            isRemovingBg={isRemovingBg}
            zoom={zoom}
            checkerTheme={checkerTheme}
            onQuickPrompt={handleQuickPrompt}
            showTextEditor={showTextEditor}
            onCloseTextEditor={() => setShowTextEditor(false)}
          />

          {/* Floating Mobile Pill to Open Effects / Inspector */}
          <button
            onClick={() => setIsInspectorOpen(true)}
            className="lg:hidden absolute bottom-20 right-4 z-30 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-zinc-900/90 backdrop-blur-md border border-brand-500/50 text-xs font-bold text-white shadow-2xl hover:bg-zinc-800 transition-all active:scale-95"
          >
            <Sliders className="w-3.5 h-3.5 text-brand-400" />
            <span>Customize Object</span>
          </button>
        </div>

        {/* Object Inspector Sidebar */}
        <div className={`h-full ${isInspectorOpen ? 'w-full flex-1' : 'hidden lg:flex lg:w-80'} shrink-0`}>
          <ObjectInspector
            previewUrl={activeSourceUrl ? getAssetUrl(activeSourceUrl) : ''}
            hasCutout={!!processedUrl}
            isRemovingBg={isRemovingBg}
            onRemoveBackground={handleRemoveBackground}
            useCutout={useCutout}
            onToggleUseCutout={setUseCutout}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onReplaceImage={handleTriggerInsert}
            onSave={handleSaveToAccount}
            isSaving={isSaving}
            onCloseMobile={() => setIsInspectorOpen(false)}
          />
        </div>
      </div>

      {/* Templates Modal */}
      <TemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onApplyTemplate={handleApplyTemplate}
      />
    </div>
  );
};

export default EditorPage;
