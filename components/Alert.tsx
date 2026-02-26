'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useAlert } from '@/context/AlertContext';

const config = {
  success: {
    icon: CheckCircle,
    bg: 'bg-secondary',
    text: 'text-white',
  },
  error: {
    icon: AlertTriangle,
    bg: 'bg-accent',
    text: 'text-white',
  },
  info: {
    icon: Info,
    bg: 'bg-primary',
    text: 'text-white',
  },
};

export const Alert: React.FC = () => {
  const { alert, hideAlert } = useAlert();

  if (!alert) return null;

  const { icon: Icon, bg, text } = config[alert.type];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md px-4">
      <div
        className={`
          ${bg} ${text} border-2 border-black rounded-xl shadow-neo-sm 
          px-5 py-3.5 flex items-center gap-3 font-bold text-sm
          transition-all duration-300 ease-out
          ${alert.visible 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 -translate-y-4'}
        `}
      >
        <Icon size={20} className="shrink-0" />
        <span className="flex-1">{alert.message}</span>
        <button 
          onClick={hideAlert} 
          className="shrink-0 p-1 rounded-full hover:bg-black/20 transition-colors"
          aria-label="Close alert"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
