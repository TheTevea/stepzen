'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface NeoSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  label?: string;
}

export const NeoSelect: React.FC<NeoSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  disabled = false,
  label,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-bold uppercase tracking-wide text-gray-600 mb-1.5">
          {label}
        </label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center justify-between gap-2 p-2.5 border-2 border-black rounded-lg font-bold text-sm bg-gray-50 cursor-pointer hover:bg-gray-100 transition-all text-left ${open ? 'shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span className={value ? 'text-black' : 'text-gray-400'}>{selectedLabel}</span>
          <ChevronDown size={14} className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </button>

        {open && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-left transition-colors ${
                  option.value === value
                    ? 'bg-black text-white font-bold'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                {option.label}
                {option.value === value && <Check size={14} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
