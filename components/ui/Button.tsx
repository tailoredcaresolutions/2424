import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  type = 'button',
  icon
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-2xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tcs-gold)] focus-visible:ring-offset-[#080d1e]';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-[var(--tcs-light-gold)] to-[var(--tcs-gold)] text-[#2C1301] shadow-[0_18px_35px_rgba(227,162,72,0.35)] hover:-translate-y-0.5',
    secondary:
      'bg-white/90 text-[#1F1B16] border border-[rgba(3,8,23,0.12)] shadow-[0_8px_24px_rgba(12,8,4,0.08)] hover:bg-white',
    success:
      'bg-[#E6F4EA] text-[#1C5C2A] border border-[#CDE8D6] shadow-[0_12px_24px_rgba(28,92,42,0.12)]',
    danger:
      'bg-[#3B0F0F] text-[#FDE3D8] hover:bg-[#4b1212] shadow-[0_12px_28px_rgba(59,15,15,0.4)]',
    warning:
      'bg-[#FFF4C7] text-[#7A4B00] border border-[#F6D98B] shadow-[0_12px_28px_rgba(244,196,86,0.35)]',
    ghost:
      'bg-transparent text-[var(--tcs-light-gold)] border border-[rgba(252,227,186,0.4)] hover:bg-[rgba(252,227,186,0.1)]'
  };

  const sizeClasses = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5.5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg'
  };

  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  const fullWidthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${fullWidthClass} ${className}`}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading...
        </>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
}
