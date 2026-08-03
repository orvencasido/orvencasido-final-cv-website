import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

export const SectionHeader: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      {description && (
        <p className="mt-1.5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const EmptyState: React.FC<{
  title?: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}> = ({
  title = 'No items found',
  description = 'There are no records matching your criteria or search filters.',
  icon: Icon = FolderOpen,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/40">
    <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400 mb-4">
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">{title}</h3>
    <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mb-6">{description}</p>
    {action}
  </div>
);

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-zinc-100 dark:bg-zinc-800/60 rounded-2xl h-28 w-full border border-zinc-200/50 dark:border-zinc-800"
      />
    ))}
  </div>
);

export const StatusBadge: React.FC<{
  status: string;
  type?: 'availability' | 'content' | 'project' | 'message';
}> = ({ status, type = 'content' }) => {
  let color = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
  let label = status;

  if (type === 'availability') {
    if (status === 'available') {
      color = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50';
      label = 'Available for opportunities';
    } else if (status === 'open_to_offers') {
      color = 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50';
      label = 'Open to offers';
    } else {
      color = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
      label = 'Currently unavailable';
    }
  } else if (type === 'content') {
    if (status === 'published') {
      color = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    } else {
      color = 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
    }
  } else if (type === 'project') {
    if (status === 'completed') {
      color = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    } else if (status === 'in_progress') {
      color = 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300';
    } else if (status === 'maintained') {
      color = 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
    } else {
      color = 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
    }
  } else if (type === 'message') {
    if (status === 'unread') {
      color = 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
    } else if (status === 'read') {
      color = 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300';
    } else {
      color = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${color}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {label.replace('_', ' ')}
    </span>
  );
};
