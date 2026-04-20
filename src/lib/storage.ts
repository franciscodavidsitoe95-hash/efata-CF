import { Project, Budget, BudgetItem } from '../types';
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
    name: 'Infra Cloud AWS',
    description: 'Migração completa de servidores on-premise para ambiente VPC na AWS com escalabilidade automática.',
    client: 'Banco Central',
    startDate: '2026-03-01',
    endDate: '2026-08-30',
    budget: 50000,
    priority: 'critica',
    category: 'CLOUD',
    status: 'em_progresso',
    isDelivered: false,
    tasks: [
      { id: 't1', name: 'Arquitetura de Rede', status: 'concluida', weight: 20, createdAt: new Date().toISOString() },
      { id: 't2', name: 'Provisionamento Terraform', status: 'em_andamento', weight: 40, createdAt: new Date().toISOString() },
      { id: 't3', name: 'Migração de Dados', status: 'pendente', weight: 40, createdAt: new Date().toISOString() }
    ],
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Security Shield',
    description: 'Implementação de novo firewall e sistema de monitorização de intrusão em tempo real.',
    client: 'Efata Interno',
    startDate: '2026-04-10',
    endDate: '2026-06-15',
    budget: 15000,
    priority: 'alta',
    category: 'SECURITY',
    status: 'em_progresso',
    isDelivered: false,
    tasks: [
      { id: 't4', name: 'Auditoria Inicial', status: 'concluida', weight: 30, createdAt: new Date().toISOString() },
      { id: 't5', name: 'Configuração IDS/IPS', status: 'concluida', weight: 50, createdAt: new Date().toISOString() },
      { id: 't6', name: 'Testes de Penetração', status: 'em_andamento', weight: 20, createdAt: new Date().toISOString() }
    ],
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Portal Gov Web',
    description: 'Desenvolvimento do portal interativo para a Vila Olímpica, com reservas online.',
    client: 'Governo do Estado',
    startDate: '2025-01-10',
    endDate: '2025-11-20',
    budget: 85000,
    priority: 'alta',
    category: 'SOFTWARE',
    status: 'concluido',
    isDelivered: true,
    deliveryDate: '2025-11-15',
    tasks: [
      { id: 't7', name: 'Design UI/UX', status: 'concluida', weight: 25, createdAt: new Date().toISOString() },
      { id: 't8', name: 'Desenvolvimento Frontend', status: 'concluida', weight: 45, createdAt: new Date().toISOString() },
      { id: 't9', name: 'Backend & Integrações', status: 'concluida', weight: 30, createdAt: new Date().toISOString() },
    ],
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Fintech Core API',
    description: 'Sistema mobile para transações bancárias e levantamentos virtuais inovadores.',
    client: 'Fintech Efata',
    startDate: '2026-02-01',
    endDate: '2026-10-30',
    budget: 120000,
    priority: 'critica',
    category: 'SOFTWARE',
    status: 'em_progresso',
    isDelivered: false,
    tasks: [
      { id: 't10', name: 'Prototipagem Mobile', status: 'concluida', weight: 15, createdAt: new Date().toISOString() },
      { id: 't11', name: 'Autenticação Segura', status: 'concluida', weight: 35, createdAt: new Date().toISOString() },
      { id: 't12', name: 'Integração ISO 8583', status: 'em_andamento', weight: 50, createdAt: new Date().toISOString() },
    ],
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Data Warehouse',
    description: 'Implementação de Data Lake para processamento analítico massivo.',
    client: 'Grupo Logístico',
    startDate: '2026-01-15',
    endDate: '2026-03-30',
    budget: 75000,
    priority: 'media',
    category: 'DATA',
    status: 'em_progresso',
    isDelivered: false,
    tasks: [
      { id: 't13', name: 'Modelagem de Dados', status: 'concluida', weight: 40, createdAt: new Date().toISOString() },
      { id: 't14', name: 'Pipelines ETL', status: 'em_andamento', weight: 40, createdAt: new Date().toISOString() },
      { id: 't15', name: 'Dashboards BI', status: 'pendente', weight: 20, createdAt: new Date().toISOString() },
    ],
    attachments: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'ERP Upgrade',
    description: 'Atualização do sistema de gestão integrada para a versão cloud native.',
    client: 'Indústria Met.',
    startDate: '2025-06-01',
    endDate: '2025-12-01',
    budget: 45000,
    priority: 'alta',
    category: 'SOFTWARE',
    status: 'concluido',
    isDelivered: true,
    tasks: [
      { id: 't16', name: 'Assessment', status: 'concluida', weight: 20, createdAt: new Date().toISOString() },
      { id: 't17', name: 'Migração Core', status: 'concluida', weight: 60, createdAt: new Date().toISOString() },
      { id: 't18', name: 'Treinamento', status: 'concluida', weight: 20, createdAt: new Date().toISOString() },
    ],
    attachments: [],
    createdAt: new Date().toISOString(),
  }
];

const initialUsers: User[] = [
  {
    id: 'admin1',
    name: 'Francisco Sitoe',
    email: 'franciscodavidsitoe95@gmail.com',
    password: 'admin321',
    role: 'admin',
    isImmutable: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'admin2',
    name: 'Celso Sebastião',
    email: 'celsosebastiao@gmail.com',
    password: 'admin321',
    role: 'admin',
    isImmutable: true,
    createdAt: new Date().toISOString(),
  },
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

const initialBudgets: Budget[] = [
  {
    id: 'b1',
    projectId: '1',
    name: 'Orçamento Infra Cloud - Q2',
    createdAt: new Date().toISOString()
  },
  {
    id: 'b2',
    projectId: '4',
    name: 'Desenvolvimento Core Banking',
    createdAt: new Date().toISOString()
  }
];

const initialBudgetItems: BudgetItem[] = [
  { id: 'bi1', budgetId: 'b1', description: 'Instâncias EC2 (M5.large)', amount: 1200, type: 'despesa', createdAt: new Date().toISOString() },
  { id: 'bi2', budgetId: 'b1', description: 'Storage S3 (5TB)', amount: 450, type: 'despesa', createdAt: new Date().toISOString() },
  { id: 'bi3', budgetId: 'b1', description: 'Consultoria Cloud - Setup', amount: 5000, type: 'receita', createdAt: new Date().toISOString() },
  { id: 'bi4', budgetId: 'b2', description: 'Licença iOS Developer', amount: 99, type: 'despesa', createdAt: new Date().toISOString() },
  { id: 'bi5', budgetId: 'b2', description: 'Fase 1: Prototipagem', amount: 15000, type: 'receita', createdAt: new Date().toISOString() },
];

export const seedStorage = () => {
  // Always inject the beautiful mock projects to look awesome in the presentation/demo
  // We will force overwrite `efata_projects` if it does not contain the newest mock data
  const currentProjects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  
  if (currentProjects.length < 5 || !currentProjects[0].tasks?.length || currentProjects[0].tasks[0].title) {
     localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
  } else {
    let updated = false;
    const project5 = initialProjects.find(p => p.id === '5');
    
    if (project5 && !currentProjects.find((p: any) => p.name === project5.name)) {
       // Just overwrite the whole thing if it's not the new format to fix tasks weights and graphs
       localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
    }
  }

  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  } else {
    // Inject immutable admins if missing
    const currentUsers = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    let updatedUsers = false;
    
    // Core admins to add or update
    const coreAdmins = initialUsers.filter(u => u.isImmutable);
    
    coreAdmins.forEach(admin => {
        const existingIndex = currentUsers.findIndex((u: any) => u.email === admin.email);
        if (existingIndex === -1) {
            currentUsers.push(admin);
            updatedUsers = true;
        } else if (!currentUsers[existingIndex].isImmutable) {
            // Update to be immutable and strict if the email was claimed without immutability
            currentUsers[existingIndex] = { ...currentUsers[existingIndex], ...admin };
            updatedUsers = true;
        }
    });
    
    if (updatedUsers) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(currentUsers));
    }
  }
  if (!localStorage.getItem(STORAGE_KEYS.PREFERENCES)) {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify({ theme: 'light', notifications: true }));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGETS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGETS) || '[]').length === 0) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(initialBudgets));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS) || JSON.parse(localStorage.getItem(STORAGE_KEYS.BUDGET_ITEMS) || '[]').length === 0) {
    localStorage.setItem(STORAGE_KEYS.BUDGET_ITEMS, JSON.stringify(initialBudgetItems));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    const mockLogs = [
      {
         id: 'L01', userId: 'admin1', userName: 'Francisco Sita', action: 'CREATE', entity: 'PROJECT', entityId: 'p1', details: 'Core system boot. Projetos de migração instanciados na cloud.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
         id: 'L02', userId: 'admin2', userName: 'Celso Sebastião', action: 'UPDATE', entity: 'TASK', entityId: 't1', details: 'Sincronização forçada do pacote ISO 8583. Estado atualizado com sucesso.', createdAt: new Date(Date.now() - 40000000).toISOString()
      },
      {
         id: 'L03', userId: 'sys', userName: 'System', action: 'UPLOAD', entity: 'ATTACHMENT', entityId: 'a1', details: 'Backup de rotina guardado em Secure Env.', createdAt: new Date(Date.now() - 10000000).toISOString()
      },
      {
         id: 'L04', userId: 'admin1', userName: 'Francisco Sita', action: 'CREATE', entity: 'USER', entityId: 'u5', details: 'Nova credencial de Gestor IT gerada. (Nível B).', createdAt: new Date(Date.now() - 500000).toISOString()
      },
      {
         id: 'L05', userId: 'sys', userName: 'Security Daemon', action: 'DELETE', entity: 'BUDGET', entityId: 'b9', details: 'Alocação órfã neutralizada via script de integridade de dados.', createdAt: new Date(Date.now() - 150000).toISOString()
      }
    ];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(mockLogs));
  } else {
    // If not enough interesting mock logs exist, refill
    const curLogs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS) || '[]');
    if (curLogs.length === 0) {
      const mockLogs = [
        {
           id: 'L01', userId: 'admin1', userName: 'Francisco Sita', action: 'CREATE', entity: 'PROJECT', entityId: 'p1', details: 'Boot do sistema central. Projetos vitais alinhados.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        },
        {
           id: 'L02', userId: 'admin2', userName: 'Celso Sebastião', action: 'UPDATE', entity: 'TASK', entityId: 't1', details: 'Permissões do cluster re-balanceadas.', createdAt: new Date(Date.now() - 40000000).toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(mockLogs));
    }
  }
};

export const getData = (key: keyof typeof STORAGE_KEYS) => {
  const data = localStorage.getItem(STORAGE_KEYS[key]);
  return data ? JSON.parse(data) : [];
};

export const saveData = (key: keyof typeof STORAGE_KEYS, data: any) => {
  localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
};

export const logAction = (
  userId: string,
  userName: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'UPLOAD',
  entity: 'PROJECT' | 'TASK' | 'USER' | 'BUDGET' | 'ATTACHMENT',
  entityId: string,
  details: string
) => {
  const currentLogs = getData('LOGS');
  const newLog = {
    id: Math.random().toString(36).substr(2, 9),
    userId,
    userName,
    action,
    entity,
    entityId,
    details,
    createdAt: new Date().toISOString()
  };
  saveData('LOGS', [...currentLogs, newLog]);
};

