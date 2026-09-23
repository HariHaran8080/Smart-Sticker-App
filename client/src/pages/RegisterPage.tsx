import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      error('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password);
      success('Account created successfully');
      navigate('/stickers');
    } catch (err: any) {
      error(err.response?.data?.message || 'Failed to create account');
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
          Create your StickerForge account
        </h1>
        <p className="mt-1 text-center text-xs text-zinc-600">
          Sync your stickers across devices, create collections, and export packs.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-xl border border-zinc-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Full Name / Nickname
              </label>
              <input
                id="register-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivers"
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-zinc-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label htmlFor="register-email" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                id="register-email"
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
              <label htmlFor="register-password" className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-1.5">
                Password (min 6 characters)
              </label>
              <input
                id="register-password"
                type="password"
                required
                autoComplete="new-password"
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-100 text-center">
            <p className="text-xs text-zinc-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
