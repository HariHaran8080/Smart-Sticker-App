import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Layers, Image as ImageIcon, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-zinc-900 text-white flex items-center justify-center font-bold shadow-sm group-hover:bg-zinc-800 transition-colors">
              <Sparkles className="w-5 h-5 text-brand-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold text-zinc-900 tracking-tight leading-none">
                Sticker<span className="text-brand-600">Forge</span>
              </span>
              <span className="text-[11px] text-zinc-600 font-mono font-medium">v1.0</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            {user && (
              <>
                <Link
                  to="/stickers"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/stickers') ? 'text-brand-600' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>My Stickers</span>
                </Link>

                <Link
                  to="/packs"
                  className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                    isActive('/packs') ? 'text-brand-600' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>Sticker Packs</span>
                </Link>
              </>
            )}
          </div>

          {/* Auth Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-xs text-right leading-tight">
                  <p className="font-semibold text-zinc-900">{user.name}</p>
                  <p className="text-zinc-600 text-[11px]">{user.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-red-600 border border-zinc-200 hover:border-red-200 rounded-md transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-zinc-700 hover:text-zinc-900 rounded-md transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md shadow-sm transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-600 hover:text-zinc-900 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-4 pt-3 pb-4 space-y-2">
          {user ? (
            <>
              <Link
                to="/stickers"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium text-zinc-800"
              >
                <ImageIcon className="w-4 h-4 text-brand-600" />
                My Stickers
              </Link>
              <Link
                to="/packs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-sm font-medium text-zinc-800"
              >
                <Layers className="w-4 h-4 text-brand-600" />
                Sticker Packs
              </Link>
              <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                <span className="text-xs text-zinc-500">{user.email}</span>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-red-600"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-zinc-100 flex gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-medium border border-zinc-200 rounded-md"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-sm font-medium text-white bg-zinc-900 rounded-md"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
