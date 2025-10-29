import React from 'react';
import Card from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'gold' | 'aqua' | 'rose' | 'emerald' | 'violet';
  loading?: boolean;
  onClick?: () => void;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'gold',
  loading = false,
  onClick
}: StatCardProps) {
  const colorClasses = {
    gold: {
      accent: 'from-[var(--tcs-light-gold)] to-[var(--tcs-gold)]',
      text: 'text-[#2C1301]'
    },
    aqua: {
      accent: 'from-[#5EF0FF] to-[#7C8BFF]',
      text: 'text-[#082e3f]'
    },
    rose: {
      accent: 'from-[#FF9A9E] to-[#F6416C]',
      text: 'text-[#4b0c19]'
    },
    emerald: {
      accent: 'from-[#D4FC79] to-[#96E6A1]',
      text: 'text-[#0f301b]'
    },
    violet: {
      accent: 'from-[#c084fc] to-[#7c3aed]',
      text: 'text-[#1e0a33]'
    }
  } as const;

  const colors = colorClasses[color];

  if (loading) {
    return (
      <Card hover={!!onClick} onClick={onClick}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={`relative overflow-hidden border border-white/20 bg-gradient-to-br from-white/90 to-white/70`}>
      <div
        className={`absolute inset-0 opacity-50 blur-2xl bg-gradient-to-br ${colors.accent}`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#5C4C3C] mb-1">{title}</p>
          <div className="flex items-baseline space-x-2">
            <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
            {trend && (
              <span
                className={`text-sm font-semibold ${
                  trend.isPositive ? 'text-emerald-600' : 'text-rose-500'
                }`}
              >
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-[#7A6A58] mt-1">{subtitle}</p>}
        </div>

        {icon && (
          <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-[0_12px_20px_rgba(12,8,4,0.1)] flex items-center justify-center text-2xl">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
