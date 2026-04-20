import { Project, Budget } from '../types';
import { User } from '../contexts/AuthContext';

const STORAGE_KEYS = {
  PROJECTS: 'efata_projects',
  USERS: 'efata_users',
  BUDGETS: 'efata_budgets',
  BUDGET_ITEMS: 'efata_budget_items',
  PREFERENCES: 'efata_preferences',
  LOGS: 'efata_logs'
};

const initialProjects: Project[] = [
  {
    id: '1',
    name: 'Infraestrutura Cloud AWS',
    description: 'Migração completa de servidores on-premise para ambiente VPC na AWS com escalabilidade automática.',
    client: 'Banco Central',
    startDate: '2026-03-01',
    endDate: '2026-08-30',
    budget: 50000,
    priority: 'critica',
    category: 'CLOUD',
    status: 'em_progresso',
    isDelivered: false,
    tasks: [],
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Sistema de Segurança Interno',
    description: 'Implementação de novo firewall e sistema de monitorização de intrusão em tempo real.',
    client: 'Efata Interno',
    startDate: '2026-04-10',
    endDate: '2026-06-15',
    budget: 15000,
    priority: 'alta',
    category: 'SECURITY',
    status: 'planeado',
    isDelivered: false,
    tasks: [],
    attachments: [],
    createdAt: new Date().toISOString(),
  }
];

const initialUsers: User[] = [
  {
    id: '1',
    name: 'Admin Sistema',
    email: 'admin@sistema.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'João Funcionario',
    email: 'joao@sistema.com',
    role: 'funcionario',
    createdAt: new Date().toISOString(),
  }
];

export const seedStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PREFERENCES)) {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify({ theme: 'light', notifications: true }));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGETS)) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  }
};

export const getData = (key: keyof typeof STORAGE_KEYS) => {
  const data = localStorage.getItem(STORAGE_KEYS[key]);
  return data ? JSON.parse(data) : [];
};

export const saveData = (key: keyof typeof STORAGE_KEYS, data: any) => {
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
};

