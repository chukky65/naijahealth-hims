import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, Globe, Wifi, WifiOff, Menu } from 'lucide-react';
import { mockNigerianContext } from '../../data/mockData';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import { useTranslation } from 'react-i18next';

export const Header = () => {
  const { user, isMobileMenuOpen, setMobileMenuOpen } = useStore();
  const { i18n } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden sm:flex items-center text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-64 md:w-96 focus-within:ring-2 ring-sky-500/50">
          <Search className="w-4 h-4 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            aria-label="Search"
            className="bg-transparent border-none outline-none w-full text-sm dark:text-slate-200"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-6">
        <div className="hidden lg:flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-200 dark:border-slate-700">
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-600 dark:text-rose-400 font-medium animate-pulse">Offline</span>
              </>
            )}
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-500">Power Source</span>
            <span className={cn('font-bold', mockNigerianContext.powerStatus === 'Grid' ? 'text-green-500' : 'text-amber-500')}>
              {mockNigerianContext.powerStatus}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-slate-500">Gen Fuel</span>
            <span className={cn('font-bold', mockNigerianContext.generatorFuelLevel < 30 ? 'text-red-500' : 'text-amber-500')}>
              {mockNigerianContext.generatorFuelLevel}%
            </span>
          </div>
        </div>

        <div className="relative" ref={langDropdownRef}>
          <button 
            aria-label="Toggle Language" 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium text-xs uppercase focus:outline-none"
          >
            <Globe className="w-4 h-4" />
            {i18n.language}
          </button>
          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-50 border border-slate-200 dark:border-slate-700">
              {[
                { code: 'en', label: 'English' },
                { code: 'pcm', label: 'Pidgin' },
                { code: 'ha', label: 'Hausa' },
                { code: 'yo', label: 'Yoruba' },
                { code: 'ig', label: 'Igbo' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    i18n.changeLanguage(lang.code);
                    setIsLangOpen(false);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm ${i18n.language === lang.code ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button aria-label="Notifications" className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 border-l border-slate-200 dark:border-slate-800 sm:pl-6">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button aria-label="User Profile" className="flex items-center space-x-3 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-md">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
            {user?.name?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs text-slate-900 dark:text-white font-semibold">{user?.name || 'Unknown User'}</span>
            <span className="text-[10px] text-slate-500 italic">{user?.role || 'Guest'}</span>
          </div>
        </button>
      </div>
    </header>
  );
};
