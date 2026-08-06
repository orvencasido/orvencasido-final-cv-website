import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
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

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-matcha-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full ${maxWidthClass} bg-beige-50 border border-beige-300 rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-beige-200">
          <h3 className="text-lg font-extrabold text-matcha-950">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-matcha-700 hover:text-matcha-950 rounded-xl hover:bg-beige-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 sm:p-8 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  isDestructive = true,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <p className="text-sm text-matcha-800 mb-6 font-medium leading-relaxed">{message}</p>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 text-xs font-bold text-matcha-800 hover:bg-beige-200 rounded-full transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`px-6 py-2.5 text-xs font-extrabold text-beige-50 rounded-full transition shadow-xs cursor-pointer ${
            isDestructive
              ? 'bg-red-700 hover:bg-red-800'
              : 'bg-matcha-900 hover:bg-matcha-800'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};
