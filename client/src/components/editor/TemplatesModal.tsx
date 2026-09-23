import React from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { StickerSettings } from '../../types';

export interface TemplatePreset {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  previewBg: string;
  settings: Partial<StickerSettings>;
}

export const TEMPLATE_PRESETS: TemplatePreset[] = [
  {
    id: 'classic-die-cut',
    name: 'Classic Die-Cut',
    category: 'Stickers',
    description: 'Thick white vinyl border with soft subtle drop shadow.',
    badge: 'Popular',
    previewBg: 'from-amber-500/20 to-orange-500/20',
    settings: {
      outline: {
        enabled: true,
        style: 'white',
        color: '#ffffff',
        width: 10,
      },
      shadow: {
        enabled: true,
        color: '#000000',
        blur: 14,
        offsetX: 0,
        offsetY: 8,
        opacity: 0.35,
      },
      reflection: { enabled: false, opacity: 0, distance: 0 },
      adjust: { brightness: 0, contrast: 5, saturation: 10, hue: 0, blur: 0 },
    },
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    category: 'Glow',
    description: 'Electric cyan and magenta aura with amplified saturation.',
    badge: 'Trending',
    previewBg: 'from-cyan-500/20 to-fuchsia-500/20',
    settings: {
      outline: {
        enabled: true,
        style: 'custom',
        color: '#00ffff',
        width: 8,
      },
      shadow: {
        enabled: true,
        color: '#ff00ff',
        blur: 24,
        offsetX: 0,
        offsetY: 0,
        opacity: 0.75,
      },
      reflection: { enabled: false, opacity: 0, distance: 0 },
      adjust: { brightness: 5, contrast: 20, saturation: 35, hue: 0, blur: 0 },
    },
  },
  {
    id: '3d-float',
    name: '3D Floating Badge',
    category: 'Modern',
    description: 'High elevation float shadow with subtle floor reflection.',
    badge: 'PhotoRoom',
    previewBg: 'from-brand-500/20 to-teal-500/20',
    settings: {
      outline: {
        enabled: true,
        style: 'soft',
        color: '#ffffff',
        width: 6,
      },
      shadow: {
        enabled: true,
        color: '#000000',
        blur: 28,
        offsetX: 0,
        offsetY: 22,
        opacity: 0.5,
      },
      reflection: {
        enabled: true,
        opacity: 0.25,
        distance: 12,
      },
      adjust: { brightness: 0, contrast: 10, saturation: 5, hue: 0, blur: 0 },
    },
  },
  {
    id: 'comic-pop',
    name: 'Comic Pop Art',
    category: 'Illustration',
    description: 'Crisp bold black contour stroke with punchy vibrance.',
    badge: 'Classic',
    previewBg: 'from-yellow-500/20 to-red-500/20',
    settings: {
      outline: {
        enabled: true,
        style: 'black',
        color: '#09090b',
        width: 12,
      },
      shadow: {
        enabled: true,
        color: '#000000',
        blur: 2,
        offsetX: 6,
        offsetY: 6,
        opacity: 0.8,
      },
      reflection: { enabled: false, opacity: 0, distance: 0 },
      adjust: { brightness: 5, contrast: 25, saturation: 25, hue: 0, blur: 0 },
    },
  },
  {
    id: 'hologram-foil',
    name: 'Hologram Foil',
    category: 'Luxury',
    description: 'Iridescent metallic outline with ethereal backlight.',
    badge: 'Pro',
    previewBg: 'from-emerald-500/20 to-teal-500/20',
    settings: {
      outline: {
        enabled: true,
        style: 'custom',
        color: '#00DF81',
        width: 8,
      },
      shadow: {
        enabled: true,
        color: '#38bdf8',
        blur: 20,
        offsetX: 0,
        offsetY: 4,
        opacity: 0.6,
      },
      reflection: { enabled: true, opacity: 0.35, distance: 8 },
      adjust: { brightness: 10, contrast: 15, saturation: 20, hue: 15, blur: 0 },
    },
  },
  {
    id: 'clean-minimal',
    name: 'Clean Studio Cutout',
    category: 'Product',
    description: 'Pure borderless cutout with soft contact ground shadow.',
    badge: 'Minimal',
    previewBg: 'from-zinc-500/20 to-zinc-700/20',
    settings: {
      outline: {
        enabled: false,
        style: 'none',
        color: '#ffffff',
        width: 0,
      },
      shadow: {
        enabled: true,
        color: '#000000',
        blur: 16,
        offsetX: 0,
        offsetY: 12,
        opacity: 0.3,
      },
      reflection: { enabled: false, opacity: 0, distance: 0 },
      adjust: { brightness: 0, contrast: 0, saturation: 0, hue: 0, blur: 0 },
    },
  },
];

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (preset: TemplatePreset) => void;
  currentTemplateId?: string;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  currentTemplateId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Sticker Studio Templates</h3>
              <p className="text-xs text-zinc-400">Instant professional styling, borders, and lighting presets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEMPLATE_PRESETS.map((preset) => {
            const isSelected = currentTemplateId === preset.id;
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onApplyTemplate(preset);
                  onClose();
                }}
                className={`relative group p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 bg-gradient-to-br ${
                  isSelected
                    ? 'border-brand-500 bg-brand-950/30 ring-1 ring-brand-500/50'
                    : 'border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    {preset.category}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    {preset.badge}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                  {preset.name}
                </h4>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                    <span>Click to apply</span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-medium text-brand-400">
                      <Check className="w-3.5 h-3.5" /> Applied
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
