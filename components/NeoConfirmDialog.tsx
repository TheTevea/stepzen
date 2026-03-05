'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface NeoConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

const variantStyles = {
  danger: { btn: 'bg-red-500', icon: 'text-red-500' },
  warning: { btn: 'bg-amber-500', icon: 'text-amber-500' },
  info: { btn: 'bg-primary', icon: 'text-primary' },
};

export const NeoConfirmDialog: React.FC<NeoConfirmDialogProps> = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  icon,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  const style = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full animate-in fade-in zoom-in-95 duration-150">
        <h3 className="font-display font-bold text-lg mb-2 flex items-center gap-2">
          {icon || <AlertTriangle size={20} className={style.icon} />}
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-5">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2.5 ${style.btn} text-white border-2 border-black rounded-lg font-bold text-sm shadow-neo-sm hover:-translate-y-0.5 hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 bg-white border-2 border-black rounded-lg font-bold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
