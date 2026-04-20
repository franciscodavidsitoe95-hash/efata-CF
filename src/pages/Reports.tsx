import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Filter, 
  Download, 
  Search, 
  Calendar, 
  Database, 
  Activity, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ListTodo,
  User as UserIcon,
  LayoutGrid,
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  Table as TableIcon,
  ShieldCheck,
  Server
} from 'lucide-react';
import type { Project } from './Projects';
import type { Task } from '../components/ProjectTasksModal';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getData } from '../lib/storage';

interface SimpleUser {
  id: string;
  name: string;
}

interface FinancialSummary {
  projectId: string;
  projectName: string;
  client: string;
  plannedBudget: number;
  totalSpent: number;
  totalRevenue: number;
  balance: number;
  status: string;
}

export default function Reports() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [finances, setFinances] = useState<FinancialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'projects' | 'tasks' | 'finances'>('projects');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  
  // Project Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [clientSearch, setClientSearch] = useState<string>('');

  // Task Filters
  const [taskStatusFilter, setTaskStatusFilter] = useState<string>('all');
  const [taskResponsibleFilter, setTaskResponsibleFilter] = useState<string>('all');
  const [taskProjectFilter, setTaskProjectFilter] = useState<string>('all');

  // Financial Filters
  const [financeStatusFilter, setFinanceStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'finances') {
      fetchFinances();
    }
  }, [financeStatusFilter, clientSearch, activeTab, projects]);

  const fetchFinances = async () => {
    const allItems: any[] = getData('BUDGET_ITEMS') || [];
    
    // Simulate finances from local storage
    const newFinances = projects.map(p => {
        // find all items linked to this project
        // wait, we need to know budgetId for the project first
        const allBudgets: any[] = getData('BUDGETS') || [];
        const projectBudgets = allBudgets.filter(b => b.projectId === p.id).map(b => b.id);
        
        const projectItems = allItems.filter(i => projectBudgets.includes(i.budgetId));
        const totalSpent = projectItems.filter(i => i.type === 'despesa').reduce((sum, i) => sum + i.amount, 0);
        const totalRevenue = projectItems.filter(i => i.type === 'receita').reduce((sum, i) => sum + i.amount, 0);
        
        return {
            projectId: p.id,
            projectName: p.name,
            client: p.client,
            plannedBudget: p.budget || 0,
            totalSpent,
            totalRevenue,
            balance: totalRevenue - totalSpent,
            status: p.status
        };
    });

    setFinances(newFinances);
  };

  const fetchData = async () => {
    setProjects(getData('PROJECTS') || []);
    setUsers(getData('USERS') || []);
    setLoading(false);
  };

  const calculateProgress = (project: Project) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter(t => t.status === 'concluida').length;
    return Math.round((completed / project.tasks.length) * 100);
  };

  const filteredProjects = projects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    const matchesClient = project.client.toLowerCase().includes(clientSearch.toLowerCase());
    
    let matchesDate = true;
    if (dateStart && dateEnd) {
      const pStart = new Date(project.startDate);
      const pEnd = new Date(project.endDate);
      const fStart = new Date(dateStart);
      const fEnd = new Date(dateEnd);
      matchesDate = pStart >= fStart && pEnd <= fEnd;
    } else if (dateStart) {
      matchesDate = new Date(project.startDate) >= new Date(dateStart);
    } else if (dateEnd) {
      matchesDate = new Date(project.endDate) <= new Date(dateEnd);
    }

    return matchesStatus && matchesClient && matchesDate;
  });

  const filteredTasks = projects
    .flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name, projectId: p.id })))
    .filter(task => {
      const matchesStatus = taskStatusFilter === 'all' || task.status === taskStatusFilter;
      const matchesResponsible = taskResponsibleFilter === 'all' || task.responsibleId === taskResponsibleFilter;
      const matchesProject = taskProjectFilter === 'all' || task.projectId === taskProjectFilter;
      return matchesStatus && matchesResponsible && matchesProject;
    });

  const filteredFinances = finances.filter(f => {
    const matchesStatus = financeStatusFilter === 'all' || f.status === financeStatusFilter;
    const matchesClient = f.client.toLowerCase().includes(clientSearch.toLowerCase());
    return matchesStatus && matchesClient;
  });

  const generateReportData = () => {
    if (activeTab === 'projects') {
      return {
        headers: ['Projeto', 'Cliente', 'Progresso', 'Orçamento Planejado', 'Status', 'Início', 'Fim'],
        rows: filteredProjects.map(p => [
          p.name,
          p.client,
          `${calculateProgress(p)}%`,
          p.budget,
          p.status,
          p.startDate,
          p.endDate
        ]),
        filename: `relatorio_projetos_${new Date().toISOString().split('T')[0]}`
      };
    } else if (activeTab === 'tasks') {
      return {
        headers: ['Tarefa', 'Projeto', 'Responsável', 'Status', 'Peso (%)'],
        rows: filteredTasks.map(t => [
          t.name,
          t.projectName,
          t.responsibleName || 'Não atribuído',
          t.status,
          t.weight
        ]),
        filename: `relatorio_tarefas_${new Date().toISOString().split('T')[0]}`
      };
    } else {
      return {
        headers: ['Projeto', 'Cliente', 'Orçamento Planejado', 'Total Gasto', 'Saldo', 'Status'],
        rows: filteredFinances.map(f => [
          f.projectName,
          f.client,
          f.plannedBudget,
          f.totalSpent,
          f.plannedBudget - f.totalSpent,
          f.status
        ]),
        filename: `relatorio_financeiro_${new Date().toISOString().split('T')[0]}`
      };
    }
  };

  const exportCSV = () => {
    const { headers, rows, filename } = generateReportData();
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    setIsExportMenuOpen(false);
  };

  const exportXLSX = () => {
    const { headers, rows, filename } = generateReportData();
    const data = [headers, ...rows];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    setIsExportMenuOpen(false);
  };

  const exportPDF = () => {
    const { headers, rows, filename } = generateReportData();
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Relatório de Operações IT - Efata System', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 30);
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }, // brand-indigo
      styles: { fontSize: 8, cellPadding: 3 }
    });
    
    doc.save(`${filename}.pdf`);
    setIsExportMenuOpen(false);
  };

  const getStatusBadge = (status: string, type: 'project' | 'task' = 'project') => {
    if (type === 'project') {
      switch (status) {
        case 'planeado':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-orange/10 text-brand-orange border border-brand-orange/20"><Clock className="w-3 h-3 mr-1" /> Planeado</span>;
        case 'em_progresso':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20"><Activity className="w-3 h-3 mr-1" /> Deployment</span>;
        case 'concluido':
          return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-brand-green/10 text-brand-green border border-brand-green/20"><ShieldCheck className="w-3 h-3 mr-1" /> Operational</span>;
        default: return status;
      }
    } else {
      switch (status) {
        case 'pendente': return <span className="px-2.5 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-700 border border-gray-200">Pending</span>;
        case 'em_andamento': return <span className="px-2.5 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20">Running</span>;
        case 'concluida': return <span className="px-2.5 py-0.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-brand-green/10 text-brand-green border border-brand-green/20">Synced</span>;
        default: return status;
      }
    }
  };

  return (
    <div className="p-8 lg:p-12">
      <div className="sm:flex sm:items-center sm:justify-between mb-16">
        <div>
          <h1 className="text-4xl font-black text-brand-slate flex items-center tracking-tight">
            <BarChart3 className="h-8 w-8 mr-4 text-brand-indigo" /> Analytics & Intelligence
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-bold uppercase tracking-widest leading-loose">Monitorização e Auditoria Operacional de Rede</p>
        </div>
        
        <div className="relative mt-4 sm:mt-0">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="inline-flex items-center justify-center rounded-2xl bg-brand-indigo px-8 py-4 text-sm font-black text-white shadow-xl shadow-brand-indigo/25 hover:bg-brand-blue transition-all transform active:scale-95"
          >
            <Download className="h-4 w-4 mr-2" /> EXPORTAR DATA
          </button>
          
          {isExportMenuOpen && (
            <div className="absolute right-0 mt-4 w-64 origin-top-right rounded-[2rem] bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-50 p-3 border border-brand-cream-dark">
              <button onClick={exportPDF} className="flex items-center w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest text-brand-slate hover:bg-brand-cream hover:text-brand-indigo rounded-2xl transition-all">
                <FileText className="h-4 w-4 mr-3 text-brand-indigo" /> Relatório PDF (.pdf)
              </button>
              <button onClick={exportXLSX} className="flex items-center w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest text-brand-slate hover:bg-brand-cream hover:text-brand-green rounded-2xl transition-all">
                <TableIcon className="h-4 w-4 mr-3 text-brand-green" /> Folha de Excel (.xlsx)
              </button>
              <button onClick={exportCSV} className="flex items-center w-full px-5 py-4 text-[10px] font-black uppercase tracking-widest text-brand-slate hover:bg-brand-cream hover:text-brand-blue rounded-2xl transition-all">
                <Download className="h-4 w-4 mr-3 text-brand-blue" /> Arquivo CSV (.csv)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-3 p-2 bg-brand-cream-dark/30 rounded-3xl mb-12 w-fit border border-brand-cream-dark">
        <button
          onClick={() => setActiveTab('projects')}
          className={`flex items-center space-x-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'projects' ? 'bg-brand-indigo text-white shadow-lg shadow-brand-indigo/30' : 'text-gray-400 hover:text-brand-indigo hover:bg-white'
          }`}
        >
          <Server className="h-4 w-4" />
          <span>Infraestrutura</span>
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center space-x-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'tasks' ? 'bg-brand-indigo text-white shadow-lg shadow-brand-indigo/30' : 'text-gray-400 hover:text-brand-indigo hover:bg-white'
          }`}
        >
          <ListTodo className="h-4 w-4" />
          <span>Telemetria</span>
        </button>
        <button
          onClick={() => setActiveTab('finances')}
          className={`flex items-center space-x-2 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === 'finances' ? 'bg-brand-indigo text-white shadow-lg shadow-brand-indigo/30' : 'text-gray-400 hover:text-brand-indigo hover:bg-white'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Investimentos</span>
        </button>
      </div>

        {/* Filters */}
        <div className="bg-white p-10 rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-brand-cream-dark mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            {activeTab === 'projects' && (
              <>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Filtro de Estado</label>
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all">
                    <option value="all">SISTEMA COMPLETO</option>
                    <option value="planeado">PLANEADO</option>
                    <option value="em_progresso">DEPLOYMENT</option>
                    <option value="concluido">OPERATIONAL</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Ativo / Cliente</label>
                  <input type="text" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="Pesquisar..." className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Data Início</label>
                  <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Data Fim</label>
                  <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all" />
                </div>
              </>
            )}
            
            {activeTab === 'tasks' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Status de Telemetria</label>
                  <select value={taskStatusFilter} onChange={(e) => setTaskStatusFilter(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all">
                    <option value="all">TODAS TAREFAS</option>
                    <option value="pendente">PENDENTE</option>
                    <option value="em_andamento">EM EXECUÇÃO</option>
                    <option value="concluida">FINALIZADA</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Responável / SysAdmin</label>
                  <select value={taskResponsibleFilter} onChange={(e) => setTaskResponsibleFilter(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all">
                    <option value="all">QUALQUER UTILIZADOR</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name.toUpperCase()} [{u.id === user?.id ? 'EU' : 'ROOT'}]</option>)}
                  </select>
                </div>
              </>
            )}

            {activeTab === 'finances' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Status Operacional</label>
                  <select value={financeStatusFilter} onChange={(e) => setFinanceStatusFilter(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all">
                    <option value="all">FULL NETWORK</option>
                    <option value="planeado">PLANEADO</option>
                    <option value="em_progresso">DEPLOYMENT</option>
                    <option value="concluido">OPERATIONAL</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">Entidade / Centro de Custos</label>
                  <input type="text" value={clientSearch} onChange={(e) => setClientSearch(e.target.value)} placeholder="Filtrar..." className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] border border-brand-cream-dark rounded-[3.5rem] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-brand-cream-dark">
              <thead className="bg-brand-cream">
                {activeTab === 'projects' && (
                  <tr>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Deployment Ativo</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Entidade</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Fluxo</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Status</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Budget (€)</th>
                  </tr>
                )}
                {activeTab === 'tasks' && (
                  <tr>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Unidade de Trabalho</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Origem (Projeto)</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Responsável / Admin</th>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Telemetria</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Impacto (%)</th>
                  </tr>
                )}
                {activeTab === 'finances' && (
                  <tr>
                    <th className="px-10 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Identidade IT / Ativo</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Budget Planeado</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Gasto Real (Actual)</th>
                    <th className="px-10 py-6 text-right text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Spread / Saldo</th>
                    <th className="px-10 py-6 text-center text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Efficiency Score</th>
                  </tr>
                )}
              </thead>
              <tbody className="bg-white divide-y divide-brand-cream-dark">
                {loading ? (
                  <tr><td colSpan={10} className="px-10 py-32 text-center text-gray-300 font-black uppercase tracking-[0.3em] italic animate-pulse">Scanning network data...</td></tr>
                ) : activeTab === 'projects' ? (
                  filteredProjects.map(p => (
                    <tr key={p.id} className="hover:bg-brand-cream/40 transition-all duration-300 group">
                      <td className="px-10 py-6 whitespace-nowrap"><div className="text-sm font-black text-brand-slate uppercase group-hover:text-brand-indigo transition-colors">{p.name}</div></td>
                      <td className="px-10 py-6 whitespace-nowrap text-xs font-bold text-gray-400 uppercase tracking-widest">{p.client}</td>
                      <td className="px-10 py-6 whitespace-nowrap">
                        <div className="flex items-center space-x-4">
                          <div className="w-24 bg-brand-cream-dark rounded-full h-2 overflow-hidden p-0.5 border border-white">
                            <div className="h-full bg-brand-indigo rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)] transition-all duration-700" style={{ width: `${calculateProgress(p)}%` }}></div>
                          </div>
                          <span className="text-[10px] font-black text-brand-slate tabular-nums">{calculateProgress(p)}%</span>
                        </div>
                      </td>
                      <td className="px-10 py-6 whitespace-nowrap">{getStatusBadge(p.status)}</td>
                      <td className="px-10 py-6 whitespace-nowrap text-right text-sm font-black text-brand-indigo tabular-nums">
                        {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(p.budget)}
                      </td>
                    </tr>
                  ))
                ) : activeTab === 'tasks' ? (
                  filteredTasks.map(t => (
                    <tr key={t.id} className="hover:bg-brand-cream/40 transition-all duration-300 group">
                      <td className="px-10 py-6 whitespace-nowrap text-sm font-black text-brand-slate group-hover:text-brand-indigo transition-colors">{t.name}</td>
                      <td className="px-10 py-6 whitespace-nowrap text-[9px] font-black text-gray-400 uppercase tracking-widest">{t.projectName}</td>
                      <td className="px-10 py-6 whitespace-nowrap text-sm font-black text-brand-slate uppercase tracking-tight">{t.responsibleName || 'Root'}</td>
                      <td className="px-10 py-6 whitespace-nowrap">{getStatusBadge(t.status, 'task')}</td>
                      <td className="px-10 py-6 whitespace-nowrap text-right text-sm font-black text-brand-blue tabular-nums">{t.weight}%</td>
                    </tr>
                  ))
                ) : (
                  filteredFinances.map(f => {
                    const diff = f.plannedBudget - f.totalSpent;
                    const pct = f.plannedBudget > 0 ? (f.totalSpent / f.plannedBudget) * 100 : 0;
                    return (
                      <tr key={f.projectId} className="hover:bg-brand-cream/40 transition-all duration-300 group">
                        <td className="px-10 py-6 whitespace-nowrap">
                          <div className="text-sm font-black text-brand-slate uppercase whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]">{f.projectName}</div>
                          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{f.client}</div>
                        </td>
                        <td className="px-10 py-6 whitespace-nowrap text-right text-sm font-black text-gray-400 tabular-nums">
                          {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(f.plannedBudget)}
                        </td>
                        <td className="px-10 py-6 whitespace-nowrap text-right text-sm font-black text-brand-red tabular-nums">
                          {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(f.totalSpent)}
                        </td>
                        <td className="px-10 py-6 whitespace-nowrap text-right text-sm font-black tabular-nums">
                          <span className={diff >= 0 ? 'text-brand-green' : 'text-brand-orange'}>
                            {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(diff)}
                          </span>
                        </td>
                        <td className="px-10 py-6 whitespace-nowrap">
                          <div className="flex flex-col items-center">
                            <div className="w-24 bg-brand-cream-dark rounded-full h-3 overflow-hidden mb-1.5 p-0.5 border border-white">
                              <div className={`h-full rounded-full transition-all duration-700 shadow-sm ${pct > 100 ? 'bg-brand-red' : pct > 80 ? 'bg-brand-orange' : 'bg-brand-green'}`} style={{ width: `${Math.min(pct, 100)}%` }}></div>
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${pct > 100 ? 'text-brand-red' : 'text-gray-400'}`}>
                              {pct > 100 ? <span className="flex items-center"><TrendingUp className="h-3 w-3 mr-1" /> Over Budget</span> : <span className="flex items-center"><TrendingDown className="h-3 w-3 mr-1" /> Optimized</span>}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-brand-cream px-10 py-10 border-t border-brand-cream-dark">
            <div className="flex flex-col xl:flex-row justify-between items-center gap-10">
              <div className="flex flex-wrap items-center gap-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Network Records</span>
                  <span className="text-3xl font-black text-brand-slate tabular-nums">
                    {activeTab === 'projects' ? filteredProjects.length : activeTab === 'tasks' ? filteredTasks.length : filteredFinances.length}
                  </span>
                </div>
                {activeTab === 'finances' && (
                   <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Total Infra Investment</span>
                    <span className="text-3xl font-black text-brand-indigo tabular-nums">
                      {new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(filteredFinances.reduce((acc, f) => acc + f.plannedBudget, 0))}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-6 p-4 bg-white rounded-3xl border border-brand-cream-dark shadow-sm">
                 <div className="h-12 w-12 rounded-2xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo">
                   <Clock className="h-6 w-6" />
                 </div>
                 <div className="text-right">
                   <div className="text-[10px] font-black text-brand-slate uppercase tracking-[0.2em] mb-0.5">Audit Sync Time</div>
                   <div className="text-sm font-black text-gray-400 uppercase">{new Date().toLocaleTimeString()}</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
