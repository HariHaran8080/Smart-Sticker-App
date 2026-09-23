import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Logged in successfully');

      const returnTo = location.state?.returnTo || '/stickers';
      const stickerState = location.state?.stickerState;
      navigate(returnTo, { state: stickerState });
    } catch (err: any) {
      error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-brand-400" />
          </div>
        </div>
        <h1 className="text-center text-2xl font-bold tracking-tight text-zinc-900">
          Sign in to StickerForge
        </h1>
        <p className="mt-1 text-center text-xs text-zinc-600">
          Save your stickers, create collections, and download packs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-zinc-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors mt-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500">
                Sign up free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
