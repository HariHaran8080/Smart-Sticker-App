import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Wand2, Shield, Layers, Download, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100 mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer-grade sticker utility</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-zinc-900 tracking-tight leading-[1.15]">
            Create custom stickers <br className="hidden sm:inline" />
            from any image or URL.
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-lg text-zinc-600 leading-relaxed">
            Upload an image, remove the background automatically, add true die-cut sticker outlines,
            custom text and emojis, and download ready for WhatsApp, Telegram, or Discord.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/create"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-zinc-900 hover:bg-zinc-800 rounded-lg shadow-sm transition-all hover:gap-3"
            >
              <span>Create Sticker</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              How it works
            </a>
          </div>

          {/* Quick interactive visual demo card */}
          <div className="mt-14 max-w-3xl mx-auto rounded-xl border border-zinc-200 bg-zinc-50 p-3 sm:p-5 shadow-sm">
            <div className="bg-white rounded-lg border border-zinc-200/80 p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-16 h-16 rounded-xl bg-checkerboard border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                  <span className="text-3xl select-none">🔥</span>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">Instant Sticker Creation</h2>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    No signup required for quick downloads. 512×512 WebP & transparent PNG.
                  </p>
                </div>
              </div>

              <Link
                to="/create"
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-md border border-brand-200 transition-colors whitespace-nowrap text-center"
              >
                Try an Example
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-zinc-50 border-b border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Three simple steps
            </h2>
            <p className="text-sm text-zinc-600 mt-2">
              From source image to messaging sticker in under 10 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold text-sm mb-4">
                1
              </div>
              <h2 className="text-base font-bold text-zinc-900">Upload or Paste URL</h2>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                Drag and drop your meme or photo, or paste any direct web image URL. Safe SSRF protection blocks malicious addresses.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center font-bold text-sm mb-4">
                2
              </div>
              <h2 className="text-base font-bold text-zinc-900">Cutout & Style</h2>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                One-click background removal, authentic die-cut sticker contour borders (white/black/custom), rotation, text, and emojis.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm mb-4">
                3
              </div>
              <h2 className="text-base font-bold text-zinc-900">Download or Collect</h2>
              <p className="text-sm text-zinc-600 mt-2 leading-relaxed">
                Download transparent WebP or PNG immediately, or save into your personal library and export full sticker packs as a ZIP.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
              Designed for practical utility
            </h2>
            <p className="text-sm text-zinc-600 mt-2">
              Everything you need to produce real, high-quality stickers without clutter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
              <Wand2 className="w-5 h-5 text-brand-600 mb-3" />
              <h2 className="text-sm font-bold text-zinc-900">Smart Background Removal</h2>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Pluggable service architecture supporting external APIs and zero-config local segmentation fallback.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
              <Sparkles className="w-5 h-5 text-brand-600 mb-3" />
              <h2 className="text-sm font-bold text-zinc-900">Die-Cut Contour Borders</h2>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Sharp programmatic alpha-dilation generates true sticker-like contour outlines around the subject.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
              <Download className="w-5 h-5 text-brand-600 mb-3" />
              <h2 className="text-sm font-bold text-zinc-900">WhatsApp & Telegram Presets</h2>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Strict 512x512 square transparent WebP export optimized for mobile messaging apps.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
              <Layers className="w-5 h-5 text-brand-600 mb-3" />
              <h2 className="text-sm font-bold text-zinc-900">Sticker Packs & ZIP Export</h2>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Group stickers into curated packs and download all items together in a single clean ZIP archive.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
              <Shield className="w-5 h-5 text-brand-600 mb-3" />
              <h2 className="text-sm font-bold text-zinc-900">SSRF & File Protection</h2>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Strict DNS and private IP blocking safeguards remote fetching against internal network requests.
              </p>
            </div>

            <div className="p-5 rounded-lg border border-zinc-200 hover:border-zinc-300 transition-colors">
              <CheckCircle2 className="w-5 h-5 text-brand-600 mb-3" />
              <h2 className="text-sm font-bold text-zinc-900">No Forced Sign-Up</h2>
              <p className="text-xs text-zinc-600 mt-1.5 leading-relaxed">
                Guests can edit and download immediate stickers without creating an account or paying fees.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
