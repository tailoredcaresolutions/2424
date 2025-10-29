import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Badge({ children, variant = 'default', size = 'md', className = '' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-[#E6F4EA] text-[#1C5C2A] border-[#CDE8D6]',
    warning: 'bg-[#FFF4C7] text-[#7A4B00] border-[#F6D98B]',
    danger: 'bg-[#FDE7E9] text-[#8C1D1D] border-[#F5B5BB]',
    info: 'bg-[#E3ECFF] text-[#1E2F66] border-[#C4D5FF]',
    default: 'bg-white/80 text-[#2C1301] border-[#F1E0CC]'
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClasses[variant]} ${sizeClasses[size]} backdrop-blur-glass ${className}`}
    >
      {children}
    </span>
  );
}
