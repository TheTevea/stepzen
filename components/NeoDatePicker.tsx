'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface NeoDatePickerProps {
  label?: string;
  labelHint?: string;
  value: string;          // ISO date string yyyy-mm-dd
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
  name?: string;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export const NeoDatePicker: React.FC<NeoDatePickerProps> = ({
  label,
  labelHint,
  value,
  onChange,
  required = false,
  placeholder = 'Select a date',
  className = '',
  name,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Parse selected date
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  // Calendar view state
  const [viewYear, setViewYear] = useState(selectedDate?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate?.getMonth() ?? new Date().getMonth());

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Navigate months
  const prevMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 0) {
        setViewYear(y => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth(m => {
      if (m === 11) {
        setViewYear(y => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const selectDay = (day: number) => {
    const mm = String(viewMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mm}-${dd}`);
    setOpen(false);
  };

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfWeek(viewYear, viewMonth);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Format display value
  const displayValue = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '';

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  const isToday = (day: number) => {
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const isPast = (day: number) => {
    const cellDate = new Date(viewYear, viewMonth, day);
    cellDate.setHours(0, 0, 0, 0);
    return cellDate < today;
  };

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Hidden native input for form submission */}
      <input type="hidden" name={name} value={value} required={required} />

      {/* Label */}
      {label && (
        <label className="block text-sm font-bold uppercase tracking-wide text-gray-600 mb-1.5">
          {label}
          {labelHint && (
            <span className="text-gray-400 normal-case font-normal"> {labelHint}</span>
          )}
        </label>
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`
          w-full p-2.5 border-2 border-black rounded-lg bg-gray-50
          font-bold text-sm text-left flex items-center justify-between gap-2
          transition-all cursor-pointer
          focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
          hover:bg-gray-100
          ${!displayValue ? 'text-gray-400 font-medium' : 'text-black'}
        `}
      >
        <span>{displayValue || placeholder}</span>
        <Calendar size={16} className="text-gray-500 flex-shrink-0" />
      </button>

      {/* Calendar Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-[320px] bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Month / Year nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-primary/5 rounded-t-xl">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-black bg-white hover:bg-gray-100 transition-colors active:shadow-none active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="font-display font-bold text-sm tracking-wide uppercase">
              {MONTHS[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg border-2 border-black bg-white hover:bg-gray-100 transition-colors active:shadow-none active:translate-x-[1px] active:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1 px-3 pb-3">
            {cells.map((day, i) =>
              day === null ? (
                <div key={`empty-${i}`} />
              ) : (
                <button
                  key={day}
                  type="button"
                  disabled={isPast(day)}
                  onClick={() => selectDay(day)}
                  className={`
                    w-9 h-9 mx-auto flex items-center justify-center rounded-lg text-sm font-bold
                    transition-all duration-150 cursor-pointer
                    ${isSelected(day)
                      ? 'bg-primary text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105'
                      : isToday(day)
                        ? 'bg-secondary/15 text-secondary border-2 border-secondary/50 font-extrabold'
                        : isPast(day)
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-700 hover:bg-primary/10 hover:text-primary border-2 border-transparent hover:border-primary/30'
                    }
                  `}
                >
                  {day}
                </button>
              )
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-2 border-t-2 border-gray-100">
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                setViewYear(now.getFullYear());
                setViewMonth(now.getMonth());
                selectDay(now.getDate());
              }}
              className="text-xs font-bold text-primary hover:underline cursor-pointer"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setOpen(false);
                }}
                className="text-xs font-bold text-accent hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
