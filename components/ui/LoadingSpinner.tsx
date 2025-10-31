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
    green: 'border-[#c9a063] border-t-transparent',
    white: 'border-white border-t-transparent'
  };

  const spinner = (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]}`} role="status" aria-label="Loading">
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-glass-heavy liquid-glass-dark">
        <div className="flex flex-col items-center space-y-6 liquid-glass-card rounded-glass-lg p-8 shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-tcs-blue-primary/30 border-t-tcs-blue-primary border-r-tcs-gold/50"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-tcs-gold border-r-tcs-blue-light" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
          </div>
          {text && (
            <p className="text-lg text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              {text}
            </p>
          )}
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
