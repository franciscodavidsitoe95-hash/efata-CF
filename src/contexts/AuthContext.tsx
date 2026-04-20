import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Role = 'admin' | 'gestor' | 'funcionario';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    setLoading(true);
    const authId = localStorage.getItem('auth');
    if (authId) {
        const users = JSON.parse(localStorage.getItem('efata_users') || '[]');
        const foundUser = users.find((u: any) => u.id === authId);
        if (foundUser) {
            setUser(foundUser);
        } else if (authId === 'true') {
             // Fallback for old mock auth
             setUser({ id: '1', name: 'User', email: 'user@efata.it', role: 'admin', createdAt: '2026-01-01' });
        } else {
             setUser(null);
        }
    } else {
        setUser(null);
    }
    setLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem('auth');
    setUser(null);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
