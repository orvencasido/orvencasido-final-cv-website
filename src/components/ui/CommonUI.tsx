import React from 'react';
import { LucideIcon, FolderOpen } from 'lucide-react';

export const SectionHeader: React.FC<{
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-beige-300/80">
    <div className="space-y-2">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-matcha-950">
        {title}
      </h1>
      {description && (
        <p className="text-base sm:text-lg text-matcha-700 max-w-3xl leading-relaxed font-normal">
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
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed border-beige-300 rounded-3xl bg-beige-50">
    <div className="w-14 h-14 rounded-full bg-matcha-100 flex items-center justify-center text-matcha-900 mb-5">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-lg font-extrabold text-matcha-950 mb-2">{title}</h3>
    <p className="text-sm text-matcha-700 max-w-sm mb-8 leading-relaxed">{description}</p>
    {action}
  </div>
);

export const LoadingSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-6">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="animate-pulse bg-beige-200/80 rounded-3xl h-36 w-full border border-beige-300"
      />
    ))}
  </div>
);

export const StatusBadge: React.FC<{
  status: string;
  type?: 'availability' | 'content' | 'project' | 'message';
}> = ({ status, type = 'content' }) => {
  let color = 'bg-matcha-100 text-matcha-900 border border-matcha-200';
  let label = status;

  if (type === 'availability') {
    if (status === 'available') {
      color = 'bg-matcha-900 text-beige-50 font-bold border border-matcha-800 shadow-xs';
      label = 'Available for opportunities';
    } else if (status === 'open_to_offers') {
      color = 'bg-matcha-100 text-matcha-950 font-bold border border-matcha-300';
      label = 'Open to offers';
    } else {
      color = 'bg-beige-200 text-matcha-700 border border-beige-300';
      label = 'Currently unavailable';
    }
  } else if (type === 'content') {
    if (status === 'published') {
      color = 'bg-matcha-100 text-matcha-950 border border-matcha-300 font-semibold';
    } else {
      color = 'bg-beige-200 text-matcha-800 border border-beige-300 font-semibold';
    }
  } else if (type === 'project') {
    if (status === 'completed') {
      color = 'bg-matcha-900 text-beige-50 font-semibold';
    } else if (status === 'in_progress') {
      color = 'bg-matcha-100 text-matcha-950 font-semibold border border-matcha-300';
    } else if (status === 'maintained') {
      color = 'bg-matcha-50 text-matcha-900 font-semibold border border-matcha-200';
    } else {
      color = 'bg-beige-200 text-matcha-700';
    }
  } else if (type === 'message') {
    if (status === 'unread') {
      color = 'bg-matcha-900 text-beige-50 font-bold';
    } else if (status === 'read') {
      color = 'bg-beige-200 text-matcha-700';
    } else {
      color = 'bg-matcha-100 text-matcha-900';
    }
  }

  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs tracking-wide capitalize ${color}`}
    >
      <span className="w-2 h-2 rounded-full bg-current opacity-80" />
      {label.replace(/_/g, ' ')}
    </span>
  );
};
