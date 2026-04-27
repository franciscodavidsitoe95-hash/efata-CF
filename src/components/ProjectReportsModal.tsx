import React, { useState } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { motion } from 'motion/react';
import type { Project, ProjectReport } from '../types';
import { getData, saveData } from '../lib/storage';
import { useAuth } from '../contexts/AuthContext';

interface ProjectReportsProps {
  project: Project;
  onClose: () => void;
}

export function ProjectReportsModal({ project, onClose }: ProjectReportsProps) {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [whatDone, setWhatDone] = useState('');
  const [whatNotDone, setWhatNotDone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSaveReport = () => {
    if (!user) return;
    
    const newReport: ProjectReport = {
        id: Math.random().toString(36).substr(2, 9),
        projectId: project.id,
        userId: user.id,
        userName: user.name,
        date: new Date().toISOString(),
        whatDone,
        whatNotDone,
        notes
    };

    const reports = getData('REPORTS') || [];
    saveData('REPORTS', [...reports, newReport]);
    addToast('Relatório diário enviado com sucesso!', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-brand-slate/40 backdrop-blur-sm">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] shadow-2xl p-10 w-full max-w-2xl border border-brand-cream-dark">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-black text-brand-slate uppercase tracking-tight">Relatório Diário: {project.name}</h2>
                <button onClick={onClose} className="p-3 bg-brand-cream rounded-2xl"><X className="h-5 w-5" /></button>
            </div>
            
            <div className="space-y-6">
                <textarea rows={3} placeholder="O que foi feito hoje?" className="w-full p-4 border rounded-xl border-brand-cream-dark" value={whatDone} onChange={e => setWhatDone(e.target.value)}></textarea>
                <textarea rows={3} placeholder="O que não foi feito?" className="w-full p-4 border rounded-xl border-brand-cream-dark" value={whatNotDone} onChange={e => setWhatNotDone(e.target.value)}></textarea>
                <textarea rows={2} placeholder="Notas adicionais" className="w-full p-4 border rounded-xl border-brand-cream-dark" value={notes} onChange={e => setNotes(e.target.value)}></textarea>
            </div>
            
            <button onClick={handleSaveReport} className="mt-8 w-full flex items-center justify-center space-x-2 bg-brand-indigo text-white p-4 rounded-2xl font-black uppercase">
                <Save className="h-4 w-4" /> <span>Enviar Relatório</span>
            </button>
        </motion.div>
    </div>
  );
}
