import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Plus, 
  Trash2, 
  Search, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Briefcase,
  ChevronRight,
  Loader2,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Project, Budget, BudgetItem } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';

export default function Budgets() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  
  // Confirm Dialog State
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // New Item Form
  const [showItemForm, setShowItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    description: '',
    amount: '',
    type: 'despesa' as 'receita' | 'despesa'
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchBudgets(selectedProjectId);
    } else {
      setBudgets([]);
      setSelectedBudgetId(null);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedBudgetId) {
      fetchItems(selectedBudgetId);
    } else {
      setItems([]);
    }
  }, [selectedBudgetId]);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgets = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/budgets`);
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
        if (data.length > 0) {
          setSelectedBudgetId(data[0].id);
        } else {
          setSelectedBudgetId(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async (budgetId: string) => {
    setItemsLoading(true);
    try {
      const res = await fetch(`/api/budgets/${budgetId}/items`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setItemsLoading(false);
    }
  };

  const handleCreateBudget = async () => {
    if (!selectedProjectId) return;
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Orçamento Base' })
      });
      if (res.ok) {
        addToast('Orçamento criado com sucesso', 'success');
        fetchBudgets(selectedProjectId);
      }
    } catch (err) {
      addToast('Erro ao criar orçamento', 'error');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudgetId) return;
    try {
      const res = await fetch(`/api/budgets/${selectedBudgetId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
      if (res.ok) {
        addToast('Item adicionado', 'success');
        setShowItemForm(false);
        setNewItem({ description: '', amount: '', type: 'despesa' });
        fetchItems(selectedBudgetId);
      }
    } catch (err) {
      addToast('Erro ao adicionar item', 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/budget-items/${itemId}`, { method: 'DELETE' });
      if (res.ok) {
        addToast('Item removido', 'success');
        if (selectedBudgetId) fetchItems(selectedBudgetId);
      } else {
        addToast('Erro ao remover item', 'error');
      }
    } catch (err) {
      addToast('Erro ao remover item', 'error');
    }
  };

  const totalRevenue = items.filter(i => i.type === 'receita').reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = items.filter(i => i.type === 'despesa').reduce((sum, i) => sum + i.amount, 0);
  const balance = totalRevenue - totalExpense;

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-brand-cream">
        <Loader2 className="h-10 w-10 animate-spin text-brand-indigo" />
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-brand-slate flex items-center tracking-tight">
            <Wallet className="h-8 w-8 mr-4 text-brand-indigo"/> Gestão Orçamental
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-bold uppercase tracking-widest leading-loose">Controlo Financeiro Efata System</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Project Selector */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 bg-white rounded-[2rem] border border-brand-cream-dark shadow-sm">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center">
              <Briefcase className="h-3 w-3 mr-2" /> Selecionar Projeto
            </h2>
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {projects.length === 0 && <p className="text-xs text-center text-gray-400 py-8">Nenhum projeto encontrado</p>}
              {projects.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProjectId(p.id)}
                  className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${
                    selectedProjectId === p.id 
                      ? 'bg-brand-indigo text-white shadow-lg shadow-brand-indigo/20' 
                      : 'bg-brand-cream hover:bg-white border border-brand-cream-dark'
                  }`}
                >
                  <div className="truncate pr-4">
                    <p className={`text-sm font-black uppercase tracking-tight truncate ${selectedProjectId === p.id ? 'text-white' : 'text-brand-slate'}`}>
                      {p.name}
                    </p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${selectedProjectId === p.id ? 'text-white/60' : 'text-gray-400'}`}>
                      {p.client}
                    </p>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${selectedProjectId === p.id ? 'translate-x-1' : 'text-gray-300 group-hover:translate-x-1'}`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Budget Details */}
        <div className="lg:col-span-8">
          {selectedProjectId ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedProjectId}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {budgets.length === 0 ? (
                  <div className="bg-white p-12 rounded-[3rem] border border-brand-cream-dark text-center">
                    <div className="p-4 bg-brand-cream w-fit mx-auto rounded-3xl mb-6">
                      <DollarSign className="h-8 w-8 text-brand-indigo" />
                    </div>
                    <h3 className="text-xl font-black text-brand-slate uppercase mb-4">Sem Orçamento Ativo</h3>
                    <p className="text-sm text-gray-400 max-w-sm mx-auto mb-8">
                      Este projeto ainda não possui um plano orçamental configurado.
                    </p>
                    <button 
                      onClick={handleCreateBudget}
                      className="inline-flex items-center space-x-2 bg-brand-indigo px-8 py-4 rounded-2xl text-xs font-black text-white hover:bg-brand-blue transition-all shadow-xl shadow-brand-indigo/20 active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      <span>CRIAR PLANO ORÇAMENTAL</span>
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-white p-6 rounded-[2rem] border border-brand-cream-dark shadow-sm group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center space-x-3 mb-4">
                           <div className="p-2.5 bg-brand-green/10 rounded-xl">
                             <TrendingUp className="h-4 w-4 text-brand-green" />
                           </div>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Receitas</span>
                        </div>
                        <p className="text-2xl font-black text-brand-slate tabular-nums">
                          {totalRevenue.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>

                      <div className="bg-white p-6 rounded-[2rem] border border-brand-cream-dark shadow-sm group hover:scale-[1.02] transition-transform">
                        <div className="flex items-center space-x-3 mb-4">
                           <div className="p-2.5 bg-brand-red/10 rounded-xl">
                             <TrendingDown className="h-4 w-4 text-brand-red" />
                           </div>
                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Despesas</span>
                        </div>
                        <p className="text-2xl font-black text-brand-slate tabular-nums">
                          {totalExpense.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>

                      <div className={`p-6 rounded-[2rem] border border-brand-cream-dark shadow-xl transition-all ${balance >= 0 ? 'bg-brand-indigo text-white' : 'bg-brand-red text-white shadow-brand-red/20'}`}>
                        <div className="flex items-center space-x-3 mb-4">
                           <div className="p-2.5 bg-white/20 rounded-xl">
                             <DollarSign className="h-4 w-4 text-white" />
                           </div>
                           <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Saldo</span>
                        </div>
                        <p className="text-2xl font-black tabular-nums">
                          {balance.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="bg-white rounded-[3rem] border border-brand-cream-dark overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)]">
                      <div className="p-8 border-bottom border-brand-cream-dark flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-black text-brand-slate uppercase tracking-tight">Discriminação de Itens</h3>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedProject?.name}</p>
                        </div>
                        <button 
                          onClick={() => setShowItemForm(true)}
                          className="p-3 bg-brand-indigo rounded-2xl text-white hover:bg-brand-blue transition-all active:scale-95 shadow-lg shadow-brand-indigo/10"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="px-8 pb-8">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-brand-cream-dark">
                              <th className="py-4 text-left text-[10px] font-bold text-gray-300 uppercase tracking-widest">Descrição</th>
                              <th className="py-4 text-left text-[10px] font-bold text-gray-300 uppercase tracking-widest">Tipo</th>
                              <th className="py-4 text-right text-[10px] font-bold text-gray-300 uppercase tracking-widest">Valor</th>
                              <th className="py-4 text-right text-[10px] font-bold text-gray-300 uppercase tracking-widest">Ações</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-brand-cream-dark">
                            {itemsLoading ? (
                              <tr>
                                <td colSpan={4} className="py-12 text-center">
                                  <Loader2 className="h-8 w-8 animate-spin text-brand-indigo mx-auto" />
                                </td>
                              </tr>
                            ) : items.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-12 text-center text-gray-400 text-sm">Nenhum item registado</td>
                              </tr>
                            ) : items.map(item => (
                              <tr key={item.id} className="group hover:bg-brand-cream/50 transition-colors">
                                <td className="py-6 font-black text-brand-slate uppercase truncate text-sm max-w-[200px]">
                                  {item.description}
                                </td>
                                <td className="py-6">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                    item.type === 'receita' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-red/10 text-brand-red'
                                  }`}>
                                    {item.type}
                                  </span>
                                </td>
                                <td className={`py-6 text-right font-black text-sm tabular-nums ${item.type === 'receita' ? 'text-brand-green' : 'text-brand-red'}`}>
                                  {item.type === 'receita' ? '+' : '-'} {item.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                                </td>
                                <td className="py-6 text-right">
                                  <button 
                                    onClick={() => setItemToDelete(item.id)}
                                    className="p-2 text-gray-300 hover:text-brand-red transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="bg-white/40 border border-dashed border-brand-cream-dark p-20 rounded-[4rem] text-center">
              <div className="p-6 bg-white w-fit mx-auto rounded-full shadow-sm mb-8">
                <Search className="h-10 w-10 text-brand-indigo opacity-20" />
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
                Aguardando Seleção de Infraestrutura
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Item Modal Overlay */}
      <AnimatePresence>
        {showItemForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowItemForm(false)}
              className="absolute inset-0 bg-brand-slate/40 backdrop-blur-md"
            ></motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-brand-cream-dark"
            >
              <h2 className="text-2xl font-black text-brand-slate uppercase tracking-tight mb-8">Novo Lançamento</h2>
              <form onSubmit={handleAddItem} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Descrição do Movimento</label>
                  <input 
                    required
                    type="text" 
                    value={newItem.description}
                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full bg-brand-cream border border-brand-cream-dark p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-indigo/20 text-sm font-black uppercase text-brand-slate"
                    placeholder="ex: Hardware Server Up"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Valor</label>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={newItem.amount}
                      onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                      className="w-full bg-brand-cream border border-brand-cream-dark p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-indigo/20 text-sm font-black text-brand-slate"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tipo</label>
                    <select 
                      value={newItem.type}
                      onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
                      className="w-full bg-brand-cream border border-brand-cream-dark p-4 rounded-2xl outline-none focus:ring-2 focus:ring-brand-indigo/20 text-sm font-black uppercase text-brand-slate"
                    >
                      <option value="despesa">Despesa</option>
                      <option value="receita">Receita</option>
                    </select>
                  </div>
                </div>
                <div className="pt-6 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowItemForm(false)}
                    className="flex-1 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-brand-cream transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-indigo p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-brand-blue transition-all shadow-xl shadow-brand-indigo/20 active:scale-95"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={() => itemToDelete && handleDeleteItem(itemToDelete)}
        title="Remover Item Orçamental"
        message="Deseja realmente excluir este lançamento do orçamento? Esta ação não pode ser desfeita."
        confirmLabel="Remover Item"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
