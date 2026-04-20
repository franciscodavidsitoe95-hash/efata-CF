import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Terminal, Loader2, User, Clock, Tag, ShieldCheck, Database, Cpu, Search, Filter, RefreshCcw, X, Activity } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterEntity, setFilterEntity] = useState<string>('ALL');
  const [selectedTrace, setSelectedTrace] = useState<ActionLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
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

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesEntity = filterEntity === 'ALL' || log.entity === filterEntity;
    return matchesSearch && matchesAction && matchesEntity;
  });

  if (loading) {
    return <div className="flex justify-center p-12 bg-brand-cream min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-brand-indigo mt-24" /></div>;
  }

  return (
    <div className="p-8 lg:p-12 relative">
      <div className="sm:flex sm:items-center sm:justify-between mb-12">
        <div>
          <h1 className="text-4xl font-black text-brand-slate tracking-tight flex items-center">
            <Terminal className="h-8 w-8 mr-4 text-brand-indigo"/> Kernel Audit / Logs
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-bold uppercase tracking-widest leading-loose">Histórico de Eventos e Alterações de Sistema</p>
        </div>
        <div className="hidden sm:flex items-center space-x-6">
           <button onClick={fetchLogs} className="p-3 bg-white border border-brand-cream-dark rounded-2xl text-gray-400 hover:text-brand-indigo transition-all shadow-sm group">
              <RefreshCcw className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
           </button>
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

      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[2rem] border border-brand-cream-dark shadow-sm">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Pesquisar em audit..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-brand-cream border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all text-brand-slate"
            />
          </div>
          <div className="flex w-full md:w-auto items-center gap-4">
             <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select 
                  value={filterAction} 
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white border border-brand-cream-dark rounded-xl text-xs font-black text-brand-slate uppercase tracking-widest focus:ring-2 focus:ring-brand-indigo/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="ALL">Todas as Ações</option>
                  <option value="CREATE">Create</option>
                  <option value="UPDATE">Update</option>
                  <option value="DELETE">Delete</option>
                  <option value="UPLOAD">Upload</option>
                </select>
             </div>
             <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select 
                  value={filterEntity} 
                  onChange={(e) => setFilterEntity(e.target.value)}
                  className="pl-10 pr-8 py-3 bg-white border border-brand-cream-dark rounded-xl text-xs font-black text-brand-slate uppercase tracking-widest focus:ring-2 focus:ring-brand-indigo/20 outline-none appearance-none cursor-pointer"
                >
                  <option value="ALL">Todos os Recursos</option>
                  <option value="PROJECT">Ativos / Projetos</option>
                  <option value="TASK">Tarefas</option>
                  <option value="USER">Utilizadores</option>
                  <option value="BUDGET">Orçamentos</option>
                  <option value="ATTACHMENT">Anexos</option>
                </select>
             </div>
          </div>
      </div>

      <div className="bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] border border-brand-cream-dark rounded-[3rem] overflow-hidden">
        <ul role="list" className="divide-y divide-brand-cream-dark">
          {filteredLogs.length === 0 ? (
            <li className="px-10 py-24 text-center">
              <Database className="h-16 w-16 text-gray-200 mx-auto mb-6" />
              <p className="font-black text-gray-400 uppercase tracking-[0.2em] text-xs">Nenhum registo encontrado</p>
            </li>
          ) : (
            filteredLogs.map((log) => (
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
                    <button onClick={() => setSelectedTrace(log)} className="text-[10px] font-black text-brand-slate bg-brand-cream border border-brand-cream-dark px-4 py-2 rounded-xl uppercase tracking-widest hover:bg-brand-indigo hover:text-white transition-all shadow-sm">
                      Trace Event
                    </button>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {selectedTrace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-brand-slate/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl border border-brand-cream-dark overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-brand-slate p-6 sm:p-8 flex items-center justify-between">
               <div className="flex items-center text-white">
                  <Activity className="h-6 w-6 text-brand-indigo mr-3" />
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Trace Protocol Analyzer</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {selectedTrace.id.toUpperCase()}</p>
                  </div>
               </div>
               <button onClick={() => setSelectedTrace(null)} className="text-gray-400 hover:text-white transition-colors bg-white/10 p-2 rounded-xl">
                 <X className="h-5 w-5" />
               </button>
            </div>
            
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-brand-cream p-4 rounded-2xl border border-brand-cream-dark">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Operador (Identity)</span>
                  <span className="text-sm font-bold text-brand-slate flex items-center"><User className="h-4 w-4 mr-2 text-brand-indigo"/> {selectedTrace.userName} // {selectedTrace.userId}</span>
                </div>
                <div className="bg-brand-cream p-4 rounded-2xl border border-brand-cream-dark">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Data & Timestamp</span>
                  <span className="text-sm font-bold text-brand-slate flex items-center"><Clock className="h-4 w-4 mr-2 text-brand-indigo"/> {new Date(selectedTrace.createdAt).toLocaleString('pt-PT')}</span>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-black text-brand-slate uppercase tracking-widest mb-3 border-b border-brand-cream-dark pb-2">Detalhes da Transação</h3>
                <div className="bg-[#0f172a] rounded-2xl p-5 overflow-x-auto border border-gray-800">
                  <pre className="text-brand-green font-mono text-xs leading-relaxed">
                    <code>
{`> RUN_AUDIT_TRACE --id ${selectedTrace.id}
> STATUS: VERIFIED OK

{
  "trace": "${selectedTrace.id}",
  "timestamp_utc": "${selectedTrace.createdAt}",
  "action_type": "${selectedTrace.action}",
  "target_entity": "${selectedTrace.entity}",
  "entity_id_ref": "${selectedTrace.entityId}",
  "payload_message": "${selectedTrace.details}"
}

> END_TRACE`}
                    </code>
                  </pre>
                </div>
              </div>

              <div className="flex justify-end">
                <button onClick={() => setSelectedTrace(null)} className="px-6 py-3 bg-brand-slate text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-brand-indigo transition-colors">
                  Fechar Terminal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
