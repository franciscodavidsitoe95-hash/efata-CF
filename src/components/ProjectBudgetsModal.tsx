import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle, Clock, DollarSign, TrendingUp, TrendingDown, Trash } from 'lucide-react';
import type { Project } from '../pages/Projects';

export interface BudgetItem {
  id: string;
  budgetId: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  createdAt: string;
}

export interface Budget {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

interface ProjectBudgetsModalProps {
  project: Project;
  onClose: () => void;
}

export function ProjectBudgetsModal({ project, onClose }: ProjectBudgetsModalProps) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddingBudget, setIsAddingBudget] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');

  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemType, setNewItemType] = useState<'receita' | 'despesa'>('despesa');

  useEffect(() => {
    fetchBudgets();
  }, [project.id]);

  useEffect(() => {
    if (selectedBudget) {
      fetchBudgetItems(selectedBudget.id);
    } else {
      setBudgetItems([]);
    }
  }, [selectedBudget]);

  const fetchBudgets = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/budgets`);
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
        if (data.length > 0 && !selectedBudget) {
          setSelectedBudget(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetItems = async (budgetId: string) => {
    try {
      const res = await fetch(`/api/budgets/${budgetId}/items`);
      if (res.ok) {
        const data = await res.json();
        setBudgetItems(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudgetName) return;
    try {
      const res = await fetch(`/api/projects/${project.id}/budgets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBudgetName })
      });
      if (res.ok) {
        const newlyCreated = await res.json();
        setBudgets([...budgets, newlyCreated]);
        setSelectedBudget(newlyCreated);
        setNewBudgetName('');
        setIsAddingBudget(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBudget = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Tem certeza que deseja excluir esta tabela orçamentária? Todos os itens dela serão perdidos.')) return;
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBudgets(budgets.filter(b => b.id !== id));
        if (selectedBudget?.id === id) {
          setSelectedBudget(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudget) return;
    try {
      const res = await fetch(`/api/budgets/${selectedBudget.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newItemDesc,
          amount: Number(newItemAmount),
          type: newItemType
        })
      });
      if (res.ok) {
        const created = await res.json();
        setBudgetItems([...budgetItems, created]);
        setIsAddingItem(false);
        setNewItemDesc('');
        setNewItemAmount('');
        setNewItemType('despesa');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const res = await fetch(`/api/budget-items/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBudgetItems(budgetItems.filter(i => i.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalReceitas = budgetItems.filter(i => i.type === 'receita').reduce((sum, i) => sum + i.amount, 0);
  const totalDespesas = budgetItems.filter(i => i.type === 'despesa').reduce((sum, i) => sum + i.amount, 0);
  const totalSaldo = totalReceitas - totalDespesas;

  return (
    <div className="relative z-20" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl flex h-[80vh] flex-col">
            
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Orçamentos: {project.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Orçamento Base do Projeto: {formatCurrency(project.budget)}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar: Budgets List */}
              <div className="w-1/3 border-r border-gray-200 bg-gray-50 flex flex-col overflow-y-auto">
                <div className="p-4 border-b border-gray-200">
                  {isAddingBudget ? (
                    <form onSubmit={handleCreateBudget} className="space-y-2">
                       <input 
                         type="text" 
                         autoFocus
                         placeholder="Nome da Tabela..." 
                         value={newBudgetName} 
                         onChange={e => setNewBudgetName(e.target.value)}
                         className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-1.5 border"
                       />
                       <div className="flex justify-end space-x-2">
                         <button type="button" onClick={() => setIsAddingBudget(false)} className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-700">Cancel</button>
                         <button type="submit" className="text-xs px-2 py-1 bg-indigo-600 rounded text-white">Criar</button>
                       </div>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setIsAddingBudget(true)}
                      className="w-full flex items-center justify-center space-x-2 rounded bg-white px-2 py-2 text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Nova Tabela</span>
                    </button>
                  )}
                </div>
                
                <div className="flex-1 p-2 space-y-1">
                  {loading ? (
                    <p className="text-xs text-center p-4 text-gray-500">Caregando...</p>
                  ) : budgets.length === 0 ? (
                    <p className="text-xs text-center p-4 text-gray-500">Nenhuma tabela criada</p>
                  ) : (
                    budgets.map(b => (
                      <div 
                        key={b.id} 
                        onClick={() => setSelectedBudget(b)}
                        className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${selectedBudget?.id === b.id ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-gray-200 text-gray-700'}`}
                      >
                        <span className="text-sm font-medium truncate pr-2">{b.name}</span>
                        <button onClick={(e) => handleDeleteBudget(b.id, e)} className="text-gray-400 hover:text-red-600 focus:outline-none">
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Main Content: Budget Items */}
              <div className="w-2/3 bg-white flex flex-col overflow-y-auto">
                {selectedBudget ? (
                  <>
                    <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-bold text-gray-900">{selectedBudget.name}</h4>
                        <button onClick={() => setIsAddingItem(!isAddingItem)} className="flex items-center space-x-1 text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100">
                          <Plus className="h-4 w-4" /> <span>Adicionar Item</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-2">
                        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                          <span className="text-xs text-green-700 uppercase font-bold flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" /> Receitas
                          </span>
                          <span className="block mt-1 text-sm lg:text-base font-bold text-green-900">{formatCurrency(totalReceitas)}</span>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                          <span className="text-xs text-red-700 uppercase font-bold flex items-center">
                            <TrendingDown className="h-3 w-3 mr-1" /> Despesas
                          </span>
                          <span className="block mt-1 text-sm lg:text-base font-bold text-red-900">{formatCurrency(totalDespesas)}</span>
                        </div>
                        <div className={`p-3 rounded-lg border ${totalSaldo >= 0 ? 'bg-blue-50 border-blue-100' : 'bg-orange-50 border-orange-100'}`}>
                          <span className={`text-xs uppercase font-bold ${totalSaldo >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>Saldo Líquido</span>
                          <span className={`block mt-1 text-sm lg:text-base font-bold ${totalSaldo >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>{formatCurrency(totalSaldo)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {isAddingItem && (
                        <form onSubmit={handleCreateItem} className="mb-6 bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-700">Descrição do Lançamento</label>
                            <input type="text" required value={newItemDesc} onChange={e=>setNewItemDesc(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Valor (R$)</label>
                              <input type="number" required min="0" step="0.01" value={newItemAmount} onChange={e=>setNewItemAmount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Tipo</label>
                              <select value={newItemType} onChange={e=>setNewItemType(e.target.value as 'receita' | 'despesa')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border">
                                <option value="despesa">Despesa</option>
                                <option value="receita">Receita</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 pt-2">
                            <button type="button" onClick={() => setIsAddingItem(false)} className="px-3 py-1.5 text-xs rounded bg-white text-gray-700 border hover:bg-gray-50">Cancelar</button>
                            <button type="submit" className="px-3 py-1.5 text-xs rounded bg-indigo-600 text-white font-medium hover:bg-indigo-700">Salvar Item</button>
                          </div>
                        </form>
                      )}

                      <div className="space-y-2">
                        {budgetItems.length === 0 && !isAddingItem && (
                          <div className="text-center py-10">
                            <p className="text-sm text-gray-500">Esta tabela está vazia.</p>
                          </div>
                        )}
                        {budgetItems.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:bg-gray-50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <div className={`p-2 rounded-full ${item.type === 'receita' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {item.type === 'receita' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{item.description}</p>
                                <p className="text-xs text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`font-semibold text-sm ${item.type === 'receita' ? 'text-green-600' : 'text-red-600'}`}>
                                {item.type === 'receita' ? '+' : '-'}{formatCurrency(item.amount)}
                              </span>
                              <button onClick={() => handleDeleteItem(item.id)} className="text-gray-400 hover:text-red-500 focus:outline-none">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/50">
                    <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Nenhuma Tabela Selecionada</h3>
                    <p className="text-sm text-gray-500 max-w-sm mt-1">Selecione uma tabela na lateral ou crie uma nova para começar a lançar receitas e despesas.</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
