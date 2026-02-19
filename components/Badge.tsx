import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'accent' | 'success' | 'warning';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variants = {
    neutral: "bg-gray-100 text-gray-800 border-gray-900",
    accent: "bg-indigo-100 text-indigo-800 border-indigo-900",
    success: "bg-green-100 text-green-800 border-green-900",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-900",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};