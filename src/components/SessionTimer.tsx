import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Clock, AlertTriangle } from 'lucide-react';

// 13 minutes idle time before warning, then 2 minute warning period
const TIMEOUT_MS = 15 * 60 * 1000;
const WARNING_MS = 2 * 60 * 1000;

export const SessionTimer = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_MS / 1000);
  const { logout } = useStore();
  const navigate = useNavigate();

  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const warningId = useRef<NodeJS.Timeout | null>(null);
  const countdownId = useRef<NodeJS.Timeout | null>(null);

  const clearAllTimers = () => {
    if (timeoutId.current) clearTimeout(timeoutId.current);
    if (warningId.current) clearTimeout(warningId.current);
    if (countdownId.current) clearInterval(countdownId.current);
  };

  const handleLogout = useCallback(() => {
    clearAllTimers();
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const resetTimer = useCallback(() => {
    if (showWarning) return; // Do not reset if warning is showing

    clearAllTimers();

    warningId.current = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(WARNING_MS / 1000);
    }, TIMEOUT_MS - WARNING_MS);

    timeoutId.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_MS);
  }, [showWarning, handleLogout]);

  const handleContinue = () => {
    setShowWarning(false);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer();
      }
    };

    events.forEach(event => document.addEventListener(event, handleActivity));

    resetTimer();

    return () => {
      events.forEach(event => document.removeEventListener(event, handleActivity));
      clearAllTimers();
    };
  }, [resetTimer, showWarning]);

  useEffect(() => {
    if (showWarning) {
      countdownId.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownId.current) clearInterval(countdownId.current);
      };
    } else {
      resetTimer();
    }
  }, [showWarning, resetTimer]);

  useEffect(() => {
    if (showWarning && timeLeft === 0) {
      handleLogout();
    }
  }, [showWarning, timeLeft, handleLogout]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-xl shadow-xl border border-rose-100 dark:border-rose-900/50 overflow-hidden flex flex-col p-6 animate-in fade-in duration-200">
        <div className="flex items-start gap-4 mb-4">
           <div className="p-3 bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 rounded-full shrink-0">
             <AlertTriangle className="w-6 h-6" />
           </div>
           <div>
             <h2 className="font-semibold text-lg text-slate-900 dark:text-white mb-1">Session Expiring Soon</h2>
             <p className="text-sm text-slate-600 dark:text-slate-400">
               Due to inactivity, your session will expire to protect sensitive patient records.
             </p>
           </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg mb-6 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Time Remaining</span>
          </div>
          <span className="font-mono text-3xl font-bold text-slate-800 dark:text-slate-200">
           {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex justify-end gap-3">
          <button 
             onClick={handleLogout}
             className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
          >
             Log Out Now
          </button>
          <button 
             onClick={handleContinue}
             className="px-4 py-2 text-sm font-medium bg-sky-600 text-white hover:bg-sky-700 rounded-md transition-colors shadow-sm"
          >
             Continue Session
          </button>
        </div>
      </div>
    </div>
  );
};
