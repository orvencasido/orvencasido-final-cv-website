import React, { useState } from 'react';
import { LucideIcon, FolderOpen, ImageOff } from 'lucide-react';
import { Skill } from '../../types';
import { parseTechString, resolveTechIconUrl } from '../../lib/techIcons';

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

export const ProjectCoverImage: React.FC<{
  url?: string;
  title: string;
  className?: string;
}> = ({ url, title, className = 'w-full h-full object-cover' }) => {
  const [hasError, setHasError] = useState(false);

  if (!url || hasError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-beige-200/70 text-matcha-700/60 select-none p-4 text-center">
        <ImageOff className="w-8 h-8 opacity-60 stroke-[1.5]" />
        <span className="text-xs font-mono font-medium">No preview image available</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`${title} - DevOps project by Orven Casido`}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};

export const ProjectTechBadge: React.FC<{
  tech: string;
  skills?: Skill[];
}> = ({ tech, skills }) => {
  const { name: techName } = parseTechString(tech);
  const iconUrl = resolveTechIconUrl(tech, skills);
  const [hasError, setHasError] = useState(false);

  if (!techName) return null;

  return (
    <div className="relative group/tech flex items-center justify-center p-1 cursor-default transition-all duration-200">
      {!hasError && iconUrl ? (
        <img
          src={iconUrl}
          alt={techName}
          className="w-5 h-5 sm:w-5.5 sm:h-5.5 object-contain select-none opacity-50 group-hover/tech:opacity-100 group-hover/tech:scale-110 transition-all duration-200"
          onError={() => setHasError(true)}
        />
      ) : (
        <span className="text-[11px] font-bold font-mono text-matcha-900 bg-matcha-100/70 px-2.5 py-0.5 rounded-full border border-matcha-200/60 select-none">
          {techName}
        </span>
      )}

      {/* Tooltip on hover */}
      <div className="absolute bottom-full mb-2 hidden group-hover/tech:flex flex-col items-center pointer-events-none z-30">
        <span className="px-2.5 py-1 bg-matcha-950 text-beige-50 text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap">
          {techName}
        </span>
        <span className="w-1.5 h-1.5 bg-matcha-950 rotate-45 -mt-0.5"></span>
      </div>
    </div>
  );
};
