import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, FolderOpen, Calendar, User as UserIcon, ListTodo, DollarSign, Paperclip, Server, Shield, Globe } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ProjectTasksModal, Task } from '../components/ProjectTasksModal';
import { ProjectBudgetsModal } from '../components/ProjectBudgetsModal';
import { ProjectAttachmentsModal } from '../components/ProjectAttachmentsModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getData, saveData, seedStorage } from '../lib/storage';

export interface Project {
  id: string;
  name: string;
  description: string;
  client: string;
  startDate: string;
  endDate: string;
  budget: number;
  priority: 'baixa' | 'media' | 'alta' | 'critica';
  category: string;
  gestorId?: string;
  gestorName?: string;
  status: 'planeado' | 'em_progresso' | 'concluido';
  isDelivered?: boolean;
  deliveryDate?: string;
  expectedPaymentDate?: string;
  tasks?: Task[];
  attachments?: any[];
  createdAt: string;
}

interface SimpleUser {
  id: string;
  name: string;
  role: string;
}

export default function Projects() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [availableUsers, setAvailableUsers] = useState<SimpleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [tasksModalProject, setTasksModalProject] = useState<Project | null>(null);
  const [budgetsModalProject, setBudgetsModalProject] = useState<Project | null>(null);
  const [attachmentsModalProject, setAttachmentsModalProject] = useState<Project | null>(null);
  
  // Confirm Dialog State
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [client, setClient] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState<string>('');
  const [priority, setPriority] = useState<Project['priority']>('media');
  const [category, setCategory] = useState('');
  const [gestorId, setGestorId] = useState('');
  const [status, setStatus] = useState<Project['status']>('planeado');
  const [isDelivered, setIsDelivered] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [expectedPaymentDate, setExpectedPaymentDate] = useState('');
  
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setAvailableUsers(getData('USERS'));
  };

  const fetchProjects = async () => {
    setProjects(getData('PROJECTS'));
    setLoading(false);
  };

  useEffect(() => {
    seedStorage();
    fetchUsers();
    fetchProjects();
  }, []);

  const resetForm = () => {
    setName('');
    setDescription('');
    setClient('');
    setStartDate('');
    setEndDate('');
    setBudget('');
    setPriority('media');
    setCategory('');
    setGestorId(user?.id || ''); 
    setStatus('planeado');
    setEditingProject(null);
    setSubmitError('');
  };

  const openModal = (p?: Project) => {
    resetForm();
    if (p) {
      setEditingProject(p);
      setName(p.name);
      setDescription(p.description);
      setClient(p.client || '');
      setStartDate(p.startDate || '');
      setEndDate(p.endDate || '');
      setBudget(p.budget ? p.budget.toString() : '');
      setPriority(p.priority || 'media');
      setCategory(p.category || '');
      setGestorId(p.gestorId || '');
      setStatus(p.status);
      setIsDelivered(p.isDelivered || false);
      setDeliveryDate(p.deliveryDate || '');
      setExpectedPaymentDate(p.expectedPaymentDate || '');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    const newProject: Project = {
      id: editingProject ? editingProject.id : Math.random().toString(36).substr(2, 9),
      name,
      description,
      client,
      startDate,
      endDate,
      budget: Number(budget),
      priority,
      category,
      gestorId,
      status,
      isDelivered,
      deliveryDate,
      expectedPaymentDate,
      tasks: editingProject ? (editingProject.tasks || []) : [],
      attachments: editingProject ? (editingProject.attachments || []) : [],
      createdAt: editingProject ? editingProject.createdAt : new Date().toISOString()
    };

    const currentProjects = getData('PROJECTS');
    let updatedProjects;
    
    if (editingProject) {
        updatedProjects = currentProjects.map((p: Project) => p.id === newProject.id ? newProject : p);
    } else {
        updatedProjects = [...currentProjects, newProject];
    }

    saveData('PROJECTS', updatedProjects);
    await fetchProjects();
    setIsModalOpen(false);
    addToast(editingProject ? 'Sistema atualizado!' : 'Fluxo IT iniciado!', 'info');
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    const currentProjects = getData('PROJECTS');
    const updatedProjects = currentProjects.filter((p: Project) => p.id !== id);
    saveData('PROJECTS', updatedProjects);
    await fetchProjects();
    addToast('Ativo descontinuado com sucesso', 'info');
  };

  const calculateProgress = (tasks: Task[] = []) => {
    if (tasks.length === 0) return 0;
    const totalWeight = tasks.reduce((sum, t) => sum + (Number(t.weight) || 0), 0);
    if (totalWeight === 0) return 0;
    const completedWeight = tasks.filter(t => t.status === 'concluida').reduce((sum, t) => sum + (Number(t.weight) || 0), 0);
    return Math.round((completedWeight / totalWeight) * 100);
  };

  const statusColors = {
    planeado: 'bg-brand-orange/10 text-brand-orange ring-brand-orange/20',
    em_progresso: 'bg-brand-indigo/10 text-brand-indigo ring-brand-blue/20',
    concluido: 'bg-brand-green/10 text-brand-green ring-brand-green/20',
  };

  const statusLabels = {
    planeado: 'Em Planeamento',
    em_progresso: 'Deployment',
    concluido: 'Operational'
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(val);
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '--';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return <div className="flex justify-center p-12 bg-brand-cream min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-brand-indigo mt-24" /></div>;
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="sm:flex sm:items-center sm:justify-between mb-16">
        <div>
          <h1 className="text-4xl font-black text-brand-slate flex items-center tracking-tight">
            <Server className="h-8 w-8 mr-4 text-brand-indigo"/> Infraestrutura & Deploy
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-bold uppercase tracking-widest leading-loose">Gestão de Performance e Ativos IT</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 rounded-2xl bg-brand-indigo px-8 py-4 text-center text-sm font-black text-white shadow-xl shadow-brand-indigo/25 hover:bg-brand-blue transition-all transform active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>NOVO DISPOSITIVO / PROJETO</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white/50 border-2 border-dashed border-gray-200 rounded-[3rem]">
            <Globe className="mx-auto h-16 w-16 text-gray-300" />
            <h3 className="mt-6 text-xl font-black text-brand-slate uppercase tracking-tight">Rede Vazia</h3>
            <p className="mt-2 text-sm text-gray-400 font-bold uppercase tracking-widest">Nenhum projeto ou ativo registado na base de dados central.</p>
            <div className="mt-10">
              <button
                onClick={() => openModal()}
                className="inline-flex items-center rounded-2xl bg-brand-indigo px-6 py-3 text-sm font-black text-white shadow-lg hover:bg-brand-blue"
              >
                <Plus className="-ml-0.5 mr-2 h-5 w-5" />
                Registrar Primeiro Ativo
              </button>
            </div>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="relative col-span-1 flex flex-col rounded-[3rem] bg-white shadow-2xl shadow-gray-200/50 border border-brand-cream-dark hover:border-brand-indigo/30 transition-all duration-300 group overflow-hidden">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center rounded-xl px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ring-1 ring-inset ${statusColors[project.status]}`}>
                      {statusLabels[project.status]}
                    </span>
                    <span className={`inline-flex items-center rounded-xl px-2.5 py-1 text-[8px] font-black uppercase tracking-widest text-white shadow-sm ${
                      project.priority === 'critica' ? 'bg-brand-red' :
                      project.priority === 'alta' ? 'bg-brand-orange' :
                      project.priority === 'media' ? 'bg-brand-blue' :
                      'bg-brand-green'
                    }`}>
                      {project.priority === 'critica' ? 'CRITICAL' : project.priority}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-brand-green" />
                    <span className="text-xs font-black text-brand-indigo uppercase tracking-tighter">{formatCurrency(project.budget || 0)}</span>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-0.5 bg-brand-cream-dark text-[8px] font-black text-brand-slate/60 rounded uppercase tracking-widest">{project.category || 'GERAL'}</span>
                    <h3 className="text-2xl font-black text-brand-slate group-hover:text-brand-indigo transition-colors truncate flex-1" title={project.name}>{project.name}</h3>
                  </div>
                  <p className="text-sm font-bold text-gray-400 line-clamp-2 min-h-[2.5rem] leading-relaxed" title={project.description}>{project.description || 'Nenhum detalhe técnico especificado.'}</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  <div className="bg-brand-cream p-4 rounded-2xl border border-brand-cream-dark flex items-start space-x-3">
                    <UserIcon className="h-4 w-4 text-brand-indigo/50 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">SysAdmin</p>
                      <p className="text-[11px] font-black text-brand-slate uppercase truncate">{project.gestorName || 'Root'}</p>
                    </div>
                  </div>
                  <div className="bg-brand-cream p-4 rounded-2xl border border-brand-cream-dark flex items-start space-x-3">
                    <Calendar className="h-4 w-4 text-brand-indigo/50 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-0.5">Deadline</p>
                      <p className="text-[11px] font-black text-brand-slate uppercase truncate">{formatDate(project.endDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                    <span className="text-gray-400 flex items-center">
                      <ListTodo className="h-3 w-3 mr-2" /> Uptime / Progresso
                    </span>
                    <span className="text-brand-indigo">{calculateProgress(project.tasks)}%</span>
                  </div>
                  <div className="w-full bg-brand-cream-dark rounded-full h-3 overflow-hidden p-0.5 border border-white">
                    <div className="bg-brand-indigo h-full rounded-full transition-all duration-700 shadow-[0_0_12px_rgba(79,70,229,0.3)]" style={{ width: `${calculateProgress(project.tasks)}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-auto bg-brand-cream-dark/30 border-t border-brand-cream-dark p-3">
                <div className="grid grid-cols-5 gap-2">
                  <button onClick={() => setTasksModalProject(project)} className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white hover:text-brand-indigo text-gray-400 transition-all group/btn">
                    <ListTodo className="h-5 w-5 mb-1 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Tasks</span>
                  </button>
                  <button onClick={() => setBudgetsModalProject(project)} className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white hover:text-brand-green text-gray-400 transition-all group/btn">
                    <DollarSign className="h-5 w-5 mb-1 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Finance</span>
                  </button>
                  <button onClick={() => setAttachmentsModalProject(project)} className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white hover:text-brand-orange text-gray-400 transition-all group/btn">
                    <Paperclip className="h-5 w-5 mb-1 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Data</span>
                  </button>
                  <button onClick={() => openModal(project)} className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white hover:text-brand-indigo text-gray-400 transition-all group/btn">
                    <Pencil className="h-5 w-5 mb-1 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Mod</span>
                  </button>
                  <button onClick={() => setProjectToDelete(project.id)} className="flex flex-col items-center justify-center p-3 rounded-2xl hover:bg-white hover:text-brand-red text-gray-400 transition-all group/btn">
                    <Trash2 className="h-5 w-5 mb-1 group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[8px] font-black uppercase tracking-tighter">Del</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {tasksModalProject && (
        <ProjectTasksModal 
          project={tasksModalProject} 
          availableUsers={availableUsers} 
          onClose={() => setTasksModalProject(null)} 
          onUpdateTasks={async (id, tasks) => {
            await fetchProjects();
            setTasksModalProject(prev => prev ? { ...prev, tasks } : null);
          }} 
        />
      )}

      {budgetsModalProject && (
        <ProjectBudgetsModal
          project={budgetsModalProject}
          onClose={() => setBudgetsModalProject(null)}
        />
      )}

      {attachmentsModalProject && (
        <ProjectAttachmentsModal
          project={attachmentsModalProject}
          onClose={() => setAttachmentsModalProject(null)}
          onUpdate={fetchProjects}
        />
      )}

      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-brand-slate/40 backdrop-blur-sm transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-[3rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-brand-cream-dark">
                
                <div className="bg-brand-cream px-8 py-6 border-b border-brand-cream-dark flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-brand-slate uppercase tracking-tight flex items-center">
                      {editingProject ? 'Configurar Deployment' : 'Registrar Novo Ativo'}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Configuração de Parâmetros Operacionais</p>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl p-2 text-gray-400 hover:text-brand-red hover:bg-white transition-all shadow-sm">
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="px-8 py-8">
                  {submitError && (
                    <div className="mb-8 rounded-2xl bg-brand-red/5 p-4 text-[10px] font-black text-brand-red border border-brand-red/10 uppercase tracking-[0.2em] text-center">
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
                      <div className="sm:col-span-2 p-5 bg-brand-cream-dark/20 rounded-3xl border border-brand-cream-dark/30">
                        <label className="block text-[10px] font-black text-brand-slate/60 uppercase tracking-widest mb-3 px-1">Identificação Fundamental</label>
                        <div className="space-y-4">
                          <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark/50 bg-white px-5 py-4 text-sm font-black text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 outline-none transition-all" placeholder="Nome do Projeto / Ativo IT" />
                          <input type="text" required value={client} onChange={e=>setClient(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark/50 bg-white px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 outline-none transition-all" placeholder="Cliente / Departamento Solicitante" />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Escopo Técnico e Documentação</label>
                        <textarea rows={3} value={description} onChange={e=>setDescription(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-medium text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all" placeholder="Descreva os requisitos, infraestrutura afetada e objetivos..." />
                      </div>

                      <div className="p-5 bg-brand-blue/5 rounded-3xl border border-brand-blue/10">
                        <label className="block text-[10px] font-black text-brand-blue uppercase tracking-widest mb-3 px-1">Cronograma Operacional</label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-brand-blue/10">
                            <span className="text-[9px] font-bold text-gray-400 uppercase w-12">Início</span>
                            <input type="date" required value={startDate} onChange={e=>setStartDate(e.target.value)} className="flex-1 bg-transparent text-xs font-black text-brand-slate outline-none" />
                          </div>
                          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-brand-blue/10">
                            <span className="text-[9px] font-bold text-gray-400 uppercase w-12">Fim</span>
                            <input type="date" required value={endDate} onChange={e=>setEndDate(e.target.value)} className="flex-1 bg-transparent text-xs font-black text-brand-slate outline-none" />
                          </div>
                        </div>
                      </div>

                      <div className="p-5 bg-brand-green/5 rounded-3xl border border-brand-green/10">
                        <label className="block text-[10px] font-black text-brand-green uppercase tracking-widest mb-3 px-1">Parâmetros Financeiros</label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-brand-green/10">
                             <DollarSign className="h-4 w-4 text-brand-green" />
                             <input type="number" step="0.01" min="0" required value={budget} onChange={e=>setBudget(e.target.value)} className="flex-1 bg-transparent text-sm font-black text-brand-slate outline-none" placeholder="Orçamento (EUR)" />
                          </div>
                          <input type="text" value={category} onChange={e=>setCategory(e.target.value)} className="block w-full rounded-xl border-brand-green/10 bg-white px-4 py-3 text-[10px] font-bold text-brand-slate focus:ring-2 focus:ring-brand-green/20 outline-none transition-all uppercase tracking-widest" placeholder="CATEGORIA (EX: CLOUD, SECURITY)" />
                        </div>
                      </div>

                      <div className="p-5 bg-brand-orange/5 rounded-3xl border border-brand-orange/10">
                        <label className="block text-[10px] font-black text-brand-orange uppercase tracking-widest mb-3 px-1">Gravidade e Ciclo</label>
                        <div className="space-y-3">
                          <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="block w-full rounded-xl border-brand-orange/10 bg-white px-4 py-3 text-[10px] font-black text-brand-slate focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all uppercase tracking-widest">
                            <option value="baixa">Prioridade Baixa</option>
                            <option value="media">Prioridade Média</option>
                            <option value="alta">Prioridade Alta</option>
                            <option value="critica">CRÍTICA / LOCKOUT</option>
                          </select>
                          <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="block w-full rounded-xl border-brand-orange/10 bg-white px-4 py-3 text-[10px] font-black text-brand-slate focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all uppercase tracking-widest">
                            <option value="planeado">Estado: Planeado</option>
                            <option value="em_progresso">Estado: Deployment</option>
                            <option value="concluido">Estado: Operational</option>
                          </select>
                          <label className="flex items-center space-x-2 text-[10px] font-black text-brand-slate uppercase mt-2">
                             <input type="checkbox" checked={isDelivered} onChange={(e) => setIsDelivered(e.target.checked)} />
                             <span>Sistema Entregue?</span>
                          </label>
                        </div>
                      </div>

                      <div className="p-5 bg-brand-green/5 rounded-3xl border border-brand-green/10">
                        <label className="block text-[10px] font-black text-brand-green uppercase tracking-widest mb-3 px-1">Datas de Entrega e Pagamento</label>
                        <div className="space-y-3">
                            <input type="date" value={deliveryDate} onChange={(e) => setDeliveryDate(e.target.value)} className="block w-full rounded-xl border-brand-green/10 bg-white px-4 py-3 text-[10px] font-black text-brand-slate focus:ring-2 focus:ring-brand-green/20 outline-none transition-all uppercase tracking-widest" />
                            <input type="date" value={expectedPaymentDate} onChange={(e) => setExpectedPaymentDate(e.target.value)} className="block w-full rounded-xl border-brand-green/10 bg-white px-4 py-3 text-[10px] font-black text-brand-slate focus:ring-2 focus:ring-brand-green/20 outline-none transition-all uppercase tracking-widest" />
                        </div>
                      </div>

                      <div className="p-5 bg-brand-indigo/5 rounded-3xl border border-brand-indigo/10">
                        <label className="block text-[10px] font-black text-brand-indigo uppercase tracking-widest mb-3 px-1">Atribuição de Liderança</label>
                        <select required value={gestorId} onChange={(e) => setGestorId(e.target.value)} className="block w-full rounded-xl border-brand-indigo/10 bg-white px-4 py-3 text-[10px] font-black text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 outline-none transition-all uppercase tracking-widest">
                          <option value="" disabled>Selecionar SysAdmin</option>
                          {availableUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.name} [{u.role}]</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-12 flex flex-col sm:flex-row-reverse gap-4 border-t border-brand-cream-dark pt-10">
                      <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center rounded-2xl bg-brand-indigo px-8 py-5 text-sm font-black text-white shadow-xl shadow-brand-indigo/25 hover:bg-brand-blue transition-all active:scale-95 leading-none">
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'CONSOLIDAR REGISTRO IT'}
                      </button>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="flex items-center justify-center rounded-2xl bg-brand-cream border border-brand-cream-dark px-10 py-5 text-[10px] font-black text-gray-400 hover:text-brand-red hover:border-brand-red/20 transition-all uppercase tracking-widest">
                        ABORTAR
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={() => projectToDelete && handleDelete(projectToDelete)}
        title="Descontinuar Ativo"
        message="Cuidado: Esta ação removerá permanentemente este projeto e todos os dados associados da rede central. Deseja proceder com a exclusão?"
        confirmLabel="Confirmar Exclusão"
        cancelLabel="Abortar"
      />
    </div>
  );
}
