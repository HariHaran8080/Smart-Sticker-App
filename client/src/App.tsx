import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';

import { LandingPage } from './pages/LandingPage';
import { CreatePage } from './pages/CreatePage';
import { EditorPage } from './pages/EditorPage';
import { MyStickersPage } from './pages/MyStickersPage';
import { PacksPage } from './pages/PacksPage';
import { PackDetailPage } from './pages/PackDetailPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route
                path="/stickers"
                element={
                  <ProtectedRoute>
                    <MyStickersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/packs"
                element={
                  <ProtectedRoute>
                    <PacksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/packs/:id"
                element={
                  <ProtectedRoute>
                    <PackDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
