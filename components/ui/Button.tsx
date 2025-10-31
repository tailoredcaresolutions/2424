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
  const baseClasses = 'touch-target inline-flex items-center justify-center font-semibold rounded-glass transition-all button-press focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--tcs-gold)] focus-visible:ring-offset-[#080d1e]';

  const variantClasses = {
    primary:
      'liquid-glass-gold text-[#2C1301] shadow-[0_18px_35px_rgba(201,160,99,0.4)] hover:-translate-y-0.5 hover:shadow-[0_22px_40px_rgba(201,160,99,0.5)]',
    secondary:
      'liquid-glass-light text-tcs-blue-dark border border-tcs-blue-light/30 shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-white/20',
    success:
      'liquid-glass-light text-[#1C5C2A] border border-[#CDE8D6]/30 shadow-[0_12px_24px_rgba(28,92,42,0.2)] bg-[rgba(230,244,234,0.2)]',
    danger:
      'bg-[rgba(59,15,15,0.8)] text-[#FDE3D8] hover:bg-[rgba(75,18,18,0.9)] shadow-[0_12px_28px_rgba(59,15,15,0.5)] backdrop-blur-glass',
    warning:
      'liquid-glass-light text-[#7A4B00] border border-[#F6D98B]/40 shadow-[0_12px_28px_rgba(244,196,86,0.3)] bg-[rgba(255,244,199,0.2)]',
    ghost:
      'bg-transparent text-[var(--tcs-light-gold)] border border-[rgba(252,227,186,0.4)] hover:liquid-glass-vibrant hover:bg-[rgba(252,227,186,0.1)]'
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
