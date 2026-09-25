import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCw,
  Trash2,
  AlignCenter,
  FlipHorizontal,
  FlipVertical,
  ArrowUp,
  Sparkles,
  Loader2,
  Type,
  X,
} from 'lucide-react';
import { StickerSettings } from '../../types';

interface InteractiveCanvasProps {
  loadedImg: HTMLImageElement | null;
  settings: StickerSettings;
  onUpdateSettings: (updater: (prev: StickerSettings) => StickerSettings) => void;
  isRemovingBg: boolean;
  zoom: number;
  checkerTheme: 'light' | 'dark';
  onQuickPrompt: (prompt: string) => void;
  showTextEditor: boolean;
  onCloseTextEditor: () => void;
}

export const InteractiveCanvas: React.FC<InteractiveCanvasProps> = ({
  loadedImg,
  settings,
  onUpdateSettings,
  isRemovingBg,
  zoom,
  checkerTheme,
  onQuickPrompt,
  showTextEditor,
  onCloseTextEditor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interaction dragging states
  const [isDragging, setIsDragging] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [textDragStart, setTextDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startTextPos, setStartTextPos] = useState<{ x: number; y: number }>({ x: 256, y: 460 });
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [startSettings, setStartSettings] = useState<{
    pos: { x: number; y: number };
    scale: number;
    rotation: number;
  }>({ pos: { x: 0, y: 0 }, scale: 1, rotation: 0 });

  // AI Prompt input state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMode, setAiMode] = useState<'Standard' | '1K' | 'HD'>('Standard');

  // WYSIWYG Rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loadedImg) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 512;
    canvas.width = size;
    canvas.height = size;

    // 1. Clear background
    ctx.clearRect(0, 0, size, size);

    // 2. Draw canvas backdrop if specified
    if (settings.canvasBackground && settings.canvasBackground.type === 'solid' && settings.canvasBackground.color) {
      ctx.fillStyle = settings.canvasBackground.color;
      ctx.fillRect(0, 0, size, size);
    }

    ctx.save();

    // 3. Transformations setup: Pivot to center + translation + rotation + scale
    const centerX = size / 2 + settings.position.x;
    const centerY = size / 2 + settings.position.y;
    ctx.translate(centerX, centerY);
    ctx.rotate((settings.rotation * Math.PI) / 180);

    const scaleX = (settings.flip?.horizontal ? -1 : 1) * settings.scale;
    const scaleY = (settings.flip?.vertical ? -1 : 1) * settings.scale;
    ctx.scale(scaleX, scaleY);

    // Base dimensions preserving aspect ratio
    const imgAspect = loadedImg.width / loadedImg.height;
    let baseW = size * 0.72;
    let baseH = baseW / imgAspect;

    if (baseH > size * 0.72) {
      baseH = size * 0.72;
      baseW = baseH * imgAspect;
    }

    const drawX = -baseW / 2;
    const drawY = -baseH / 2;

    // Apply Blend Mode if specified
    if (settings.blend && settings.blend !== 'normal') {
      ctx.globalCompositeOperation = settings.blend as GlobalCompositeOperation;
    }

    // Apply Adjustments (CSS filter string on canvas)
    const filters: string[] = [];
    if (settings.adjust) {
      const { brightness = 0, contrast = 0, saturation = 0, hue = 0, blur = 0 } = settings.adjust;
      if (brightness !== 0) filters.push(`brightness(${100 + brightness}%)`);
      if (contrast !== 0) filters.push(`contrast(${100 + contrast}%)`);
      if (saturation !== 0) filters.push(`saturate(${100 + saturation}%)`);
      if (hue !== 0) filters.push(`hue-rotate(${hue}deg)`);
      if (blur > 0) filters.push(`blur(${blur}px)`);
    }
    if (filters.length > 0) {
      ctx.filter = filters.join(' ');
    }

    // 4. Draw Reflection if enabled
    if (settings.reflection?.enabled) {
      ctx.save();
      const refDist = settings.reflection.distance || 10;
      const refOpacity = settings.reflection.opacity ?? 0.3;

      ctx.translate(0, baseH / 2 + refDist);
      ctx.scale(1, -1);
      ctx.globalAlpha = refOpacity;

      // Draw mirrored image
      ctx.drawImage(loadedImg, drawX, -baseH / 2, baseW, baseH);

      // Gradient mask fade
      const grad = ctx.createLinearGradient(0, -baseH / 2, 0, baseH / 2);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = grad;
      ctx.fillRect(drawX, -baseH / 2, baseW, baseH);

      ctx.restore();
    }

    // 5. Draw Shadow if enabled
    if (settings.shadow?.enabled) {
      ctx.save();
      const shadowColor = settings.shadow.color || '#000000';
      const shadowBlur = settings.shadow.blur ?? 14;
      const ox = settings.shadow.offsetX ?? 0;
      const oy = settings.shadow.offsetY ?? 8;
      const opacity = settings.shadow.opacity ?? 0.4;

      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = ox;
      ctx.shadowOffsetY = oy;
      ctx.globalAlpha = opacity;
      ctx.drawImage(loadedImg, drawX, drawY, baseW, baseH);
      ctx.restore();
    }

    // 6. Draw Outline if enabled
    if (settings.outline.enabled && settings.outline.style !== 'none') {
      const outlineColor =
        settings.outline.style === 'white'
          ? '#ffffff'
          : settings.outline.style === 'black'
          ? '#09090b'
          : settings.outline.color;

      ctx.save();
      if (settings.outline.style === 'soft') {
        ctx.shadowColor = outlineColor;
        ctx.shadowBlur = Math.max(2, settings.outline.width * 1.5);
        ctx.drawImage(loadedImg, drawX, drawY, baseW, baseH);
      } else {
        // Crisp multi-angle stroke projection
        ctx.shadowColor = outlineColor;
        ctx.shadowBlur = 1;
        const oW = Math.max(1, settings.outline.width * 0.45);
        const steps = 16;
        for (let i = 0; i < steps; i++) {
          const angle = (i * 2 * Math.PI) / steps;
          ctx.shadowOffsetX = Math.cos(angle) * oW;
          ctx.shadowOffsetY = Math.sin(angle) * oW;
          ctx.drawImage(loadedImg, drawX, drawY, baseW, baseH);
        }
      }
      ctx.restore();
    }

    // 7. Draw Main Image
    ctx.drawImage(loadedImg, drawX, drawY, baseW, baseH);

    ctx.restore();

    // 8. Render Text Overlay if defined
    if (settings.text.content && settings.text.content.trim()) {
      ctx.save();
      const fontSize = settings.text.fontSize || 32;
      const fontFamily = settings.text.fontFamily || "'Impact', 'Arial Black', sans-serif";
      ctx.font = `${settings.text.bold ? 'bold ' : ''}${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';

      let textX = settings.text.x !== undefined ? settings.text.x : size / 2;
      let textY = size - 32;
      if (settings.text.y !== undefined) {
        textY = settings.text.y;
      } else if (settings.text.align === 'top') {
        textY = 48 + fontSize;
      } else if (settings.text.align === 'center') {
        textY = size / 2 + fontSize / 3;
      }

      // Background pill badge if enabled
      if (settings.text.backgroundColor && settings.text.backgroundColor !== 'none') {
        ctx.save();
        const textMetrics = ctx.measureText(settings.text.content);
        const padX = fontSize * 0.45;
        const bW = textMetrics.width + padX * 2;
        const bH = fontSize * 1.35;
        const bX = textX - bW / 2;
        const bY = textY - fontSize * 0.95;
        const r = Math.min(10, bH / 2);

        ctx.fillStyle = settings.text.backgroundColor;
        if ((ctx as any).roundRect) {
          (ctx as any).roundRect(bX, bY, bW, bH, r);
        } else {
          ctx.rect(bX, bY, bW, bH);
        }
        ctx.fill();
        ctx.restore();
      }

      // Stroke
      const strokeColor = settings.text.strokeColor !== undefined ? settings.text.strokeColor : '#000000';
      const strokeWidth = settings.text.strokeWidth !== undefined ? settings.text.strokeWidth : Math.max(2, fontSize * 0.12);
      if (strokeWidth > 0 && strokeColor !== 'transparent') {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = 'round';
        ctx.strokeText(settings.text.content, textX, textY);
      }

      // Fill
      ctx.fillStyle = settings.text.color || '#ffffff';
      ctx.fillText(settings.text.content, textX, textY);
      ctx.restore();
    }

    // 9. Render Emoji Overlay if defined
    if (settings.emoji.symbol) {
      ctx.save();
      const emojiSize = settings.emoji.size || 48;
      ctx.font = `${emojiSize}px sans-serif`;

      let ex = size - emojiSize - 20;
      let ey = emojiSize + 20;

      if (settings.emoji.position === 'top-left') {
        ex = 20;
        ey = emojiSize + 20;
      } else if (settings.emoji.position === 'bottom-left') {
        ex = 20;
        ey = size - 20;
      } else if (settings.emoji.position === 'bottom-right') {
        ex = size - emojiSize - 20;
        ey = size - 20;
      } else if (settings.emoji.position === 'center') {
        ex = size / 2 - emojiSize / 2;
        ey = size / 2 + emojiSize / 3;
      }

      ctx.fillText(settings.emoji.symbol, ex, ey);
      ctx.restore();
    }
  }, [loadedImg, settings]);

  // Mouse drag & drop handlers for moving object
  const handleMouseDownMove = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartSettings({
      pos: { ...settings.position },
      scale: settings.scale,
      rotation: settings.rotation,
    });
  };

  // Touch drag handler for mobile/tablet
  const handleTouchStartMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setStartSettings({
      pos: { ...settings.position },
      scale: settings.scale,
      rotation: settings.rotation,
    });
  };

  // Rotate handle mouse down
  const handleMouseDownRotate = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsRotating(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartSettings({
      pos: { ...settings.position },
      scale: settings.scale,
      rotation: settings.rotation,
    });
  };

  // Rotate handle touch start
  const handleTouchStartRotate = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsRotating(true);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setStartSettings({
      pos: { ...settings.position },
      scale: settings.scale,
      rotation: settings.rotation,
    });
  };

  // Resize handle mouse down
  const handleMouseDownResize = (handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setStartSettings({
      pos: { ...settings.position },
      scale: settings.scale,
      rotation: settings.rotation,
    });
  };

  // Resize handle touch start
  const handleTouchStartResize = (handle: string, e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsResizing(handle);
    setDragStart({ x: touch.clientX, y: touch.clientY });
    setStartSettings({
      pos: { ...settings.position },
      scale: settings.scale,
      rotation: settings.rotation,
    });
  };

  // Text drag start handlers
  const handleMouseDownText = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingText(true);
    setTextDragStart({ x: e.clientX, y: e.clientY });
    const currentX = settings.text.x !== undefined ? settings.text.x : 256;
    let currentY = 460;
    if (settings.text.y !== undefined) {
      currentY = settings.text.y;
    } else if (settings.text.align === 'top') {
      currentY = 48 + (settings.text.fontSize || 32);
    } else if (settings.text.align === 'center') {
      currentY = 256;
    }
    setStartTextPos({ x: currentX, y: currentY });
  };

  const handleTouchStartText = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    setIsDraggingText(true);
    setTextDragStart({ x: touch.clientX, y: touch.clientY });
    const currentX = settings.text.x !== undefined ? settings.text.x : 256;
    let currentY = 460;
    if (settings.text.y !== undefined) {
      currentY = settings.text.y;
    } else if (settings.text.align === 'top') {
      currentY = 48 + (settings.text.fontSize || 32);
    } else if (settings.text.align === 'center') {
      currentY = 256;
    }
    setStartTextPos({ x: currentX, y: currentY });
  };

  // Global Mouse move listener
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDraggingText) {
        const canvas = canvasRef.current;
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 440, height: 440 };
        const factor = (512 / (rect.width || 440)) / zoom;
        const dx = (e.clientX - textDragStart.x) * factor;
        const dy = (e.clientY - textDragStart.y) * factor;
        const newX = Math.round(Math.max(20, Math.min(492, startTextPos.x + dx)));
        const newY = Math.round(Math.max(20, Math.min(492, startTextPos.y + dy)));
        onUpdateSettings((prev) => ({
          ...prev,
          text: {
            ...prev.text,
            x: newX,
            y: newY,
            align: 'custom',
          },
        }));
      } else if (isDragging) {
        const dx = (e.clientX - dragStart.x) / zoom;
        const dy = (e.clientY - dragStart.y) / zoom;
        onUpdateSettings((prev) => ({
          ...prev,
          position: {
            x: Math.round(startSettings.pos.x + dx),
            y: Math.round(startSettings.pos.y + dy),
          },
        }));
      } else if (isRotating) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        const angleDelta = Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
        onUpdateSettings((prev) => ({
          ...prev,
          rotation: (startSettings.rotation + angleDelta) % 360,
        }));
      } else if (isResizing) {
        const dy = dragStart.y - e.clientY;
        const scaleChange = (dy / 150) * zoom;
        const newScale = Math.max(0.2, Math.min(2.5, startSettings.scale + scaleChange));
        onUpdateSettings((prev) => ({
          ...prev,
          scale: Number(newScale.toFixed(2)),
        }));
      }
    },
    [isDragging, isDraggingText, isRotating, isResizing, dragStart, textDragStart, startSettings, startTextPos, zoom, onUpdateSettings]
  );

  // Global Touch move listener
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      if (isDraggingText) {
        if (e.cancelable) e.preventDefault();
        const canvas = canvasRef.current;
        const rect = canvas ? canvas.getBoundingClientRect() : { width: 440, height: 440 };
        const factor = (512 / (rect.width || 440)) / zoom;
        const dx = (touch.clientX - textDragStart.x) * factor;
        const dy = (touch.clientY - textDragStart.y) * factor;
        const newX = Math.round(Math.max(20, Math.min(492, startTextPos.x + dx)));
        const newY = Math.round(Math.max(20, Math.min(492, startTextPos.y + dy)));
        onUpdateSettings((prev) => ({
          ...prev,
          text: {
            ...prev.text,
            x: newX,
            y: newY,
            align: 'custom',
          },
        }));
      } else if (isDragging) {
        if (e.cancelable) e.preventDefault();
        const dx = (touch.clientX - dragStart.x) / zoom;
        const dy = (touch.clientY - dragStart.y) / zoom;
        onUpdateSettings((prev) => ({
          ...prev,
          position: {
            x: Math.round(startSettings.pos.x + dx),
            y: Math.round(startSettings.pos.y + dy),
          },
        }));
      } else if (isRotating) {
        if (e.cancelable) e.preventDefault();
        const dx = touch.clientX - dragStart.x;
        const dy = touch.clientY - dragStart.y;
        const angleDelta = Math.round(Math.atan2(dy, dx) * (180 / Math.PI));
        onUpdateSettings((prev) => ({
          ...prev,
          rotation: (startSettings.rotation + angleDelta) % 360,
        }));
      } else if (isResizing) {
        if (e.cancelable) e.preventDefault();
        const dy = dragStart.y - touch.clientY;
        const scaleChange = (dy / 150) * zoom;
        const newScale = Math.max(0.2, Math.min(2.5, startSettings.scale + scaleChange));
        onUpdateSettings((prev) => ({
          ...prev,
          scale: Number(newScale.toFixed(2)),
        }));
      }
    },
    [isDragging, isDraggingText, isRotating, isResizing, dragStart, textDragStart, startSettings, startTextPos, zoom, onUpdateSettings]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsRotating(false);
    setIsResizing(null);
    setIsDraggingText(false);
  }, []);

  useEffect(() => {
    if (isDragging || isRotating || isResizing || isDraggingText) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, isRotating, isResizing, isDraggingText, handleMouseMove, handleTouchMove, handleMouseUp]);

  // AI Prompt submission
  const handleAiSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;
    onQuickPrompt(aiPrompt);
    setAiPrompt('');
  };

  // Calculate bounding box visual size
  const boundingWidth = 360 * settings.scale;
  const boundingHeight = 360 * settings.scale;

  return (
    <div
      ref={containerRef}
      className="flex-1 bg-[#121214] flex flex-col items-center justify-between p-3 sm:p-6 relative overflow-hidden select-none"
    >
      {/* Subtle Background Studio Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Text Overlay Quick Editor Drawer */}
      {/* Text Overlay Quick Editor Drawer */}
      {showTextEditor && (
        <div className="absolute top-4 z-40 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-2xl p-3.5 shadow-2xl flex flex-col gap-2.5 animate-fade-in max-w-xl w-full">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4 text-amber-400 shrink-0" />
            <input
              type="text"
              value={settings.text.content}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  text: { ...prev.text, content: e.target.value },
                }))
              }
              placeholder="Type meme text, caption or quote..."
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              autoFocus
            />

            <input
              type="color"
              value={settings.text.color}
              onChange={(e) =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  text: { ...prev.text, color: e.target.value },
                }))
              }
              className="w-7 h-7 rounded cursor-pointer bg-transparent shrink-0"
              title="Text color"
            />

            <button
              onClick={() =>
                onUpdateSettings((prev) => ({
                  ...prev,
                  text: { ...prev.text, bold: !prev.text.bold },
                }))
              }
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors shrink-0 ${
                settings.text.bold
                  ? 'bg-amber-400 text-zinc-950 border-amber-400'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:text-white'
              }`}
              title="Toggle Bold"
            >
              B
            </button>

            <button
              onClick={onCloseTextEditor}
              className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Row 2: Font Family & Style Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 font-medium">Font:</span>
              <select
                value={settings.text.fontFamily || "'Impact', 'Arial Black', sans-serif"}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    text: { ...prev.text, fontFamily: e.target.value },
                  }))
                }
                className="bg-zinc-800 border border-zinc-700 text-xs text-zinc-200 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-400"
              >
                <option value="'Impact', 'Arial Black', sans-serif">Impact (Meme)</option>
                <option value="'Arial Black', sans-serif">Arial Black (Bold)</option>
                <option value="'Comic Sans MS', cursive">Comic (Playful)</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet (Modern)</option>
                <option value="'Georgia', serif">Georgia (Serif)</option>
                <option value="'Courier New', monospace">Courier (Typewriter)</option>
              </select>
            </div>

            {/* Quick 1-click Style Presets */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-400 mr-0.5">Style:</span>
              <button
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
                className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-white rounded border border-zinc-700 transition-colors"
                title="Classic White on Black Meme text"
              >
                Meme
              </button>
              <button
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    text: {
                      ...prev.text,
                      color: '#00f0ff',
                      strokeColor: '#003b46',
                      strokeWidth: 3,
                      backgroundColor: 'rgba(0,0,0,0.65)',
                      fontFamily: "'Trebuchet MS', sans-serif",
                      bold: true,
                    },
                  }))
                }
                className="px-2 py-0.5 text-[10px] font-bold bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 rounded border border-cyan-800 transition-colors"
                title="Neon Cyan glow with translucent pill"
              >
                Neon
              </button>
              <button
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    text: {
                      ...prev.text,
                      color: '#fde047',
                      strokeColor: '#b91c1c',
                      strokeWidth: 4,
                      backgroundColor: 'none',
                      fontFamily: "'Comic Sans MS', cursive",
                      bold: true,
                    },
                  }))
                }
                className="px-2 py-0.5 text-[10px] font-bold bg-amber-950/80 hover:bg-amber-900 text-amber-300 rounded border border-amber-800 transition-colors"
                title="Comic Pop yellow with red outline"
              >
                Comic
              </button>
              <button
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
                className="px-2 py-0.5 text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-brand-300 rounded border border-brand-500/40 transition-colors"
                title="Studio Pill badge backdrop"
              >
                Pill Badge
              </button>
            </div>
          </div>

          {/* Row 3: Size, Stroke, and Position */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-400 font-medium">Size:</span>
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
                  className="w-20 accent-amber-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[11px] font-mono text-amber-400 min-w-[28px]">{settings.text.fontSize || 32}px</span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-zinc-400 font-medium">Outline:</span>
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
                  className="w-16 accent-amber-400 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  title="Stroke width"
                />
                <input
                  type="color"
                  value={settings.text.strokeColor || '#000000'}
                  onChange={(e) =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      text: { ...prev.text, strokeColor: e.target.value },
                    }))
                  }
                  className="w-5 h-5 rounded cursor-pointer bg-transparent shrink-0"
                  title="Outline color"
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[11px] text-zinc-400 mr-1">Position:</span>
              <button
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    text: { ...prev.text, align: 'top', y: 48 + (prev.text.fontSize || 32), x: 256 },
                  }))
                }
                className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                  settings.text.align === 'top' ? 'bg-amber-400 text-zinc-950 font-semibold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Top
              </button>
              <button
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    text: { ...prev.text, align: 'center', y: 256, x: 256 },
                  }))
                }
                className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                  settings.text.align === 'center' ? 'bg-amber-400 text-zinc-950 font-semibold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Center
              </button>
              <button
                onClick={() =>
                  onUpdateSettings((prev) => ({
                    ...prev,
                    text: { ...prev.text, align: 'bottom', y: 460, x: 256 },
                  }))
                }
                className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                  settings.text.align === 'bottom' ? 'bg-amber-400 text-zinc-950 font-semibold' : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                Bottom
              </button>
              {settings.text.align === 'custom' && (
                <span className="px-2 py-0.5 text-[11px] bg-brand-500/20 text-brand-300 font-semibold rounded">
                  Custom Drag
                </span>
              )}
            </div>
          </div>

          <div className="text-[10px] text-amber-300/80 flex items-center justify-between pt-1 border-t border-zinc-800/40">
            <span>💡 Tip: Click and drag the text anywhere directly on the image!</span>
            <button
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
              className={`px-2 py-0.5 text-[10px] rounded border transition-colors ${
                settings.text.backgroundColor && settings.text.backgroundColor !== 'none'
                  ? 'bg-zinc-800 border-amber-400 text-amber-300'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:text-white'
              }`}
            >
              {settings.text.backgroundColor && settings.text.backgroundColor !== 'none'
                ? 'Pill Backdrop: On'
                : 'Pill Backdrop: Off'}
            </button>
          </div>
        </div>
      )}

      {/* Main Canvas Viewport with Zoom Scale */}
      <div className="flex-1 flex items-center justify-center w-full my-auto">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="relative transition-transform duration-75 ease-out"
        >
          {/* Canvas Wrapper with Checkerboard */}
          <div
            className={`w-[min(88vw,440px)] h-[min(88vw,440px)] max-w-[440px] max-h-[440px] rounded-2xl shadow-2xl overflow-hidden relative border border-zinc-800/80 ${
              checkerTheme === 'light' ? 'bg-checkerboard' : 'bg-checkerboard-dark'
            }`}
          >
            <canvas ref={canvasRef} className="w-full h-full object-contain pointer-events-none" />

            {/* Draggable Text Target Overlay */}
            {settings.text.content && settings.text.content.trim() && (
              <div
                style={{
                  position: 'absolute',
                  left: `${((settings.text.x !== undefined ? settings.text.x : 256) / 512) * 100}%`,
                  top: `${((settings.text.y !== undefined ? settings.text.y : (settings.text.align === 'top' ? 48 + (settings.text.fontSize || 32) : settings.text.align === 'center' ? 256 : 460)) / 512) * 100}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseDown={handleMouseDownText}
                onTouchStart={handleTouchStartText}
                className="group/text pointer-events-auto cursor-move select-none z-20 px-3 py-1.5 rounded-lg border-2 border-dashed border-amber-400/50 hover:border-amber-400 hover:bg-amber-400/10 active:border-amber-400 transition-all flex items-center justify-center touch-none shadow-md"
                title="Click and drag to position text anywhere!"
              >
                <div className="opacity-0 group-hover/text:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 bg-zinc-900/90 text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded shadow pointer-events-none whitespace-nowrap transition-opacity flex items-center gap-1 border border-zinc-700">
                  <span>Drag text anywhere</span>
                </div>
                <div className="min-w-[60px] min-h-[20px]" />
              </div>
            )}

            {/* Background Removal Spinner Overlay */}
            {isRemovingBg && (
              <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-30">
                <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
                <span className="text-xs font-semibold text-zinc-200">Segmenting background...</span>
              </div>
            )}
          </div>

          {/* Interactive Bounding Box & Handles (PhotoRoom style) */}
          <div
            style={{
              position: 'absolute',
              left: `calc(50% + ${settings.position.x}px)`,
              top: `calc(50% + ${settings.position.y}px)`,
              width: `${boundingWidth}px`,
              height: `${boundingHeight}px`,
              transform: `translate(-50%, -50%) rotate(${settings.rotation}deg)`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            onMouseDown={handleMouseDownMove}
            onTouchStart={handleTouchStartMove}
            className="group pointer-events-auto touch-none"
          >
            {/* Border outline with dash/solid */}
            <div className="w-full h-full border border-brand-500/90 rounded-lg relative pointer-events-none shadow-[0_0_15px_rgba(0,223,129,0.35)]">
              {/* Floating Action Pill directly above the object */}
              <div
                className="absolute -top-11 left-1/2 -translate-x-1/2 bg-zinc-900/95 backdrop-blur-md border border-zinc-700/80 rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-xl pointer-events-auto opacity-90 hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {/* Quick scale controls */}
                <button
                  onClick={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      scale: Math.max(0.2, Number((prev.scale - 0.1).toFixed(2))),
                    }))
                  }
                  className="px-1.5 py-0.5 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                  title="Scale down sticker"
                >
                  -
                </button>
                <span className="text-[11px] font-mono font-medium text-brand-400 min-w-[34px] text-center" title="Sticker size">
                  {Math.round(settings.scale * 100)}%
                </span>
                <button
                  onClick={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      scale: Math.min(2.5, Number((prev.scale + 0.1).toFixed(2))),
                    }))
                  }
                  className="px-1.5 py-0.5 text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                  title="Scale up sticker"
                >
                  +
                </button>

                <div className="h-3 w-px bg-zinc-700" />

                <button
                  onClick={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      position: { x: 0, y: 0 },
                      scale: 1,
                      rotation: 0,
                    }))
                  }
                  className="p-1.5 hover:text-white text-zinc-400 hover:bg-zinc-800 rounded-full transition-colors"
                  title="Reset Transform"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="h-3 w-px bg-zinc-700" />

                <button
                  onClick={() =>
                    onUpdateSettings((prev) => ({
                      ...prev,
                      position: { x: 0, y: 0 },
                    }))
                  }
                  className="p-1.5 hover:text-white text-zinc-400 hover:bg-zinc-800 rounded-full transition-colors"
                  title="Re-Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>

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
                  className="p-1.5 hover:text-white text-zinc-400 hover:bg-zinc-800 rounded-full transition-colors"
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
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
                  className="p-1.5 hover:text-white text-zinc-400 hover:bg-zinc-800 rounded-full transition-colors"
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 8 Grab Handles */}
              {/* Corner Handles */}
              <div
                onMouseDown={(e) => handleMouseDownResize('nw', e)}
                onTouchStart={(e) => handleTouchStartResize('nw', e)}
                className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-brand-500 rounded-xs cursor-nwse-resize pointer-events-auto shadow-sm"
              />
              <div
                onMouseDown={(e) => handleMouseDownResize('ne', e)}
                onTouchStart={(e) => handleTouchStartResize('ne', e)}
                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-brand-500 rounded-xs cursor-nesw-resize pointer-events-auto shadow-sm"
              />
              <div
                onMouseDown={(e) => handleMouseDownResize('sw', e)}
                onTouchStart={(e) => handleTouchStartResize('sw', e)}
                className="absolute -bottom-1.5 -left-1.5 w-4 h-4 bg-white border-2 border-brand-500 rounded-xs cursor-nesw-resize pointer-events-auto shadow-sm"
              />
              <div
                onMouseDown={(e) => handleMouseDownResize('se', e)}
                onTouchStart={(e) => handleTouchStartResize('se', e)}
                className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-brand-500 rounded-xs cursor-nwse-resize pointer-events-auto shadow-sm"
              />

              {/* Edge Handles */}
              <div
                onMouseDown={(e) => handleMouseDownResize('n', e)}
                onTouchStart={(e) => handleTouchStartResize('n', e)}
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white border border-brand-500 rounded-full cursor-ns-resize pointer-events-auto"
              />
              <div
                onMouseDown={(e) => handleMouseDownResize('s', e)}
                onTouchStart={(e) => handleTouchStartResize('s', e)}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-3 bg-white border border-brand-500 rounded-full cursor-ns-resize pointer-events-auto"
              />
              <div
                onMouseDown={(e) => handleMouseDownResize('w', e)}
                onTouchStart={(e) => handleTouchStartResize('w', e)}
                className="absolute top-1/2 -left-2 -translate-y-1/2 w-3 h-8 bg-white border border-brand-500 rounded-full cursor-ew-resize pointer-events-auto"
              />

              {/* Circular Rotation Knob on the Right Edge (PhotoRoom signature) */}
              <div
                onMouseDown={handleMouseDownRotate}
                onTouchStart={handleTouchStartRotate}
                className="absolute top-1/2 -right-7 -translate-y-1/2 w-7 h-7 rounded-full bg-white border-2 border-brand-500 flex items-center justify-center cursor-grab active:cursor-grabbing pointer-events-auto shadow-lg hover:scale-110 active:scale-95 transition-transform"
                title="Rotate Object"
              >
                <RotateCw className="w-4 h-4 text-brand-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating PhotoRoom-style AI Prompt Bar */}
      <div className="w-full max-w-xl z-20 space-y-2">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-1 text-[11px] text-zinc-400 no-scrollbar px-1">
          <button
            onClick={() => onQuickPrompt('neon glow')}
            className="px-2.5 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Neon Glow</span>
          </button>
          <button
            onClick={() => onQuickPrompt('die cut sticker')}
            className="px-2.5 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors shrink-0"
          >
            White Border
          </button>
          <button
            onClick={() => onQuickPrompt('3d float')}
            className="px-2.5 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors shrink-0"
          >
            3D Elevation
          </button>
          <button
            onClick={() => onQuickPrompt('pop art')}
            className="px-2.5 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors shrink-0"
          >
            Pop Art Comic
          </button>
        </div>

        {/* AI Prompt Input Bar */}
        <form
          onSubmit={handleAiSubmit}
          className="flex items-center bg-zinc-900/90 backdrop-blur-md border border-zinc-800 rounded-full px-4 py-1.5 shadow-2xl focus-within:border-brand-500 transition-all"
        >
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe an edit (e.g. add electric neon border, floating shadow)..."
            className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none px-2"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Mode Tag */}
            <div className="flex items-center bg-zinc-800 rounded-full p-0.5 text-[10px] font-semibold text-zinc-400">
              <button
                type="button"
                onClick={() => setAiMode('Standard')}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  aiMode === 'Standard' ? 'bg-zinc-700 text-white' : 'hover:text-zinc-200'
                }`}
              >
                Standard
              </button>
              <button
                type="button"
                onClick={() => setAiMode('1K')}
                className={`px-2 py-0.5 rounded-full transition-colors ${
                  aiMode === '1K' ? 'bg-brand-500 text-zinc-950 font-bold' : 'hover:text-zinc-200'
                }`}
              >
                1K
              </button>
            </div>

            {/* Submit Arrow Button */}
            <button
              type="submit"
              disabled={!aiPrompt.trim()}
              className="w-7 h-7 rounded-full bg-brand-500 hover:bg-brand-400 disabled:opacity-30 disabled:hover:bg-brand-500 flex items-center justify-center text-zinc-950 transition-colors"
            >
              <ArrowUp className="w-4 h-4 font-bold" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
