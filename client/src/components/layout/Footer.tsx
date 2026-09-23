import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Layers,
  Wand2,
  CheckCircle2,
  Download,
  Github,
  Twitter,
  MessageCircle,
  ExternalLink,
  Send,
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const { success } = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    success('Thank you for subscribing to StickerForge updates!');
    setEmail('');
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 mt-auto selection:bg-brand-500 selection:text-white">
      {/* Top Banner: Newsletter / Creator updates */}
      <div className="border-b border-zinc-800/60 bg-gradient-to-b from-zinc-900/50 to-zinc-950 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All Systems Operational
              </span>
              <span className="text-xs text-zinc-500">Sharp v0.33 • Vite v6</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Get the latest sticker templates & exporter updates
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              New die-cut styles, Telegram pack enhancements, and creator features delivered monthly.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
            <div className="relative flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@example.com"
                required
                className="w-full px-3.5 py-2 text-xs rounded-lg bg-zinc-900 border border-zinc-700/80 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={subscribed}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-zinc-950 bg-brand-500 hover:bg-brand-400 active:bg-brand-600 rounded-lg shadow-sm transition-all shrink-0 disabled:opacity-75"
            >
              {subscribed ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Subscribed</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Subscribe</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Main Multi-Column Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand Info (Spans 2 columns on lg) */}
          <div className="sm:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white border border-zinc-800 flex items-center justify-center font-bold shadow-md group-hover:border-brand-500/50 transition-colors">
                <Sparkles className="w-5 h-5 text-brand-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold text-white tracking-tight leading-none">
                  Sticker<span className="text-brand-400">Forge</span>
                </span>
                <span className="text-[11px] text-zinc-500 font-mono mt-0.5">Studio Edition</span>
              </div>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              The full-stack smart sticker creation suite. Instant smart cutout, die-cut outlines, custom typography, and automated export pipelines for messaging apps.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                WhatsApp (512×512 WebP)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Telegram TGS & PNG
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-900 border border-zinc-800 text-zinc-300">
                <Shield className="w-3 h-3 text-brand-400" />
                SSRF Guarded
              </span>
            </div>
          </div>

          {/* Column 2: Studio Tools */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3.5">
              Studio Tools
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link to="/create" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Wand2 className="w-3 h-3 text-brand-400" />
                  <span>Smart Cutout AI</span>
                </Link>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Die-Cut Contours
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Typography & Captions
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Drop Shadows & Glow
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Curated Presets
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Collections & Formats */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3.5">
              Export Formats
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link to="/packs" className="hover:text-white transition-colors flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-brand-400" />
                  <span>Sticker Packs</span>
                </Link>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Animated & Static WebP
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Telegram TGS Exporter
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Discord Custom Emotes
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default flex items-center gap-1.5">
                  <Download className="w-3 h-3 text-zinc-500" />
                  <span>Batch ZIP Archiving</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Platform & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-wider mb-3.5">
              Platform & Security
            </h4>
            <ul className="space-y-2.5 text-xs text-zinc-400">
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>Open Source Core</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600" />
                </a>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Zero Data Retention
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  SSRF Protection Layer
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-default">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="mt-12 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <p>© {new Date().getFullYear()} StickerForge Inc. All rights reserved.</p>
            <span className="hidden sm:inline text-zinc-800">•</span>
            <p>Engineered for high-fidelity messaging stickers</p>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:text-white hover:bg-zinc-900 transition-colors"
              title="GitHub"
              aria-label="GitHub"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:text-white hover:bg-zinc-900 transition-colors"
              title="Twitter / X"
              aria-label="Twitter"
            >
              <Twitter className="w-4 h-4" />
            </a>
            <a
              href="https://t.me"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-md hover:text-white hover:bg-zinc-900 transition-colors"
              title="Telegram"
              aria-label="Telegram"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
