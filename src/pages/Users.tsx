import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Pencil, Trash2, Plus, X, Loader2, ShieldAlert, Users as UsersIcon, Fingerprint, Activity } from 'lucide-react';
import { User, Role } from '../contexts/AuthContext';
import { getData, saveData, logAction } from '../lib/storage';

export default function Users() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('funcionario');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setUsers(getData('USERS') || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('funcionario');
    setEditingUser(null);
    setSubmitError('');
  };

  const openModal = (u?: User) => {
    resetForm();
    if (u) {
      setEditingUser(u);
      setName(u.name);
      setEmail(u.email);
      setRole(u.role);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);

    const allUsers = getData('USERS') || [];

    if (!editingUser) {
        // Create
        // check if email exists
        if (allUsers.some(u => u.email === email)) {
            setSubmitError('Email já está em uso.');
            setIsSubmitting(false);
            return;
        }
        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
            password,
            role,
            createdAt: new Date().toISOString()
        };
        saveData('USERS', [...allUsers, newUser]);
        
        logAction(
          user?.id || 'sys', 
          user?.name || 'System', 
          'CREATE', 
          'USER', 
          newUser.id, 
          `Credencial gerada: ${newUser.name} (${newUser.role})`
        );
    } else {
        // Update
        if (editingUser.isImmutable) {
            setSubmitError('Credenciais vitais do sistema não podem ser alteradas.');
            setIsSubmitting(false);
            return;
        }

        // check if email exists on another user
        if (allUsers.some(u => u.email === email && u.id !== editingUser.id)) {
            setSubmitError('Email já está em uso por outro utilizador.');
            setIsSubmitting(false);
            return;
        }

        const updatedUsers = allUsers.map(u => {
            if (u.id === editingUser.id) {
                return {
                    ...u,
                    name,
                    email,
                    role,
                    ...(password ? { password } : {})
                };
            }
            return u;
        });
        saveData('USERS', updatedUsers);
        
        logAction(
          user?.id || 'sys', 
          user?.name || 'System', 
          'UPDATE', 
          'USER', 
          editingUser.id, 
          `Credencial modificada: ${editingUser.name}`
        );
    }

    await fetchUsers();
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (id === user?.id) {
      alert('Impossível auto-terminar sessão administrativa!');
      return;
    }
    
    const allUsers = getData('USERS') || [];
    const userToDelete = allUsers.find(u => u.id === id);
    
    if (userToDelete?.isImmutable) {
      alert('Este é um administrador de sistema vital e não pode ser revogado.');
      return;
    }

    if (!window.confirm('ALERTA: Deseja revogar permanentemente o acesso deste utilizador?')) return;

    const updatedUsers = allUsers.filter(u => u.id !== id);
    saveData('USERS', updatedUsers);
    
    if (userToDelete) {
      logAction(
        user?.id || 'sys', 
        user?.name || 'System', 
        'DELETE', 
        'USER', 
        id, 
        `Credencial revogada: ${userToDelete.name}`
      );
    }
    
    await fetchUsers();
  };

  if (loading) {
    return <div className="flex justify-center p-12 bg-brand-cream min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-brand-indigo mt-24" /></div>;
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-16">
        <div className="h-28 w-28 bg-brand-red/10 rounded-[2rem] flex items-center justify-center mb-10 shadow-xl shadow-brand-red/5">
          <ShieldAlert className="h-14 w-14 text-brand-red" />
        </div>
        <h2 className="text-4xl font-black text-brand-slate uppercase tracking-tight mb-4">Access Denied</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest max-w-md text-sm leading-loose">Protocolo de segurança ativado. A sua credencial não possui privilégios de nível ROOT para esta área.</p>
        <button onClick={() => window.history.back()} className="mt-12 px-8 py-4 bg-brand-indigo text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-indigo/20 hover:bg-brand-blue transition-all">
          Retornar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 lg:p-12">
      <div className="sm:flex sm:items-center sm:justify-between mb-16">
        <div>
          <h1 className="text-4xl font-black text-brand-slate flex items-center tracking-tight">
            <Fingerprint className="h-8 w-8 mr-4 text-brand-indigo"/> Identidades & Permissões
          </h1>
          <p className="mt-2 text-sm text-gray-400 font-bold uppercase tracking-widest leading-loose">Diretório Central Efata IT</p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 rounded-2xl bg-brand-indigo px-8 py-4 text-center text-sm font-black text-white shadow-xl shadow-brand-indigo/25 hover:bg-brand-blue transition-all transform active:scale-95"
          >
            <Plus className="h-5 w-5" />
            <span>ADICIONAR UTILIZADOR</span>
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] rounded-[3rem] border border-brand-cream-dark">
              <table className="min-w-full divide-y divide-brand-cream-dark">
                <thead className="bg-brand-cream">
                  <tr>
                    <th className="py-6 pl-10 pr-3 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Identidade</th>
                    <th className="px-3 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Email Institucional</th>
                    <th className="px-3 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Nível de Acesso</th>
                    <th className="px-3 py-6 text-left text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Status de Rede</th>
                    <th className="relative py-6 pl-3 pr-10 text-right text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-cream-dark bg-white">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-brand-cream/40 transition-all duration-300 group">
                      <td className="whitespace-nowrap py-6 pl-10 pr-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-xl bg-brand-indigo/10 flex items-center justify-center text-brand-indigo font-black text-xs mr-4 group-hover:scale-110 transition-transform">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="text-sm font-black text-brand-slate uppercase tracking-tight">{u.name}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-6 text-sm font-bold text-gray-400">{u.email}</td>
                      <td className="whitespace-nowrap px-3 py-6">
                        <span className={`inline-flex items-center rounded-xl px-4 py-1.5 text-[9px] font-black uppercase tracking-[0.15em] ring-1 ring-inset ${
                          u.role === 'admin' ? 'bg-brand-indigo/10 text-brand-indigo ring-brand-indigo/20' :
                          u.role === 'gestor' ? 'bg-brand-orange/10 text-brand-orange ring-brand-orange/20' :
                          'bg-brand-slate/5 text-brand-slate ring-brand-slate/10'
                        }`}>
                          {u.role === 'admin' ? 'Root Admin' : u.role === 'gestor' ? 'IT Manager' : 'Operator'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-6">
                        <div className="flex items-center text-[10px] font-black text-brand-green uppercase tracking-widest">
                          <Activity className="h-3 w-3 mr-2 animate-pulse" /> Active
                        </div>
                      </td>
                      <td className="relative whitespace-nowrap py-6 pl-3 pr-10 text-right space-x-4">
                        {!u.isImmutable && (
                          <>
                            <button onClick={() => openModal(u)} className="p-2 rounded-xl text-gray-300 hover:text-brand-indigo hover:bg-brand-indigo/5 transition-all">
                              <Pencil className="h-4 w-4"/>
                            </button>
                            <button onClick={() => handleDelete(u.id)} disabled={u.id === user?.id} className="p-2 rounded-xl text-gray-300 hover:text-brand-red hover:bg-brand-red/5 transition-all disabled:opacity-0 disabled:pointer-events-none">
                              <Trash2 className="h-4 w-4"/>
                            </button>
                          </>
                        )}
                        {u.isImmutable && (
                          <span className="text-[9px] font-black uppercase text-gray-300 tracking-widest mr-2">SYS ADMIN</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="relative z-50">
          <div className="fixed inset-0 bg-brand-slate/40 backdrop-blur-sm transition-opacity"></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-[3rem] bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-brand-cream-dark">
                
                <div className="bg-brand-cream px-8 py-6 border-b border-brand-cream-dark flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-brand-slate uppercase tracking-tight">
                      {editingUser ? 'Atualizar Identidade' : 'Registrar Novo SysAdmin'}
                    </h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Configuração de Credenciais de Rede</p>
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
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nome Completo do Utilizador *</label>
                      <input type="text" required value={name} onChange={e=>setName(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all placeholder:text-gray-300" placeholder="Ex: Ana Silva" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Email Institucional (ID) *</label>
                      <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all placeholder:text-gray-300" placeholder="ana.silva@empresa.com" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Senha de Acesso Terminal {editingUser && <span className="text-gray-300 font-bold lowercase tracking-normal opacity-70">(Vazio para manter)</span>}</label>
                      <input type="password" required={!editingUser} value={password} onChange={e=>setPassword(e.target.value)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all placeholder:text-gray-300" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">Nível de Privilégio *</label>
                      <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="block w-full rounded-2xl border-brand-cream-dark bg-brand-cream px-5 py-4 text-sm font-bold text-brand-slate focus:ring-2 focus:ring-brand-indigo/20 focus:bg-white outline-none transition-all">
                        <option value="funcionario">Operator (Access Limited)</option>
                        <option value="gestor">IT Manager (Projects Control)</option>
                        <option value="admin">Root Admin (Total Control)</option>
                      </select>
                    </div>

                    <div className="mt-12 flex flex-col sm:flex-row-reverse gap-4 pt-10 border-t border-brand-cream-dark">
                      <button type="submit" disabled={isSubmitting} className="flex flex-1 items-center justify-center rounded-2xl bg-brand-indigo px-8 py-5 text-sm font-black text-white shadow-xl shadow-brand-indigo/25 hover:bg-brand-blue transition-all active:scale-95">
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'CONFIRMAR IDENTIDADE'}
                      </button>
                      <button type="button" onClick={() => setIsModalOpen(false)} className="flex flex-1 items-center justify-center rounded-2xl bg-brand-cream-dark px-8 py-5 text-sm font-black text-gray-500 hover:bg-gray-100 transition-all">
                        CANCELAR
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
