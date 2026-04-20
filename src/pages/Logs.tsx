import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Terminal, Loader2, User, Clock, Tag, ShieldCheck, Database, Cpu } from 'lucide-react';

import { getData } from '../lib/storage';

interface ActionLog {
  id: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD';
  entity: 'PROJECT' | 'TASK' | 'USER' | 'BUDGET' | 'ATTACHMENT';
  entityId: string;
  details: string;
  createdAt: string;
}

export default function Logs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ActionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    // In a real SPA with logs, we'd persist these too, 
    // but for now we'll just show what is in localStorage
    const storedLogs = getData('LOGS') || [];
    setLogs(storedLogs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionStyles = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-brand-green/10 text-brand-green border-brand-green/20';
      case 'UPDATE': return 'bg-brand-indigo/10 text-brand-indigo border-brand-indigo/20';
      case 'DELETE': return 'bg-brand-red/10 text-brand-red border-brand-red/20';
      case 'UPLOAD': return 'bg-brand-orange/10 text-brand-orange border-brand-orange/20';
      default: return 'bg-brand-slate/5 text-brand-slate border-brand-slate/10';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12 bg-brand-cream min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-brand-indigo mt-24" /></div>;
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="sm:flex sm:items-center sm:justify-between mb-16">
        <div>
          <h1 className="text-4xl font-black text-brand-slate tracking-tight flex items-center">
            <Terminal className="h-8 w-8 mr-4 text-brand-indigo"/> Kernel Audit / Logs
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-bold uppercase tracking-widest leading-loose">Histórico de Eventos e Alterações de Sistema</p>
        </div>
        <div className="hidden sm:flex items-center space-x-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Events</span>
            <span className="text-xl font-black text-brand-slate">{logs.length}</span>
          </div>
          <div className="h-10 w-px bg-brand-cream-dark mx-2"></div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Security Level</span>
            <span className="text-xl font-black text-brand-green flex items-center">
              <ShieldCheck className="h-5 w-5 mr-2" /> ENFORCED
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] border border-brand-cream-dark rounded-[3rem] overflow-hidden">
        <ul role="list" className="divide-y divide-brand-cream-dark">
          {logs.length === 0 ? (
            <li className="px-10 py-24 text-center">
              <Database className="h-16 w-16 text-gray-200 mx-auto mb-6" />
              <p className="font-black text-gray-300 uppercase tracking-[0.3em] text-xs italic">Aguardando telemetria de sistema...</p>
            </li>
          ) : (
            logs.map((log) => (
              <li key={log.id} className="px-10 py-8 hover:bg-brand-cream/30 transition-all duration-300 group">
                <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
                  <div className={`shrink-0 self-start lg:self-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border-2 ${getActionStyles(log.action)} shadow-sm`}>
                    {log.action}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-black text-brand-slate leading-relaxed mb-3 group-hover:text-brand-indigo transition-colors flex items-center">
                      <Cpu className="h-4 w-4 mr-3 text-brand-indigo/40 shrink-0" />
                      <span className="font-mono tracking-tight">{log.details}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black uppercase tracking-[0.15em] text-gray-400">
                      <span className="flex items-center bg-brand-cream px-3 py-1 rounded-xl text-brand-slate border border-brand-cream-dark">
                        <User className="h-3 w-3 mr-2 text-brand-indigo/50" /> {log.userName}
                      </span>
                      <span className="flex items-center">
                        <Tag className="h-3 w-3 mr-2 text-brand-indigo/40" /> {log.entity}
                      </span>
                      <span className="flex items-center text-gray-300">
                        <Clock className="h-3 w-3 mr-2" /> {new Date(log.createdAt).toLocaleString('pt-PT')}
                      </span>
                    </div>
                  </div>
                  <div className="hidden xl:block">
                    <button className="text-[10px] font-black text-brand-indigo uppercase tracking-widest hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                      Trace Event
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
