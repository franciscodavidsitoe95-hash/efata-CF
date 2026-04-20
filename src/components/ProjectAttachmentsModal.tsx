import React, { useState, useRef } from 'react';
import { X, Paperclip, Trash2, FileText, Loader2, UploadCloud } from 'lucide-react';
import type { Project } from '../pages/Projects';
import { useToast } from '../contexts/ToastContext';
import { getData, saveData } from '../lib/storage';

interface Attachment {
  id: string;
  originalName: string;
  url: string;
  createdAt: string;
}

interface ProjectAttachmentsModalProps {
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
}

export function ProjectAttachmentsModal({ project, onClose, onUpdate }: ProjectAttachmentsModalProps) {
  const [attachments, setAttachments] = useState<Attachment[]>(project.attachments || []);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      addToast('O arquivo deve ter no máximo 10MB', 'error');
      return;
    }

    setIsUploading(true);
    try {
      // Simulate reading a file and saving its info to localStorage
      // In a real SPA, we'd use FileReader to get a base64 string, but that might be
      // too heavy for localStorage. For this demo, we'll store a fake URL.
      
      const newAttachment: Attachment = {
          id: Math.random().toString(36).substr(2, 9),
          originalName: file.name,
          url: URL.createObjectURL(file), // Note: This URL will only work in the current session
          createdAt: new Date().toISOString()
      };

      const allProjects: Project[] = getData('PROJECTS') || [];
      const updatedProjects = allProjects.map(p => {
          if (p.id === project.id) {
              const projAttachments = p.attachments || [];
              return { ...p, attachments: [...projAttachments, newAttachment] };
          }
          return p;
      });

      saveData('PROJECTS', updatedProjects);
      
      const { useAuth } = await import('../contexts/AuthContext');
      const { logAction } = await import('../lib/storage');
      const currentUserStr = localStorage.getItem('auth');
      logAction(
        currentUserStr || 'sys', 
        'System', 
        'UPLOAD', 
        'ATTACHMENT', 
        newAttachment.id, 
        `Ficheiro "${newAttachment.originalName}" anexado ao Ativo: ${project.name}`
      );
      
      setAttachments(prev => [...prev, newAttachment]);
      addToast('Arquivo anexado com sucesso', 'success');
      onUpdate();
    } catch (err) {
      addToast('Erro ao gravar arquivo', 'error');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este arquivo?')) return;
    try {
      const allProjects: Project[] = getData('PROJECTS') || [];
      const updatedProjects = allProjects.map(p => {
          if (p.id === project.id) {
              const projAttachments = p.attachments || [];
              return { ...p, attachments: projAttachments.filter(a => a.id !== attachmentId) };
          }
          return p;
      });

      saveData('PROJECTS', updatedProjects);

      const attachmentToDelete = attachments.find(a => a.id === attachmentId);
      if (attachmentToDelete) {
        const { logAction } = await import('../lib/storage');
        const currentUserStr = localStorage.getItem('auth');
        logAction(
          currentUserStr || 'sys', 
          'System', 
          'DELETE', 
          'ATTACHMENT', 
          attachmentId, 
          `Ficheiro "${attachmentToDelete.originalName}" removido do Ativo: ${project.name}`
        );
      }

      setAttachments(prev => prev.filter(a => a.id !== attachmentId));
      addToast('Arquivo apagado', 'success');
      onUpdate();
    } catch (err) {
      addToast('Erro ao apagar arquivo', 'error');
    }
  };


  return (
    <div className="relative z-20" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
      <div className="fixed inset-0 z-20 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold leading-6 text-gray-900 flex items-center">
                <Paperclip className="h-5 w-5 mr-2 text-indigo-600" /> Anexos: {project.name}
              </h3>
              <button type="button" onClick={onClose} className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,image/*,.doc,.docx"
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-2" />
                    <span className="text-sm text-gray-600 font-medium">Fazendo upload...</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm font-medium text-gray-900">Clique para anexar um documento ou imagem</p>
                    <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG até 10MB</p>
                  </>
                )}
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-semibold tracking-tight text-gray-900 uppercase">Arquivos Recentes</h4>
                <div className="mt-3 space-y-3">
                  {attachments.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">Nenhum arquivo anexado.</p>
                  ) : (
                    attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:border-indigo-200">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <div className="h-10 w-10 bg-indigo-50 rounded text-indigo-600 flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="truncate">
                            <a href={att.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-indigo-600 hover:underline truncate">
                              {att.originalName}
                            </a>
                            <p className="text-xs text-gray-500">{new Date(att.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <button onClick={() => handleDelete(att.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2 shrink-0">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
