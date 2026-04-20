import React, { useState } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'motion/react';
import type { Project } from '../pages/Projects';

export interface Task {
  id: string;
  name: string;
  responsibleId?: string;
  responsibleName?: string;
  weight: number;
  status: 'pendente' | 'em_andamento' | 'concluida';
  createdAt: string;
}

interface SimpleUser {
  id: string;
  name: string;
  role: string;
}

interface ProjectTasksModalProps {
  project: Project;
  availableUsers: SimpleUser[];
  onClose: () => void;
  onUpdateTasks: (projectId: string, tasks: Task[]) => Promise<void>;
}

export function ProjectTasksModal({ project, availableUsers, onClose, onUpdateTasks }: ProjectTasksModalProps) {
  const [tasks, setTasks] = useState<Task[]>(project.tasks || []);
  const [isAdding, setIsAdding] = useState(false);
  const { addToast } = useToast();
  
  // New Task Form
  const [name, setName] = useState('');
  const [responsibleId, setResponsibleId] = useState('');
  const [weight, setWeight] = useState<string>('');
  const [status, setStatus] = useState<Task['status']>('pendente');

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const responsibleName = availableUsers.find(u => u.id === responsibleId)?.name;
      const newTask: Task = {
        id: crypto.randomUUID(),
        name,
        responsibleId,
        responsibleName,
        weight: Number(weight) || 0,
        status,
        createdAt: new Date().toISOString()
      };
      
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      await onUpdateTasks(project.id, updatedTasks);

      // Log Task Creation
      const { logAction } = await import('../lib/storage');
      logAction(
        'sys', 
        'System', 
        'CREATE', 
        'TASK', 
        newTask.id, 
        `Nova Tarefa "${name}" criada para Ativo: ${project.name}`
      );

      addToast(`Tarefa "${name}" criada com sucesso!`, 'success');
      
      setIsAdding(false);
      setName('');
      setResponsibleId('');
      setWeight('');
      setStatus('pendente');
    } catch (err) {
      addToast('Erro ao adicionar tarefa', 'error');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Excluir esta tarefa?')) return;
    try {
      const taskToDelete = tasks.find(t => t.id === taskId);
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      setTasks(updatedTasks);
      await onUpdateTasks(project.id, updatedTasks);
      
      if (taskToDelete) {
        const { logAction } = await import('../lib/storage');
        logAction(
          'sys', 
          'System', 
          'DELETE', 
          'TASK', 
          taskId, 
          `Tarefa "${taskToDelete.name}" revogada do Ativo: ${project.name}`
        );
      }
      
      addToast('Tarefa removida', 'info');
    } catch (err) {
      addToast('Erro ao remover tarefa', 'error');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: Task['status']) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t);
      setTasks(updatedTasks);
      await onUpdateTasks(project.id, updatedTasks);

      const { logAction } = await import('../lib/storage');
      logAction(
        'sys', 
        'System', 
        'UPDATE', 
        'TASK', 
        taskId, 
        `Estado da Tarefa "${task?.name}" alterado para ${newStatus} no Ativo: ${project.name}`
      );

      if (newStatus === 'concluida') {
        addToast(`Tarefa "${task?.name}" marcada como concluída!`, 'success');
      } else {
        addToast(`Status da tarefa "${task?.name}" alterado`, 'info');
      }
    } catch (err) {
      addToast('Erro ao atualizar status', 'error');
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    if (status === 'concluida') return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (status === 'em_andamento') return <Clock className="h-5 w-5 text-blue-500" />;
    return <Circle className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="relative z-[150]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-brand-slate/40 backdrop-blur-sm transition-opacity"></div>
      <div className="fixed inset-0 z-[150] w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-6">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative transform overflow-hidden rounded-[3rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-brand-cream-dark"
          >
            
            <div className="bg-brand-cream px-10 py-8 border-b border-brand-cream-dark flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-brand-slate uppercase tracking-tight">
                  Tarefas: {project.name}
                </h3>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gestão de Implementação</p>
              </div>
              <button type="button" onClick={onClose} className="p-3 bg-white border border-brand-cream-dark rounded-2xl text-gray-400 hover:text-brand-indigo transition-all shadow-sm">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-10 py-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="mb-8 flex items-center space-x-2 rounded-2xl bg-brand-indigo px-8 py-4 text-center text-sm font-black text-white shadow-xl shadow-brand-indigo/25 hover:bg-brand-blue transition-all transform active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>DEFINIR NOVA TAREFA</span>
                </button>
              )}

              {isAdding && (
                <motion.form 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleAddTask} 
                  className="mb-10 bg-brand-cream p-8 rounded-[2rem] border border-brand-cream-dark space-y-6"
                >
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Identificação da Tarefa *</label>
                      <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="w-full bg-white border border-brand-cream-dark px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-indigo/20 text-sm font-black uppercase text-brand-slate" placeholder="ex: Configuração de Firewall" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Responsável Técnico</label>
                      <select value={responsibleId} onChange={e=>setResponsibleId(e.target.value)} className="w-full bg-white border border-brand-cream-dark px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-indigo/20 text-sm font-black uppercase text-brand-slate">
                        <option value="">Ninguém atribuído</option>
                        {availableUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Peso (%)</label>
                        <input type="number" required min="1" max="100" value={weight} onChange={e=>setWeight(e.target.value)} className="w-full bg-white border border-brand-cream-dark px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-indigo/20 text-sm font-black text-brand-slate" placeholder="0" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Status</label>
                        <select value={status} onChange={e=>setStatus(e.target.value as Task['status'])} className="w-full bg-white border border-brand-cream-dark px-5 py-4 rounded-xl outline-none focus:ring-2 focus:ring-brand-indigo/20 text-sm font-black uppercase text-brand-slate">
                          <option value="pendente">Pendente</option>
                          <option value="em_andamento">Em Andamento</option>
                          <option value="concluida">Concluída</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">CANCELAR</button>
                    <button type="submit" className="bg-brand-indigo px-8 py-4 rounded-xl text-[10px] font-black text-white hover:bg-brand-blue transition-all">CONSOLIDAR TAREFA</button>
                  </div>
                </motion.form>
              )}

              <div className="space-y-4">
                {tasks.length === 0 && !isAdding && (
                  <p className="text-center py-10 text-gray-400 text-sm font-bold uppercase tracking-widest">Aguardando definição de tarefas...</p>
                )}
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-6 bg-brand-cream rounded-[2rem] border border-brand-cream-dark hover:bg-white transition-all group">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <button 
                        onClick={() => {
                          const nextStatus = task.status === 'pendente' ? 'em_andamento' : task.status === 'em_andamento' ? 'concluida' : 'pendente';
                          handleStatusChange(task.id, nextStatus);
                        }} 
                        className="mt-0.5 focus:outline-none transition-transform active:scale-90"
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div className="truncate">
                        <p className={`text-sm font-black uppercase tracking-tight truncate ${task.status === 'concluida' ? 'text-gray-400 line-through' : 'text-brand-slate'}`}>
                          {task.name}
                        </p>
                        <div className="flex items-center space-x-3 mt-1">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                            Resp: {task.responsibleName || 'Sistema'}
                          </p>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <p className="text-[9px] font-black text-brand-indigo uppercase tracking-widest">
                            Impacto: {task.weight}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTask(task.id)} className="p-2.5 text-gray-300 hover:text-brand-red hover:bg-brand-red/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
