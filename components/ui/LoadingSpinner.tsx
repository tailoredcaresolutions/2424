import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'white';
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'blue',
  text,
  fullScreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4'
  };

  const colorClasses = {
    blue: 'border-[#1B365D] border-t-transparent',
    green: 'border-[#D4A574] border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  const spinner = (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-glass-heavy liquid-glass-dark">
        <div className="flex flex-col items-center space-y-4 liquid-glass-card rounded-glass-lg p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-tcs-blue-primary border-t-transparent"></div>
          {text && <p className="text-lg text-tcs-blue-dark font-medium">{text}</p>}
        </div>
      </div>
    );
  }

  if (text) {
    return (
      <div className="flex items-center space-x-3">
        {spinner}
        <span className="text-gray-700">{text}</span>
      </div>
    );
  }

  return spinner;
}
