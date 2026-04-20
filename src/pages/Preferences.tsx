import React, { useState, useEffect } from 'react';
import { Settings, Moon, Sun, Bell, Globe } from 'lucide-react';
import { getData, saveData } from '../lib/storage';

export default function Preferences() {
  const [prefs, setPrefs] = useState({ theme: 'light', notifications: true });

  useEffect(() => {
    const stored = getData('PREFERENCES');
    if (stored) setPrefs(stored);
  }, []);

  const toggleTheme = () => {
    const newTheme = prefs.theme === 'light' ? 'dark' : 'light';
    const newPrefs = { ...prefs, theme: newTheme };
    setPrefs(newPrefs);
    saveData('PREFERENCES', newPrefs);
  };

  const toggleNotifications = () => {
    const newPrefs = { ...prefs, notifications: !prefs.notifications };
    setPrefs(newPrefs);
    saveData('PREFERENCES', newPrefs);
  };

  return (
    <div className="p-8 lg:p-12">
      <h1 className="text-4xl font-black text-brand-slate flex items-center mb-12 tracking-tight">
        <Settings className="h-8 w-8 mr-4 text-brand-indigo"/> Preferências
      </h1>

      <div className="bg-white rounded-[3rem] p-8 border border-brand-cream-dark shadow-xl space-y-8 max-w-2xl">
        <div className="flex items-center justify-between p-6 bg-brand-cream rounded-2xl">
          <div className="flex items-center space-x-4">
            {prefs.theme === 'light' ? <Sun className="h-6 w-6 text-brand-orange" /> : <Moon className="h-6 w-6 text-brand-indigo" />}
            <div>
              <h3 className="font-black text-brand-slate uppercase text-sm">Tema Visual</h3>
              <p className="text-xs text-gray-500 font-bold">Alternar entre modo claro e escuro.</p>
            </div>
          </div>
          <button onClick={toggleTheme} className="px-6 py-2 bg-brand-indigo text-white font-black text-xs rounded-xl hover:bg-brand-blue">
            Alterar
          </button>
        </div>

        <div className="flex items-center justify-between p-6 bg-brand-cream rounded-2xl">
          <div className="flex items-center space-x-4">
            <Bell className="h-6 w-6 text-brand-indigo" />
            <div>
              <h3 className="font-black text-brand-slate uppercase text-sm">Notificações</h3>
              <p className="text-xs text-gray-500 font-bold">Receber alertas de sistema.</p>
            </div>
          </div>
          <button onClick={toggleNotifications} className={`px-6 py-2 font-black text-xs rounded-xl ${prefs.notifications ? 'bg-brand-green text-white' : 'bg-gray-300 text-white'}`}>
            {prefs.notifications ? 'ATIVADO' : 'DESATIVADO'}
          </button>
        </div>
      </div>
    </div>
  );
}
