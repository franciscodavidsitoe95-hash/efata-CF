import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  Terminal, 
  Server, 
  LayoutDashboard, 
  Users, 
  Database, 
  BarChart3,
  Settings,
  Bell,
  Calendar,
  Lock,
  Activity,
  ShieldAlert,
  ShieldCheck,
  Wallet
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (onClose) onClose();
  };

  const isActive = (path: string) => location.pathname === path;

  const mainItems = [
    { label: 'Ops Dashboard', path: '/dashboard', icon: LayoutDashboard, color: 'text-brand-blue' },
  ];

  const operationsItems = [
    { label: 'Infraestrutura', path: '/projects', icon: Server, color: 'text-brand-indigo' },
    { label: 'Orçamentos', path: '/budgets', icon: Wallet, color: 'text-brand-green' },
    { label: 'Intelligence', path: '/reports', icon: BarChart3, color: 'text-brand-orange' },
  ];

  const adminItems = [];
  if (user?.role === 'admin') {
    adminItems.push({ label: 'Identidades', path: '/users', icon: ShieldAlert, color: 'text-brand-indigo' });
    adminItems.push({ label: 'Kernel Audit', path: '/logs', icon: Database, color: 'text-brand-red' });
  }

  const NavItem = ({ item }: { item: any, [key: string]: any }) => (
    <button
      onClick={() => handleNavigate(item.path)}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 group ${
        isActive(item.path) 
          ? 'bg-brand-indigo text-white shadow-[0_12px_24px_-8px_rgba(79,70,229,0.4)]' 
          : 'text-gray-400 hover:text-brand-indigo hover:bg-white'
      }`}
    >
      <item.icon className={`h-4 w-4 transition-colors ${isActive(item.path) ? 'text-white' : `${item.color || 'text-gray-400'} group-hover:text-brand-indigo`}`} />
      <span>{item.label}</span>
      {isActive(item.path) && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"></div>}
    </button>
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brand-slate/40 backdrop-blur-sm z-[50] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-72 bg-brand-cream border-r border-brand-cream-dark flex flex-col transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:h-screen lg:overflow-y-auto
        ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8">
          <div className="flex items-center space-x-3 mb-10 cursor-pointer group" onClick={() => handleNavigate('/dashboard')}>
            <div className="p-2.5 bg-brand-indigo rounded-2xl shadow-xl shadow-brand-indigo/20 group-hover:scale-110 transition-transform">
              <Terminal className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-brand-slate tracking-tighter uppercase">Efata<span className="text-brand-indigo">.</span>IT</span>
          </div>

          <nav className="space-y-8">
            <div>
              <div className="space-y-1.5">
                {mainItems.map(item => <NavItem key={item.path} item={item} />)}
              </div>
            </div>

            <div>
              <div className="px-4 text-[9px] font-black uppercase tracking-[0.25em] text-gray-300 mb-4 items-center flex">
                 <div className="w-1.5 h-1.5 rounded-full bg-brand-indigo/20 mr-2"></div>
                 Operações de Rede
              </div>
              <div className="space-y-1.5">
                {operationsItems.map(item => <NavItem key={item.path} item={item} />)}
              </div>
            </div>

            {adminItems.length > 0 && (
              <div>
                <div className="px-4 text-[9px] font-black uppercase tracking-[0.25em] text-gray-300 mb-4 items-center flex">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-red/20 mr-2"></div>
                  Privileged Access
                </div>
                <div className="space-y-1.5">
                  {adminItems.map(item => <NavItem key={item.path} item={item} />)}
                </div>
              </div>
            )}

            <div>
              <div className="px-4 text-[9px] font-black uppercase tracking-[0.25em] text-gray-300 mb-4 items-center flex">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-200 mr-2"></div>
                Settings / Config
              </div>
              <div className="space-y-1.5">
                <NavItem item={{ label: 'Preferências', path: '/preferences', icon: Settings, color: 'text-gray-400' }} />
              </div>
            </div>
          </nav>
        </div>

        <div className="mt-auto p-4 flex flex-col gap-4">
          {/* Network Status Card */}
          <div className="p-5 bg-brand-cream-dark border border-brand-cream-dark rounded-[2.5rem] text-brand-slate relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 -m-6 w-24 h-24 bg-brand-indigo/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-slate/40 mb-1 leading-none">Status da Rede</span>
                <p className="text-[10px] font-black tracking-widest uppercase text-brand-indigo mt-1">99.8% UPTIME</p>
              </div>
              <div className="p-2 bg-brand-green-light rounded-xl shrink-0">
                 <Activity className="h-4 w-4 text-brand-green animate-pulse" />
              </div>
            </div>
          </div>

          {/* User Card */}
          <div className="flex items-center space-x-3 p-3 bg-white border border-brand-cream-dark rounded-[2.5rem] shadow-xl shadow-brand-slate/5">
            <div className="h-12 w-12 shrink-0 rounded-2xl bg-brand-blue flex items-center justify-center font-black text-white text-xs border border-brand-blue/20 shadow-lg shadow-brand-blue/20">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'IT'}
            </div>
            <div className="flex-1 min-w-0 px-1">
              <p className="text-[10px] font-black text-brand-slate uppercase tracking-tight truncate">{user?.name}</p>
              <p className="text-[8px] font-black text-brand-blue uppercase tracking-widest flex items-center mt-0.5">
                <ShieldCheck className="h-3 w-3 mr-1" />
                {user?.role}
              </p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 shrink-0 hover:bg-brand-red hover:text-white text-brand-red/40 transition-all rounded-[1.5rem] border border-transparent hover:border-brand-red/20 shadow-sm"
              title="Log Out Protocol"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
