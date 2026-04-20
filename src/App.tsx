/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Sidebar } from './components/Sidebar';
import { Menu, X } from 'lucide-react';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Projects from './pages/Projects';
import Logs from './pages/Logs';
import Reports from './pages/Reports';
import Budgets from './pages/Budgets';

function MainLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-brand-cream relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-brand-cream border-b border-brand-cream-dark sticky top-0 z-40">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-brand-indigo rounded-lg shadow-sm">
              <Menu className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-black text-brand-slate uppercase tracking-tight">EFATA.IT</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-brand-slate hover:bg-brand-indigo/5 rounded-xl transition-colors"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MainLayout><Dashboard /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/projects" 
              element={
                <ProtectedRoute>
                  <MainLayout><Projects /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/budgets" 
              element={
                <ProtectedRoute>
                  <MainLayout><Budgets /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <MainLayout><Reports /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/users" 
              element={
                <ProtectedRoute>
                  <MainLayout><Users /></MainLayout>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/logs" 
              element={
                <ProtectedRoute>
                  <MainLayout><Logs /></MainLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
