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
  FileText,
  Download,
  Filter,
  PieChart as PieChartIcon,
  Tag,
  Calendar,
  Layers,
  ArrowRight,
  Activity,
  Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Project, Budget, BudgetItem } from '../types';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getData, saveData, logAction } from '../lib/storage';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORIES = [
  { id: 'HARDWARE', name: 'Hardware', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'SOFTWARE', name: 'Software', color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'SERVICE', name: 'Serviços', color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'PERSONNEL', name: 'Recursos Humanos', color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'OTHER', name: 'Outros', color: 'text-gray-500', bg: 'bg-gray-50' },
];

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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirm Dialog State
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  // New Item Form
  const [showItemForm, setShowItemForm] = useState(false);
  const [newItem, setNewItem] = useState({
    description: '',
    amount: '',
    category: 'HARDWARE' as any,
    type: 'despesa' as 'receita' | 'despesa'
  });

  // Create Budget Form
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');

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
    const data = getData('PROJECTS');
    setProjects(data);
    if (data.length > 0 && !selectedProjectId) {
      setSelectedProjectId(data[0].id);
    }
    setLoading(false);
  };

  const fetchBudgets = async (projectId: string) => {
    const allBudgets: Budget[] = getData('BUDGETS') || [];
    const projectBudgets = allBudgets.filter(b => b.projectId === projectId);
    setBudgets(projectBudgets);
    if (projectBudgets.length > 0) {
      setSelectedBudgetId(projectBudgets[0].id);
    } else {
      setSelectedBudgetId(null);
    }
  };

  const fetchItems = async (budgetId: string) => {
    setItemsLoading(true);
    const allItems: BudgetItem[] = getData('BUDGET_ITEMS') || [];
    const budgetItems = allItems.filter(i => i.budgetId === budgetId);
    setItems(budgetItems);
    setItemsLoading(false);
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newBudgetName) return;
    try {
      const allBudgets: Budget[] = getData('BUDGETS') || [];
      const newBudget: Budget = {
          id: Math.random().toString(36).substr(2, 9),
          projectId: selectedProjectId,
          name: newBudgetName,
          createdAt: new Date().toISOString()
      };
      saveData('BUDGETS', [...allBudgets, newBudget]);
      
      logAction(
        user?.id || 'sys', 
        user?.name || 'System', 
        'CREATE', 
        'BUDGET', 
        newBudget.id, 
        `Novo orçamento criado: ${newBudgetName}`
      );

      addToast('Orçamento criado com sucesso', 'success');
      setShowBudgetForm(false);
      setNewBudgetName('');
      fetchBudgets(selectedProjectId);
    } catch (err) {
      addToast('Erro ao criar orçamento', 'error');
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const allBudgets: Budget[] = getData('BUDGETS') || [];
      const allItems: BudgetItem[] = getData('BUDGET_ITEMS') || [];
      
      const budgetToDelete = allBudgets.find(b => b.id === budgetId);
      const updatedBudgets = allBudgets.filter(b => b.id !== budgetId);
      const updatedItems = allItems.filter(i => i.budgetId !== budgetId);
      
      saveData('BUDGETS', updatedBudgets);
      saveData('BUDGET_ITEMS', updatedItems);
      
      if (budgetToDelete) {
        logAction(
          user?.id || 'sys', 
          user?.name || 'System', 
          'DELETE', 
          'BUDGET', 
          budgetId, 
          `Orçamento removido: ${budgetToDelete.name}`
        );
      }

      addToast('Orçamento removido', 'success');
      if (selectedProjectId) fetchBudgets(selectedProjectId);
    } catch (err) {
      addToast('Erro ao remover orçamento', 'error');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBudgetId) return;
    try {
      const allItems: BudgetItem[] = getData('BUDGET_ITEMS') || [];
      const newBudgetItem: any = {
          id: Math.random().toString(36).substr(2, 9),
          budgetId: selectedBudgetId,
          description: newItem.description,
          amount: Number(newItem.amount),
          type: newItem.type,
          category: newItem.category,
          createdAt: new Date().toISOString()
      };
      saveData('BUDGET_ITEMS', [...allItems, newBudgetItem]);
      
      logAction(
        user?.id || 'sys', 
        user?.name || 'System', 
        'CREATE', 
        'BUDGET', 
        newBudgetItem.id, 
        `Lançamento financeiro: ${newItem.description} (${newItem.amount} EUR)`
      );

      addToast('Item adicionado', 'success');
      setShowItemForm(false);
      setNewItem({ description: '', amount: '', type: 'despesa', category: 'HARDWARE' });
      fetchItems(selectedBudgetId);
    } catch (err) {
      addToast('Erro ao adicionar item', 'error');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const allItems: BudgetItem[] = getData('BUDGET_ITEMS') || [];
      const itemToDelete = allItems.find(i => i.id === itemId);
      const updatedItems = allItems.filter(i => i.id !== itemId);
      saveData('BUDGET_ITEMS', updatedItems);
      
      if (itemToDelete) {
        logAction(
          user?.id || 'sys', 
          user?.name || 'System', 
          'DELETE', 
          'BUDGET', 
          itemId, 
          `Item orçamental removido: ${itemToDelete.description}`
        );
      }

      addToast('Item removido', 'success');
      if (selectedBudgetId) fetchItems(selectedBudgetId);
    } catch (err) {
      addToast('Erro ao remover item', 'error');
    }
  };

  const exportPDF = () => {
    if (!selectedBudgetId) return;
    
    const budget = budgets.find(b => b.id === selectedBudgetId);
    const project = projects.find(p => p.id === selectedProjectId);
    
    if (!budget || !project) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(30, 41, 59); // brand-slate
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('EFATA SYSTEM IT - ORÇAMENTO', 20, 25);
    
    // Info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text(`Projeto: ${project.name}`, 20, 50);
    doc.text(`Cliente: ${project.client}`, 20, 55);
    doc.text(`Orçamento: ${budget.name}`, 20, 60);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-PT')}`, 150, 50);
    
    // Table
    const tableData = items.map(item => [
      item.description,
      (item as any).category || 'N/A',
      item.type.toUpperCase(),
      item.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })
    ]);
    
    autoTable(doc, {
      startY: 70,
      head: [['Descrição', 'Categoria', 'Tipo', 'Valor']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: { 3: { halign: 'right' } }
    });
    
    // Footer / Summary
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text(`Total Receitas: ${totalRevenue.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}`, 140, finalY);
    doc.text(`Total Despesas: ${totalExpense.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}`, 140, finalY + 10);
    doc.setFontSize(14);
    doc.text(`Saldo Final: ${balance.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}`, 140, finalY + 25);
    
    doc.save(`Orcamento_${project.name.replace(/\s+/g, '_')}.pdf`);
    addToast('PDF gerado com sucesso', 'success');
  };

  const totalRevenue = items.filter(i => i.type === 'receita').reduce((sum, i) => sum + i.amount, 0);
  const totalExpense = items.filter(i => i.type === 'despesa').reduce((sum, i) => sum + i.amount, 0);
  const balance = totalRevenue - totalExpense;

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const selectedBudget = budgets.find(b => b.id === selectedBudgetId);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <h1 className="text-4xl font-black text-brand-slate flex items-center tracking-tight">
            <Wallet className="h-8 w-8 mr-4 text-brand-indigo"/> Finanças & Orçamentos
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-bold uppercase tracking-widest leading-loose">Monitorização e Alocação de Recursos</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-2xl border border-brand-cream-dark shadow-sm">
             <div className={`w-3 h-3 rounded-full ${balance >= 0 ? 'bg-brand-green animate-pulse' : 'bg-brand-red animate-pulse'}`}></div>
             <span className="text-[10px] font-black uppercase text-brand-slate tracking-widest">Estado Financeiro: {balance >= 0 ? 'Saudável' : 'Alerta'}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Project & Budget Navigation */}
        <div className="lg:col-span-4 space-y-8 h-full sticky top-8">
          <div className="p-6 bg-white rounded-[2.5rem] border border-brand-cream-dark shadow-[0_16px_32px_-8px_rgba(0,0,0,0.03)] flex flex-col h-[70vh]">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em] flex items-center">
                <Briefcase className="h-3 w-3 mr-2" /> Selecionar Ativo
              </h2>
            </div>
            
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-brand-cream border-none rounded-xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand-indigo/20 transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {filteredProjects.length === 0 && <p className="text-xs text-center text-gray-400 py-12 italic">Nenhum ativo localizado</p>}
              {filteredProjects.map(p => (
                <div key={p.id} className="space-y-1">
                  <button
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`w-full text-left p-4 rounded-3xl transition-all flex items-center justify-between group ${
                      selectedProjectId === p.id 
                        ? 'bg-brand-indigo text-white shadow-xl shadow-brand-indigo/30' 
                        : 'bg-brand-cream/50 hover:bg-white border border-brand-cream-dark'
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
                    {selectedProjectId === p.id && <ArrowRight className="h-4 w-4 text-white animate-in slide-in-from-left-2" />}
                  </button>
                  
                  {/* Nested Budgets for Selected Project */}
                  {selectedProjectId === p.id && (
                    <div className="pl-6 pt-2 space-y-2 animate-in slide-in-from-top-2 duration-300">
                       {budgets.map(b => (
                         <button
                           key={b.id}
                           onClick={() => setSelectedBudgetId(b.id)}
                           className={`w-full text-left p-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                             selectedBudgetId === b.id 
                               ? 'bg-brand-cream text-brand-indigo border border-brand-indigo/20' 
                               : 'text-gray-400 hover:text-brand-indigo'
                           }`}
                         >
                           #{b.name}
                         </button>
                       ))}
                       <button 
                        onClick={() => setShowBudgetForm(true)}
                        className="w-full p-3 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-brand-indigo/60 border border-dashed border-brand-indigo/20 hover:bg-brand-indigo/5 transition-all text-center"
                       >
                         + Novo Orçamento
                       </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Canvas */}
        <div className="lg:col-span-8 animate-in fade-in slide-in-from-right-4 duration-500">
          {selectedProjectId ? (
            <AnimatePresence mode="wait">
              {!selectedBudgetId ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-20 rounded-[4rem] border border-brand-cream-dark text-center shadow-sm"
                >
                  <div className="p-8 bg-brand-cream w-fit mx-auto rounded-[2.5rem] mb-10 shadow-inner">
                    <FileText className="h-12 w-12 text-brand-indigo/40" />
                  </div>
                  <h3 className="text-2xl font-black text-brand-slate uppercase tracking-tight mb-4">Módulo Financeiro Inativo</h3>
                  <p className="text-sm text-gray-400 max-w-sm mx-auto mb-10 leading-loose">
                    Para iniciar o monitoramento financeiro deste ativo, é necessário instanciar um novo plano orçamental.
                  </p>
                  <button 
                    onClick={() => setShowBudgetForm(true)}
                    className="inline-flex items-center space-x-3 bg-brand-indigo px-10 py-5 rounded-3xl text-sm font-black text-white hover:bg-brand-blue transition-all shadow-2xl shadow-brand-indigo/20 active:scale-95"
                  >
                    <Plus className="h-5 w-5" />
                    <span>GERAR PLANO ORÇAMENTAL</span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedBudgetId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  {/* Status Bar */}
                  <div className="flex items-center justify-between bg-white px-8 py-4 rounded-3xl border border-brand-cream-dark shadow-sm">
                    <div className="flex items-center space-x-4">
                       <Tag className="h-4 w-4 text-brand-indigo" />
                       <span className="text-sm font-black text-brand-slate uppercase tracking-tight">{selectedBudget?.name}</span>
                       <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">— {selectedProject?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                       <button 
                        onClick={exportPDF}
                        className="p-2.5 text-gray-400 hover:text-brand-indigo hover:bg-brand-indigo/5 rounded-xl transition-all"
                       >
                        <Download className="h-4 w-4" />
                       </button>
                       <button 
                        onClick={() => setBudgetToDelete(selectedBudgetId)}
                        className="p-2.5 text-gray-400 hover:text-brand-red hover:bg-brand-red/5 rounded-xl transition-all"
                       >
                        <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </div>

                  {/* Summary Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-[3rem] border border-brand-cream-dark shadow-sm group border-b-4 border-b-brand-green/20">
                      <div className="flex items-center justify-between mb-6">
                         <div className="p-3 bg-brand-green/10 rounded-2xl">
                           <TrendingUp className="h-6 w-6 text-brand-green" />
                         </div>
                         <PieChartIcon className="h-4 w-4 text-gray-200" />
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Cash Inflow</p>
                      <p className="text-3xl font-black text-brand-slate tabular-nums">
                        {totalRevenue.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>

                    <div className="bg-white p-8 rounded-[3rem] border border-brand-cream-dark shadow-sm group border-b-4 border-b-brand-red/20">
                      <div className="flex items-center justify-between mb-6">
                         <div className="p-3 bg-brand-red/10 rounded-2xl">
                           <TrendingDown className="h-6 w-6 text-brand-red" />
                         </div>
                         <Activity className="h-4 w-4 text-gray-200" />
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Cash Outflow</p>
                      <p className="text-3xl font-black text-brand-slate tabular-nums">
                        {totalExpense.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                      </p>
                    </div>

                    <div className={`p-8 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] transition-all flex flex-col justify-end ${balance >= 0 ? 'bg-brand-indigo text-white' : 'bg-brand-red text-white shadow-brand-red/25'}`}>
                      <div className="mb-auto flex justify-between items-start">
                         <div className="p-3 bg-white/20 rounded-2xl">
                           <DollarSign className="h-6 w-6 text-white" />
                         </div>
                         <div className="bg-white/10 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">SLA OK</div>
                      </div>
                      <div className="mt-8">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-2">Disponibilidade Líquida</p>
                        <p className="text-3xl font-black tabular-nums">
                          {balance.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items Detailed List */}
                  <div className="bg-white rounded-[3.5rem] border border-brand-cream-dark overflow-hidden shadow-[0_48px_80px_-24px_rgba(0,0,0,0.06)]">
                    <div className="p-10 border-bottom border-brand-cream-dark flex items-center justify-between bg-brand-cream/20">
                      <div className="flex items-center space-x-5">
                         <div className="p-4 bg-brand-indigo text-white rounded-[1.5rem] shadow-xl shadow-brand-indigo/20">
                            <Layers className="h-6 w-6" />
                         </div>
                         <div>
                            <h3 className="text-xl font-black text-brand-slate uppercase tracking-tight">Kernel Matrix</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center">
                              <Calendar className="h-3 w-3 mr-2" /> Financial Audit Stream
                            </p>
                         </div>
                      </div>
                      <button 
                        onClick={() => setShowItemForm(true)}
                        className="group flex items-center space-x-3 bg-brand-indigo px-8 py-4 rounded-[1.5rem] text-xs font-black text-white hover:bg-brand-blue transition-all active:scale-95 shadow-xl shadow-brand-indigo/15"
                      >
                        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                        <span>NOVA ALOCAÇÃO</span>
                      </button>
                    </div>

                    <div className="px-10 pb-10 pt-2">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-brand-cream-dark">
                            <th className="py-6 text-left text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Protocolo / Item</th>
                            <th className="py-6 text-left text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Categoria</th>
                            <th className="py-6 text-right text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Quantum (EUR)</th>
                            <th className="py-6 text-right text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Operação</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-cream-dark">
                          {itemsLoading ? (
                            <tr>
                              <td colSpan={4} className="py-20 text-center">
                                <Loader2 className="h-10 w-10 animate-spin text-brand-indigo mx-auto" />
                              </td>
                            </tr>
                          ) : items.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="py-24 text-center">
                                <div className="p-6 bg-brand-cream w-fit mx-auto rounded-3xl mb-4">
                                  <Database className="h-8 w-8 text-gray-300" />
                                </div>
                                <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Nenhuma transação registrada no kernel deste orçamento.</p>
                              </td>
                            </tr>
                          ) : items.map(item => {
                            const cat = CATEGORIES.find(c => c.id === (item as any).category) || CATEGORIES[0];
                            return (
                              <tr key={item.id} className="group hover:bg-brand-cream/30 transition-all duration-300">
                                <td className="py-8">
                                  <p className="font-black text-brand-slate uppercase truncate text-sm">
                                    {item.description}
                                  </p>
                                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1">
                                    REF: {item.id.toUpperCase()} • DE {new Date(item.createdAt).toLocaleDateString()}
                                  </p>
                                </td>
                                <td className="py-8">
                                  <div className={`inline-flex items-center px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-current opacity-70 ${cat.color} ${cat.bg}`}>
                                    {cat.name}
                                  </div>
                                </td>
                                <td className={`py-8 text-right font-black text-sm tabular-nums tracking-tight ${item.type === 'receita' ? 'text-brand-green' : 'text-brand-red'}`}>
                                  <div className="flex flex-col items-end">
                                    <span>{item.type === 'receita' ? '+ ' : '- '}{item.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</span>
                                    <span className="text-[8px] opacity-40 uppercase">Tax Incl.</span>
                                  </div>
                                </td>
                                <td className="py-8 text-right">
                                  <button 
                                    onClick={() => setItemToDelete(item.id)}
                                    className="p-3 text-gray-300 hover:text-brand-red hover:bg-brand-red/5 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                  >
                                    <Trash2 className="h-5 w-5" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="bg-white/40 border-2 border-dashed border-brand-cream-dark p-24 rounded-[5rem] text-center backdrop-blur-sm animate-pulse-slow">
              <div className="p-8 bg-white w-fit mx-auto rounded-[3rem] shadow-xl mb-10">
                <Briefcase className="h-14 w-14 text-brand-indigo opacity-10" />
              </div>
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] max-w-sm mx-auto leading-relaxed">
                Aguardando Ingestão de Dados: Selecione um Ativo no Painel Esquerdo para Auditoria Financeira.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Budget Modal */}
      <AnimatePresence>
        {showBudgetForm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBudgetForm(false)}
              className="absolute inset-0 bg-brand-slate/40 backdrop-blur-md"
            ></motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white p-12 rounded-[3.5rem] shadow-2xl border border-brand-cream-dark"
            >
              <div className="w-16 h-16 bg-brand-indigo/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                 <Layers className="h-8 w-8 text-brand-indigo" />
              </div>
              <h2 className="text-2xl font-black text-brand-slate uppercase text-center tracking-tight mb-8">Instanciar Novo Plano</h2>
              <form onSubmit={handleCreateBudget} className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 pl-2">Rótulo do Orçamento</label>
                  <input 
                    required
                    autoFocus
                    type="text" 
                    value={newBudgetName}
                    onChange={e => setNewBudgetName(e.target.value)}
                    className="w-full bg-brand-cream border-2 border-brand-cream-dark p-5 rounded-3xl outline-none focus:border-brand-indigo/40 focus:ring-4 focus:ring-brand-indigo/5 text-sm font-black uppercase text-brand-slate transition-all"
                    placeholder="ex: Q3 Infra Build 2026"
                  />
                </div>
                <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowBudgetForm(false)}
                    className="flex-1 p-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-brand-cream transition-colors"
                  >
                    Retroceder
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-indigo p-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-blue transition-all shadow-2xl shadow-brand-indigo/25 active:scale-95"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* New Item Modal */}
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
              className="relative w-full max-w-lg bg-white p-12 rounded-[4rem] shadow-2xl border border-brand-cream-dark"
            >
              <div className="w-16 h-16 bg-brand-orange/10 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                 <DollarSign className="h-8 w-8 text-brand-orange" />
              </div>
              <h2 className="text-2xl font-black text-brand-slate uppercase text-center tracking-tight mb-10">Novo Registro de Fluxo</h2>
              <form onSubmit={handleAddItem} className="space-y-8">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 pl-2">Natureza da Operação</label>
                  <input 
                    required
                    autoFocus
                    type="text" 
                    value={newItem.description}
                    onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full bg-brand-cream border-2 border-brand-cream-dark p-5 rounded-3xl outline-none focus:border-brand-indigo/40 text-sm font-black uppercase text-brand-slate"
                    placeholder="ex: Aquisição de Rack 42U"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 pl-2">Protocolo</label>
                    <select 
                      value={newItem.type}
                      onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
                      className="w-full bg-brand-cream border-2 border-brand-cream-dark p-5 rounded-3xl outline-none focus:border-brand-indigo/40 text-sm font-black uppercase text-brand-slate appearance-none cursor-pointer"
                    >
                      <option value="despesa">Cash Out (Despesa)</option>
                      <option value="receita">Cash In (Receita)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 pl-2">Categoria</label>
                    <select 
                      value={newItem.category}
                      onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
                      className="w-full bg-brand-cream border-2 border-brand-cream-dark p-5 rounded-3xl outline-none focus:border-brand-indigo/40 text-sm font-black uppercase text-brand-slate appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3 pl-2">Magnitude (EUR)</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400">€</span>
                    <input 
                      required
                      type="number" 
                      step="0.01"
                      value={newItem.amount}
                      onChange={e => setNewItem({ ...newItem, amount: e.target.value })}
                      className="w-full bg-brand-cream border-2 border-brand-cream-dark p-5 pl-12 rounded-3xl outline-none focus:border-brand-indigo/40 text-sm font-black text-brand-slate"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowItemForm(false)}
                    className="flex-1 p-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:bg-brand-cream transition-colors"
                  >
                    Retroceder
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-brand-indigo p-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-brand-blue transition-all shadow-2xl shadow-brand-indigo/25"
                  >
                    Confirmar Envio
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
        title="Neutralizar Registro"
        message="Deseja revogar permanentemente este lançamento financeiro? O histórico de auditoria será mantido."
        confirmLabel="Remover Item"
        cancelLabel="Cancelar"
      />

      <ConfirmDialog
        isOpen={!!budgetToDelete}
        onClose={() => setBudgetToDelete(null)}
        onConfirm={() => budgetToDelete && handleDeleteBudget(budgetToDelete)}
        title="Destruir Plano Orçamental"
        message="Isto removerá o orçamente e todos os itens associados de forma irreversível. Deseja prosseguir?"
        confirmLabel="Eliminar Tudo"
        cancelLabel="Cancelar"
      />
    </div>
  );
}
