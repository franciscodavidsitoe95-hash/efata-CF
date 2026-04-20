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
  tasks?: any[];
  attachments?: any[];
  createdAt: string;
}

export interface Budget {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  createdAt: string;
}
