import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 border-2 border-black focus:outline-none focus:ring-4 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary text-white shadow-neo hover:-translate-y-1 hover:shadow-none",
    secondary: "bg-secondary text-white shadow-neo hover:-translate-y-1 hover:shadow-none",
    outline: "bg-white text-black shadow-neo hover:-translate-y-1 hover:shadow-none",
    ghost: "bg-transparent border-transparent shadow-none hover:bg-gray-100 border-0"
  };

  const sizes = {
    sm: "px-4 py-1.5 text-sm",
    md: "px-6 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg"
  };

  // Ghost variant shouldn't have the border-2 and border-black from baseStyles if strictly ghost, 
  // but for this playful theme, outline is better suited for most secondary actions.
  // Overriding base style for ghost specifically if needed, but keeping simple here.

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};