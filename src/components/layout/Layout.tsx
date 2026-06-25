import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Outlet } from 'react-router-dom';
import { SessionTimer } from '../SessionTimer';

export const Layout = () => {
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden">
      <SessionTimer />
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
