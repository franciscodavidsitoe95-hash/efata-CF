import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  FolderOpen, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  Search, 
  Bell, 
  HelpCircle,
  TrendingUp,
  Activity,
  Cpu,
  Monitor,
  ShieldCheck,
  Zap,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  AreaChart,
  Area
} from 'recharts';
import type { Project } from './Projects';
import type { Task } from '../components/ProjectTasksModal';
import { getData } from '../lib/storage';

export default function Dashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // New states for Header elements
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSystemStatus, setShowSystemStatus] = useState(false);
  
  // Real-time presence data just for Dashboard
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showSystemStatus && (user?.email === 'franciscodavidsitoe95@gmail.com' || user?.email === 'celsosebastiao@gmail.com')) {
      const getPresence = () => {
        const presence = JSON.parse(localStorage.getItem('efata_presence') || '{}');
        const now = Date.now();
        const active = Object.entries(presence)
          .map(([email, data]: [string, any]) => ({ email, ...data }))
          .filter(u => now - u.lastSeen < 120000); // 2 minutes window
        setOnlineUsers(active);
      };
      getPresence();
      interval = setInterval(getPresence, 10000); // refresh every 10s while open
    }
    return () => clearInterval(interval);
  }, [showSystemStatus, user]);
  const alertedDelayed = useRef(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!loading && projects.length > 0 && !alertedDelayed.current) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const delayedProjects = projects.filter(p => {
        if (p.status === 'concluido' || !p.endDate) return false;
        return new Date(p.endDate) < today;
      });

      if (delayedProjects.length > 0) {
        addToast(`Infraestrutura: ${delayedProjects.length} projetos em atraso crítico!`, 'error');
        alertedDelayed.current = true;
      }
    }
  }, [loading, projects]);

  const fetchProjects = async () => {
    setProjects(getData('PROJECTS'));
    setLoading(false);
  };

  const calculateProgress = (tasks: Task[] = []) => {
    if (tasks.length === 0) return 0;
    const totalWeight = tasks.reduce((sum, t) => sum + (Number(t.weight) || 0), 0);
    if (totalWeight === 0) return 0;
    const completedWeight = tasks.filter(t => t.status === 'concluida').reduce((sum, t) => sum + (Number(t.weight) || 0), 0);
    return Math.round((completedWeight / totalWeight) * 100);
  };

  const totalProjects = projects.length;
  const inProgress = projects.filter(p => p.status === 'em_progresso').length;
  const completed = projects.filter(p => p.status === 'concluido').length;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const delayed = projects.filter(p => {
    if (p.status === 'concluido' || !p.endDate) return false;
    const endDate = new Date(p.endDate);
    return endDate < today;
  }).length;

  const chartData = projects.slice(0, 8).map(p => ({
    name: p.name.split(' ')[0],
    progresso: calculateProgress(p.tasks)
  }));

  const pieData = [
    { name: 'Em Progresso', value: inProgress, color: '#4F46E5' },
    { name: 'Concluídos', value: completed, color: '#0EA5E9' },
    { name: 'Atrasados', value: delayed, color: '#F59E0B' },
    { name: 'Planeados', value: Math.max(0, totalProjects - inProgress - completed - delayed), color: '#94A3B8' }
  ].filter(d => d.value > 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <Loader2 className="h-10 w-10 animate-spin text-brand-indigo" />
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-8 lg:p-12 space-y-12"
    >
      <motion.header variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Pesquisar infraestrutura, logs, projetos..." 
            className="w-full bg-white border border-brand-cream-dark rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-center space-x-6 relative">
          <div className="flex items-center space-x-2">
            
            {/* Notifications Dropdown */}
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 bg-white border border-brand-cream-dark rounded-xl text-gray-500 hover:text-brand-indigo transition-all relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-brand-orange rounded-full border-2 border-white"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-brand-cream-dark p-6 z-50 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-[10px] font-black text-brand-slate uppercase tracking-[0.2em] mb-4">Notificações Recentes</h3>
                  <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-brand-orange mt-1.5"></div>
                      <div>
                        <p className="text-sm font-bold text-brand-slate">Alerta de Prevenção</p>
                        <p className="text-xs text-gray-400 mt-1">Sincronização de rede verificada com pequenos atrasos (Crit-P1).</p>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-2">Há 5 min</p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-start">
                      <div className="w-2 h-2 rounded-full bg-brand-indigo mt-1.5"></div>
                      <div>
                        <p className="text-sm font-bold text-brand-slate">Atualização IT</p>
                        <p className="text-xs text-gray-400 mt-1">O pacote de rede 3.1 da Efata foi injetado com sucesso.</p>
                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest mt-2">Hoje</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Help Dropdown */}
            <div className="relative">
              <button onClick={() => setShowHelp(!showHelp)} className="p-2.5 bg-white border border-brand-cream-dark rounded-xl text-gray-500 hover:text-brand-indigo transition-all">
                <HelpCircle className="h-5 w-5" />
              </button>
              
              {showHelp && (
                <div className="absolute top-full right-0 mt-3 w-64 bg-white rounded-3xl shadow-2xl border border-brand-cream-dark p-6 z-50 animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-[10px] font-black text-brand-slate uppercase tracking-[0.2em] mb-4">Ajuda Rápida</h3>
                  <div className="space-y-3">
                    <a href="mailto:suporte@efata.it" className="block text-sm font-bold text-brand-indigo hover:underline">Contatar Equipe de IT</a>
                    <a href="#" className="block text-sm font-bold text-gray-500 hover:text-brand-slate transition-colors">Documentação da API</a>
                    <a href="#" className="block text-sm font-bold text-gray-500 hover:text-brand-slate transition-colors">Estado do Servidor</a>
                  </div>
                </div>
              )}
            </div>

          </div>
          
          {/* Node Active & Online Users Dropdown */}
          <div className="relative">
            <button onClick={() => setShowSystemStatus(!showSystemStatus)} className="flex items-center space-x-3 bg-brand-indigo/5 hover:bg-brand-indigo/10 transition-colors px-4 py-2 rounded-2xl border border-brand-indigo/10 cursor-pointer">
              <Monitor className="h-4 w-4 text-brand-indigo" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-indigo">Node-01 Active</span>
            </button>
            
            {showSystemStatus && (
              <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-brand-cream-dark p-6 z-50 animate-in fade-in slide-in-from-top-4">
                <h3 className="text-[10px] font-black text-brand-slate uppercase tracking-[0.2em] mb-4 flex items-center">
                  <Activity className="w-3 h-3 text-brand-green mr-2 animate-pulse" /> Estado do Cluster
                </h3>
                <div className="mb-6 space-y-2">
                  <p className="flex justify-between text-xs font-bold"><span className="text-gray-400">Memory:</span> <span className="text-brand-slate">32GB / 64GB Ram</span></p>
                  <p className="flex justify-between text-xs font-bold"><span className="text-gray-400">Load:</span> <span className="text-brand-slate">1.2ms Avg</span></p>
                  <p className="flex justify-between text-xs font-bold"><span className="text-gray-400">Uptime:</span> <span className="text-brand-slate">99.98%</span></p>
                </div>

                {(user?.email === 'franciscodavidsitoe95@gmail.com' || user?.email === 'celsosebastiao@gmail.com') ? (
                  <>
                    <h3 className="text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em] mb-4 border-t border-brand-cream-dark pt-4">Visualização de Administradores</h3>
                    <p className="text-xs text-gray-400 font-medium mb-3 leading-relaxed">Conexões ativas no ecossistema (Tempo real)</p>
                    
                    {onlineUsers.length > 0 ? (
                      <div className="space-y-3">
                        {onlineUsers.map(u => (
                          <div key={u.email} className="flex justify-between items-center text-xs font-bold">
                            <span className="text-brand-slate flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]"></span>
                              {u.name}
                            </span>
                            <span className="text-gray-400 bg-gray-100 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">{u.role}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">A detetar conexões...</p>
                    )}
                  </>
                ) : (
                  <p className="text-[10px] mt-4 font-black text-gray-300 uppercase tracking-widest border-t border-brand-cream-dark pt-4">Privilégios Restritos para Network Data</p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <motion.section variants={itemVariants}>
        <h1 className="text-4xl font-black text-brand-slate tracking-tight mb-2">Ops Ecosystem Overview<span className="text-brand-indigo">.</span></h1>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center">
          <Globe className="h-4 w-4 mr-2 text-brand-indigo" />
          {new Date().toLocaleDateString('pt-PT', { month: 'long', day: 'numeric', year: 'numeric' })} — System Status: Optimal
        </p>
      </motion.section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-8 bg-white p-8 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] border border-brand-cream-dark flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-brand-indigo/10 rounded-2xl shadow-sm">
                <TrendingUp className="h-5 w-5 text-brand-indigo" />
              </div>
              <div>
                <p className="text-sm font-black text-brand-slate uppercase tracking-tight">Deploy Timeline</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Real-time Performance Sync</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-indigo shadow-[0_0_8px_rgba(79,70,229,0.3)]"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SLA</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-blue shadow-[0_0_8px_rgba(14,165,233,0.3)]"></div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mesh</span>
              </div>
            </div>
          </div>

          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 800 }}
                  domain={[0, 100]}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '12px 20px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="progresso" 
                  stroke="#4F46E5" 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorProg)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-4 bg-white p-8 rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] border border-brand-cream-dark flex flex-col h-[450px]">
          <div className="flex items-center space-x-3 mb-10">
            <div className="p-3 bg-brand-blue/10 rounded-2xl shadow-sm">
              <Zap className="h-5 w-5 text-brand-blue" />
            </div>
            <div>
              <p className="text-sm font-black text-brand-slate uppercase tracking-tight">Active Clusters</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Distribution Matrix</p>
            </div>
          </div>
          <div className="flex-1 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-4xl font-black text-brand-slate tabular-nums">{totalProjects}</span>
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Total Units</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-y-4 mt-6">
             {pieData.map((d, i) => (
               <div key={i} className="flex items-center space-x-3">
                 <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}></div>
                 <span className="text-[10px] font-black text-brand-slate uppercase tracking-tight truncate">{d.name}</span>
               </div>
             ))}
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3 bg-white p-8 rounded-[3rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] border border-brand-cream-dark group hover:bg-brand-indigo transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
             <div className="p-3 bg-brand-cream-dark rounded-2xl group-hover:bg-white/20 transition-colors">
               <Cpu className="h-6 w-6 text-brand-indigo group-hover:text-white" />
             </div>
             <Activity className="h-5 w-5 text-brand-green group-hover:text-white animate-pulse" />
          </div>
          <p className="text-[10px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-[0.2em] mb-2">Core Load Avg</p>
          <p className="text-4xl font-black text-brand-slate group-hover:text-white tracking-tight">14.8%</p>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-3 bg-white p-8 rounded-[3rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.05)] border border-brand-cream-dark group hover:bg-brand-blue transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
             <div className="p-3 bg-brand-cream-dark rounded-2xl group-hover:bg-white/20 transition-colors">
               <AlertTriangle className="h-6 w-6 text-brand-orange group-hover:text-white" />
             </div>
             <span className="px-3 py-1 rounded-full text-[9px] font-black group-hover:text-white bg-brand-orange/10 group-hover:bg-white/20 text-brand-orange uppercase">Crit-P1</span>
          </div>
          <p className="text-[10px] font-black text-gray-400 group-hover:text-white/60 uppercase tracking-[0.2em] mb-2">Active Incidents</p>
          <p className="text-4xl font-black text-brand-slate group-hover:text-white tracking-tight">{delayed}</p>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-6 bg-[#0F172A] p-10 rounded-[3rem] shadow-2xl shadow-brand-slate/30 text-white relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/10 rounded-full blur-[100px] -m-20 group-hover:bg-brand-indigo/20 transition-all duration-700"></div>
           <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em] mb-3">Kernel Health Index</p>
                  <p className="text-5xl font-black tracking-tighter">99.4<span className="text-brand-green text-xl font-bold ml-3 italic">SYNC</span></p>
                </div>
                <div className="flex space-x-2">
                   {[1,2,3,4,5,6].map(i => <motion.div animate={{ height: [12, 28, 12], transition: { repeat: Infinity, duration: 1 + i * 0.2 } }} key={i} className={`w-2 h-7 rounded-full ${i < 6 ? 'bg-brand-green shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-brand-green/20'}`}></motion.div>)}
                </div>
              </div>
                 <div className="mt-10 flex flex-col sm:flex-row items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                        <ShieldCheck className="h-6 w-6 text-brand-green" />
                      </div>
                      <p className="text-[10px] font-bold text-white/50 leading-relaxed uppercase tracking-widest max-w-[180px]">Automated Security Protocols: ACTIVE</p>
                    </div>
                    <Link to="/logs" className="w-full sm:w-auto text-center bg-brand-indigo hover:bg-brand-blue px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-indigo/20 transform hover:-translate-y-1">View Telemetry</Link>
                 </div>
           </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
