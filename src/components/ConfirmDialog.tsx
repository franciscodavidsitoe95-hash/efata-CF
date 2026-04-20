import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'danger'
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-brand-slate/40 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md bg-white p-10 rounded-[3rem] shadow-2xl border border-brand-cream-dark"
          >
            <div className={`p-4 rounded-3xl w-fit mb-6 ${variant === 'danger' ? 'bg-brand-red/10' : 'bg-brand-orange/10'}`}>
              <AlertTriangle className={`h-8 w-8 ${variant === 'danger' ? 'text-brand-red' : 'text-brand-orange'}`} />
            </div>

            <button
              onClick={onClose}
              className="absolute top-8 right-8 p-2 text-gray-300 hover:text-brand-red transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-2xl font-black text-brand-slate uppercase tracking-tight mb-4">
              {title}
            </h2>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-relaxed mb-10">
              {message}
            </p>

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-brand-cream border border-brand-cream-dark transition-all"
              >
                {cancelLabel}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all active:scale-95 ${
                  variant === 'danger' ? 'bg-brand-red shadow-brand-red/20 hover:bg-brand-red-dark' : 'bg-brand-orange shadow-brand-orange/20 hover:bg-brand-orange-dark'
                }`}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
