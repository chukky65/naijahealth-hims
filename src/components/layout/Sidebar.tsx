import React, { useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Pill, Users, BrainCircuit, Settings, Activity, LogOut, Sun, Moon, Calendar, Receipt, Contact, History, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useStore } from '../../store/useStore';
import { UserRole } from '../../types';
import { useTranslation } from 'react-i18next';

interface NavItem {
  name: string;
  key: string;
  path: string;
  icon: React.ElementType;
  roles: UserRole[];
}

export const Sidebar = () => {
  const navigate = useNavigate();
  const { theme, setTheme, logout, user } = useStore();
  const { t } = useTranslation();
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const allNavItems: NavItem[] = [
    { name: 'Dashboard', key: 'dashboard', path: '/', icon: LayoutDashboard, roles: ['MedicalDirector', 'Doctor', 'Pharmacist', 'Admin', 'Receptionist'] },
    { name: 'My Portal', key: 'myPortal', path: '/portal', icon: User, roles: ['Patient'] },
    { name: 'Appointments', key: 'appointments', path: '/appointments', icon: Calendar, roles: ['MedicalDirector', 'Doctor', 'Receptionist', 'Admin'] },
    { name: 'Billing', key: 'billing', path: '/billing', icon: Receipt, roles: ['MedicalDirector', 'Admin', 'Receptionist'] },
    { name: 'Departments', key: 'departments', path: '/departments', icon: Building2, roles: ['MedicalDirector', 'Admin'] },
    { name: 'Pharmacy', key: 'pharmacy', path: '/pharmacy', icon: Pill, roles: ['MedicalDirector', 'Pharmacist', 'Admin'] },
    { name: 'Patients', key: 'patients', path: '/patients', icon: Users, roles: ['MedicalDirector', 'Doctor', 'Receptionist', 'Admin'] },
    { name: 'Staff', key: 'staff', path: '/staff', icon: Contact, roles: ['MedicalDirector', 'Admin'] },
    { name: 'AI & Analytics', key: 'analytics', path: '/analytics', icon: BrainCircuit, roles: ['MedicalDirector', 'Admin'] },
    { name: 'Audit Log', key: 'auditLog', path: '/audit-log', icon: History, roles: ['MedicalDirector', 'Admin'] },
    { name: 'Settings', key: 'settings', path: '/settings', icon: Settings, roles: ['MedicalDirector', 'Admin'] },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const visibleNavItems = allNavItems.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="flex flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-screen shrink-0">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded flex items-center justify-center font-bold text-white shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">N-HIMS Elite</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2 px-5">{t('nav.commandCenter')}</div>
        <ul className="space-y-1 px-4">
          {visibleNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm border-l-2',
                    isActive
                      ? 'bg-sky-600/10 text-sky-400 border-sky-500 font-medium'
                      : 'text-slate-400 hover:bg-slate-800 border-transparent'
                  )
                }
              >
                <item.icon className="w-4 h-4" />
                {t(`nav.${item.key}`)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-slate-800 space-y-2">
        <button 
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-300"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          {theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}
        </button>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm text-rose-400 hover:bg-slate-800 hover:text-rose-300"
        >
          <LogOut className="w-4 h-4" />
          {t('nav.signOut')}
        </button>
        <div className="text-xs text-slate-500 px-3 pt-2">
          <p>HIMS Enterprise v1.0.0</p>
        </div>
      </div>
    </div>
  );
};
