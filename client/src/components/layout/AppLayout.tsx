import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isEditor = location.pathname.startsWith('/editor');

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      {!isEditor && <Footer />}
    </div>
  );
};
