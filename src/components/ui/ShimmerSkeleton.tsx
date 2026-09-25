import React from 'react';

/**
 * Base shimmer block component.
 */
export const ShimmerBlock: React.FC<{
  className?: string;
  rounded?: string;
}> = ({ className = 'h-4 w-full', rounded = 'rounded-2xl' }) => (
  <div
    className={`bg-beige-200/90 border border-beige-300/60 animate-shimmer ${rounded} ${className}`}
  />
);

/**
 * Skeleton for Hero section on HomePage
 */
export const HeroSkeleton: React.FC = () => (
  <section className="w-full bg-beige-100 py-16 md:py-24">
    <div className="max-w-6xl mx-auto px-6 md:px-10 flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16">
      {/* Left Column */}
      <div className="flex-1 space-y-6 w-full">
        <div className="space-y-3">
          <ShimmerBlock className="h-14 sm:h-16 w-3/4" rounded="rounded-3xl" />
          <ShimmerBlock className="h-8 w-1/2" rounded="rounded-2xl" />
        </div>

        <div className="space-y-2.5 max-w-2xl pt-2">
          <ShimmerBlock className="h-5 w-full" rounded="rounded-xl" />
          <ShimmerBlock className="h-5 w-5/6" rounded="rounded-xl" />
          <ShimmerBlock className="h-5 w-2/3" rounded="rounded-xl" />
        </div>

        {/* Tech Stack Pills */}
        <div className="pt-6 flex flex-wrap gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <ShimmerBlock key={i} className="h-9 w-9" rounded="rounded-xl" />
          ))}
        </div>
      </div>

      {/* Right Column: Avatar */}
      <div className="shrink-0 flex items-center justify-center">
        <ShimmerBlock
          className="w-64 h-64 sm:w-80 sm:h-80 lg:w-[360px] lg:h-[360px]"
          rounded="rounded-full shadow-lg"
        />
      </div>
    </div>
  </section>
);

/**
 * Skeleton for Project Grid Cards on ProjectsPage and HomePage
 */
export const ProjectGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex flex-col rounded-3xl border border-beige-300 bg-beige-50 overflow-hidden shadow-xs"
      >
        {/* Cover block */}
        <ShimmerBlock className="aspect-video w-full" rounded="rounded-none" />

        {/* Content block */}
        <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <ShimmerBlock className="h-7 w-4/5" rounded="rounded-xl" />
            <ShimmerBlock className="h-4 w-full" rounded="rounded-lg" />
            <ShimmerBlock className="h-4 w-3/4" rounded="rounded-lg" />
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap gap-2">
              <ShimmerBlock className="h-6 w-16" rounded="rounded-full" />
              <ShimmerBlock className="h-6 w-20" rounded="rounded-full" />
              <ShimmerBlock className="h-6 w-14" rounded="rounded-full" />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-beige-200">
              <ShimmerBlock className="h-4 w-32" rounded="rounded-lg" />
              <ShimmerBlock className="h-4 w-16" rounded="rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for Blog List Cards on BlogsPage
 */
export const BlogListSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="space-y-8">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-8 rounded-3xl border border-beige-300 bg-beige-50 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-3">
          <ShimmerBlock className="h-4 w-24" rounded="rounded-full" />
          <ShimmerBlock className="h-4 w-20" rounded="rounded-full" />
        </div>
        <ShimmerBlock className="h-7 w-3/4" rounded="rounded-xl" />
        <div className="space-y-2">
          <ShimmerBlock className="h-4 w-full" rounded="rounded-lg" />
          <ShimmerBlock className="h-4 w-5/6" rounded="rounded-lg" />
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-beige-200">
          <div className="flex gap-2">
            <ShimmerBlock className="h-6 w-16" rounded="rounded-full" />
            <ShimmerBlock className="h-6 w-20" rounded="rounded-full" />
          </div>
          <ShimmerBlock className="h-4 w-24" rounded="rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for Timeline on ExperiencePage and EducationPage
 */
export const TimelineSkeleton: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <div className="relative pl-6 sm:pl-8 border-l-2 border-beige-300 space-y-10">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="relative space-y-4">
        {/* Spine node */}
        <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-beige-300 border-4 border-beige-100" />

        <div className="p-8 rounded-3xl border border-beige-300 bg-beige-50 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-2">
              <ShimmerBlock className="h-6 w-48" rounded="rounded-xl" />
              <ShimmerBlock className="h-4 w-36" rounded="rounded-lg" />
            </div>
            <ShimmerBlock className="h-6 w-28" rounded="rounded-full" />
          </div>

          <div className="space-y-2 pt-2">
            <ShimmerBlock className="h-4 w-full" rounded="rounded-lg" />
            <ShimmerBlock className="h-4 w-4/5" rounded="rounded-lg" />
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <ShimmerBlock className="h-6 w-16" rounded="rounded-full" />
            <ShimmerBlock className="h-6 w-20" rounded="rounded-full" />
            <ShimmerBlock className="h-6 w-16" rounded="rounded-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for Certifications Grid on CertificationsPage
 */
export const CertificationGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-8 rounded-3xl border border-beige-300 bg-beige-50 shadow-xs space-y-5"
      >
        <div className="flex items-center gap-4">
          <ShimmerBlock className="w-14 h-14" rounded="rounded-2xl" />
          <div className="flex-1 space-y-2">
            <ShimmerBlock className="h-5 w-3/4" rounded="rounded-xl" />
            <ShimmerBlock className="h-4 w-1/2" rounded="rounded-lg" />
          </div>
        </div>
        <ShimmerBlock className="h-4 w-full" rounded="rounded-lg" />
        <div className="flex flex-wrap gap-2 pt-2">
          <ShimmerBlock className="h-6 w-20" rounded="rounded-full" />
          <ShimmerBlock className="h-6 w-24" rounded="rounded-full" />
        </div>
      </div>
    ))}
  </div>
);
