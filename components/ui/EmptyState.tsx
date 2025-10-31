import React from 'react';
import { FileX, Inbox, Search, FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'file' | 'inbox' | 'search' | 'folder';
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const iconMap = {
  file: FileX,
  inbox: Inbox,
  search: Search,
  folder: FolderOpen,
};

export default function EmptyState({
  icon = 'inbox',
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  const IconComponent = iconMap[icon];

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="mb-4 p-6 rounded-full liquid-glass-light border border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
        <IconComponent className="w-12 h-12 text-tcs-blue-light/60" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
        {title}
      </h3>
      {description && (
        <p className="text-white/70 text-base max-w-md mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}





