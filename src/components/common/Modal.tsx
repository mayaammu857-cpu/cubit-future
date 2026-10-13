import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { AppWatermark } from './AppWatermark';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth,
  size,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-brand-dark/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white text-slate-900 text-left shadow-2xl transition-all sm:my-8 w-full ${maxWidthClasses[size || maxWidth || 'lg']} border border-slate-200 animate-fade-in`}
        >
          {/* Modal Header */}
          <div className="relative z-10 bg-brand-navy px-6 py-5 flex items-center justify-between border-b border-brand-navy-light text-white">
            <div>
              <h3 className="text-lg font-bold tracking-tight text-white">{title}</h3>
              {subtitle && <p className="text-xs text-slate-300 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="relative z-10 px-6 py-6 max-h-[calc(85vh-120px)] overflow-y-auto text-slate-900">{children}</div>

          {/* Modal Footer Watermark */}
          <div className="relative z-10 px-6 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Cubit Future Academic Suite</span>
            <AppWatermark variant="inline" />
          </div>
        </div>
      </div>
    </div>
  );
};
