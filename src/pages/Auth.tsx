import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { getData, saveData } from '../lib/storage';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [isSignUp, setIsSignUp] = useState(location.pathname === '/register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsSignUp(location.pathname === '/register');
    setError('');
  }, [location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const users = getData('USERS') || [];

    if (isSignUp) {
        if (users.find((u: any) => u.email === email)) {
            setError('Email já cadastrado.');
            setIsLoading(false);
            return;
        }

        const newUser = {
            id: Math.random().toString(36).substring(2, 9),
            name,
            email,
            password,
            role: 'funcionario',
            createdAt: new Date().toISOString()
        };

        saveData('USERS', [...users, newUser]);
        localStorage.setItem('auth', newUser.id);
    } else {
        const user = users.find((u: any) => u.email === email);
        if (!user) {
            setError('Credenciais inválidas.');
            setIsLoading(false);
            return;
        }
        
        // In a real app we'd hash the password
        if (user.password !== password && user.role !== 'admin') { 
             // Allow admin to login without pwd check as per previous mock (or enforce it if they set it)
            if(user.password && user.password !== password) {
                setError('Credenciais inválidas.');
                setIsLoading(false);
                return;
            } else if (!user.password && password) {
               // they are admin and hasn't set pwd yet, let them through
            }
        }

        localStorage.setItem('auth', user.id);
    }

    await refreshUser(); // Force refresh context
    navigate('/dashboard');
    setIsLoading(false);
  };

  const toggleMode = () => {
    setError('');
    const newPath = isSignUp ? '/login' : '/register';
    navigate(newPath, { replace: true });
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream-dark p-4 md:p-8 font-sans">
      <div className={`relative overflow-hidden w-full max-w-[768px] min-h-[550px] md:min-h-[480px] bg-brand-cream rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40`}>
        
        {/* Sign Up Form */}
        <div className={`h-full w-full md:w-1/2 absolute top-0 left-0 transition-all duration-[600ms] ease-in-out ${
          isSignUp 
            ? 'translate-x-0 md:translate-x-full opacity-100 z-50' 
            : '-translate-x-full md:translate-x-0 opacity-0 z-10 pointer-events-none'
        }`}>
          <form className="bg-brand-cream flex flex-col items-center justify-center p-8 md:p-12 h-full text-center" onSubmit={handleSubmit}>
            <h1 className="font-serif font-black text-3xl mb-4 text-brand-red">Nova Conta</h1>
            <div className="h-1.5 w-12 bg-brand-red mb-6 rounded-full"></div>
            
            <div className="space-y-3 w-full">
              <input type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} className="bg-white border-brand-red/10 border px-5 py-4 w-full rounded-2xl outline-none focus:ring-2 focus:ring-brand-red/20 text-sm font-medium transition-all shadow-sm" />
              <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white border-brand-red/10 border px-5 py-4 w-full rounded-2xl outline-none focus:ring-2 focus:ring-brand-red/20 text-sm font-medium transition-all shadow-sm" />
              <div className="relative w-full">
                <input type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white border-brand-red/10 border px-5 py-4 w-full rounded-2xl outline-none focus:ring-2 focus:ring-brand-red/20 text-sm font-medium transition-all shadow-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-red">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-brand-red text-xs mt-4 font-black uppercase tracking-widest">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="mt-8 w-full md:w-auto rounded-2xl bg-brand-red text-brand-cream py-5 px-14 font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-brand-red/30 active:scale-95 hover:bg-brand-red-dark flex items-center justify-center">
              {isLoading ? <Loader2 className="animate-spin mr-3"/> : 'CADASTRAR'}
            </button>

            <button type="button" onClick={toggleMode} className="mt-6 md:hidden text-[10px] font-black text-brand-red uppercase tracking-widest">
              Já tem conta? Entrar
            </button>
          </form>
        </div>

        {/* Sign In Form */}
        <div className={`h-full w-full md:w-1/2 absolute top-0 left-0 transition-all duration-[600ms] ease-in-out ${
          isSignUp 
            ? 'translate-x-[100%] md:translate-x-full opacity-0 pointer-events-none' 
            : 'translate-x-0 md:left-0 opacity-100 z-20 pointer-events-auto'
        }`}>
          <form className="bg-brand-cream flex flex-col items-center justify-center p-8 md:p-12 h-full text-center" onSubmit={handleSubmit}>
            <h1 className="font-serif font-black text-3xl mb-4 text-brand-red">Acesso Restrito</h1>
            <div className="h-1.5 w-12 bg-brand-red mb-6 rounded-full"></div>
            <span className="text-[10px] text-gray-400 mb-6 tracking-[0.2em] font-black uppercase">Entre com as suas credenciais</span>
            
            <div className="space-y-3 w-full">
              <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="bg-white border-brand-red/10 border px-5 py-4 w-full rounded-2xl outline-none focus:ring-2 focus:ring-brand-red/20 text-sm font-medium transition-all shadow-sm" />
              <div className="relative w-full">
                <input type={showPassword ? "text" : "password"} placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required className="bg-white border-brand-red/10 border px-5 py-4 w-full rounded-2xl outline-none focus:ring-2 focus:ring-brand-red/20 text-sm font-medium transition-all shadow-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-red">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <a href="#" className="text-[10px] text-gray-400 font-black uppercase mt-6 mb-4 hover:text-brand-red transition-colors tracking-widest" onClick={e => e.preventDefault()}>Esqueceu a senha?</a>
            
            {error && <p className="text-brand-red text-xs mb-6 font-black uppercase tracking-widest">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full md:w-auto rounded-2xl bg-brand-red text-brand-cream py-5 px-14 font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-brand-red/30 active:scale-95 hover:bg-brand-red-dark flex items-center justify-center">
              {isLoading ? <Loader2 className="animate-spin mr-3"/> : 'ENTRAR'}
            </button>

            <button type="button" onClick={toggleMode} className="mt-8 md:hidden text-[10px] font-black text-brand-red uppercase tracking-widest">
              Criar conta agora
            </button>
          </form>
        </div>

        {/* Overlay Container - Desktop Only */}
        <div className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-[600ms] ease-in-out z-[100] shadow-2xl ${isSignUp ? '-translate-x-full rounded-r-[150px] rounded-l-none' : 'rounded-l-[150px] rounded-r-none'}`}>
          <div className={`bg-brand-red text-brand-cream relative -left-full h-full w-[200%] transition-transform duration-[600ms] ease-in-out ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`}>
            
            <div className={`absolute top-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center transition-transform duration-[600ms] ease-in-out ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}`}>
              <h1 className="font-serif font-black text-3xl mb-4">Bem-vindo!</h1>
              <p className="text-[14px] font-[400] tracking-wide leading-relaxed mb-10 opacity-80">
                Acesse sua conta para gerenciar seus projetos e relatórios financeiros de forma centralizada.
              </p>
              <button type="button" onClick={toggleMode} className="rounded-xl border-2 border-brand-cream-dark/30 bg-transparent text-brand-cream text-xs font-black py-4 px-12 uppercase tracking-widest transition-all hover:bg-brand-cream hover:text-brand-red cursor-pointer">
                ENTRAR AGORA
              </button>
            </div>

            <div className={`absolute top-0 right-0 flex flex-col items-center justify-center w-1/2 h-full px-12 text-center transition-transform duration-[600ms] ease-in-out ${isSignUp ? 'translate-x-[20%]' : 'translate-x-0'}`}>
              <h1 className="font-serif font-black text-3xl mb-4">Primeiro Acesso?</h1>
              <p className="text-[14px] font-[400] tracking-wide leading-relaxed mb-10 opacity-80">
                Cadastre sua empresa no Efata System e comece a controlar seus orçamentos estrategicamente.
              </p>
              <button type="button" onClick={toggleMode} className="rounded-xl border-2 border-brand-cream-dark/30 bg-transparent text-brand-cream text-xs font-black py-4 px-12 uppercase tracking-widest transition-all hover:bg-brand-cream hover:text-brand-red cursor-pointer">
                CADASTRAR-SE
              </button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
