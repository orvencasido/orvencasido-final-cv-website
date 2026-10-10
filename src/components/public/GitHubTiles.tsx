import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  Github,
  ExternalLink,
  GitCommit,
  Flame,
  Trophy,
  Activity,
} from 'lucide-react';
import {
  getGitHubContributions,
  ContributionDay,
  GitHubContributionsData,
} from '../../lib/githubService';

interface GitHubTilesProps {
  username?: string;
  className?: string;
}

interface HoveredTileState {
  day: ContributionDay;
  x: number;
  y: number;
  arrowOffset?: number;
}

function formatContributionDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const TILE_LEVEL_CLASSES = [
  'bg-beige-200 hover:border-beige-300',
  'bg-matcha-200/90 hover:border-matcha-300',
  'bg-matcha-400 hover:border-matcha-500',
  'bg-matcha-600 hover:border-matcha-700',
  'bg-matcha-800 hover:border-matcha-900',
];

export const GitHubTiles: React.FC<GitHubTilesProps> = ({
  username = 'orvencasido',
  className = '',
}) => {
  const [data, setData] = useState<GitHubContributionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredTile, setHoveredTile] = useState<HoveredTileState | null>(null);

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const heatmapWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getGitHubContributions(username)
      .then((res) => {
        if (isMounted) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load GitHub contributions:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [username]);

  const totalWeeks = data?.weeks?.length || 53;

  // Compute month label positions along columns
  const monthLabels = useMemo(() => {
    if (!data?.weeks || data.weeks.length === 0) return [];

    const labels: Array<{ colIndex: number; name: string }> = [];
    let lastMonth = '';

    data.weeks.forEach((week, colIdx) => {
      const firstValidDay = week.days.find((d): d is ContributionDay => d !== null);
      if (!firstValidDay) return;

      const [, monthNum] = firstValidDay.date.split('-');
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      const monthName = monthNames[parseInt(monthNum, 10) - 1];

      // Insert label when month changes with sufficient distance from neighboring labels
      if (monthName && monthName !== lastMonth) {
        const isFarEnoughFromPrev = labels.length === 0 || colIdx - labels[labels.length - 1].colIndex >= 3;
        const isNotAtLastColumn = data.weeks.length - colIdx >= 2;
        if (isFarEnoughFromPrev && isNotAtLastColumn) {
          labels.push({ colIndex: colIdx, name: monthName });
          lastMonth = monthName;
        }
      }
    });

    return labels;
  }, [data]);

  const handleTileHover = (day: ContributionDay, el: HTMLElement) => {
    if (!heatmapWrapperRef.current) return;
    const tileRect = el.getBoundingClientRect();
    const wrapperRect = heatmapWrapperRef.current.getBoundingClientRect();

    const rawX = tileRect.left - wrapperRect.left + tileRect.width / 2;
    const rawY = tileRect.top - wrapperRect.top;

    // Tooltip safe boundary clamping
    const halfWidth = 105;
    const minX = Math.min(halfWidth, wrapperRect.width / 2);
    const maxX = Math.max(minX, wrapperRect.width - halfWidth);
    const clampedX = Math.max(minX, Math.min(rawX, maxX));
    const arrowOffset = Math.max(-75, Math.min(75, rawX - clampedX));

    setHoveredTile({
      day,
      x: clampedX,
      y: rawY - 8,
      arrowOffset,
    });
  };

  const handleTileLeave = () => {
    setHoveredTile(null);
  };

  const targetUser = data?.username || username || 'orvencasido';
  const profileUrl = `https://github.com/${targetUser}`;

  return (
    <section className={`w-full ${className}`}>
      {/* Main Container Card */}
      <div className="bg-beige-50 border border-beige-200 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-8 shadow-2xs">
        {/* Contribution Metrics Strip (2-column on mobile, 4-column on desktop) */}
        {loading || !data ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-beige-100/70 border border-beige-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 space-y-2 animate-pulse"
              >
                <div className="h-3 sm:h-4 w-16 sm:w-20 bg-beige-200 rounded" />
                <div className="h-6 sm:h-7 w-20 sm:w-28 bg-beige-200 rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            {/* Total Contributions */}
            <div className="bg-beige-100/70 border border-beige-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all hover:border-matcha-300">
              <div className="flex items-center gap-1.5 sm:gap-2 text-matcha-700 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                <GitCommit className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-matcha-600 shrink-0" />
                <span className="truncate">Contributions</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-matcha-950 tracking-tight">
                  {data.summary.totalLastYear.toLocaleString()}
                </span>
                <span className="block text-[11px] sm:text-xs text-matcha-700/80 mt-0.5 truncate">Past year</span>
              </div>
            </div>

            {/* Current Streak */}
            <div className="bg-beige-100/70 border border-beige-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all hover:border-matcha-300">
              <div className="flex items-center gap-1.5 sm:gap-2 text-matcha-700 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-matcha-600 shrink-0" />
                <span className="truncate">Streak</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-matcha-950 tracking-tight">
                  {data.summary.currentStreak}{' '}
                  <span className="text-xs sm:text-base font-semibold text-matcha-800">
                    {data.summary.currentStreak === 1 ? 'day' : 'days'}
                  </span>
                </span>
                <span className="block text-[11px] sm:text-xs text-matcha-700/80 mt-0.5 truncate">Consecutive</span>
              </div>
            </div>

            {/* Longest Streak */}
            <div className="bg-beige-100/70 border border-beige-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all hover:border-matcha-300">
              <div className="flex items-center gap-1.5 sm:gap-2 text-matcha-700 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-matcha-600 shrink-0" />
                <span className="truncate">Longest</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-matcha-950 tracking-tight">
                  {data.summary.longestStreak}{' '}
                  <span className="text-xs sm:text-base font-semibold text-matcha-800">
                    {data.summary.longestStreak === 1 ? 'day' : 'days'}
                  </span>
                </span>
                <span className="block text-[11px] sm:text-xs text-matcha-700/80 mt-0.5 truncate">Record</span>
              </div>
            </div>

            {/* Active Days */}
            <div className="bg-beige-100/70 border border-beige-200/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col justify-between transition-all hover:border-matcha-300">
              <div className="flex items-center gap-1.5 sm:gap-2 text-matcha-700 text-xs sm:text-sm font-medium mb-1.5 sm:mb-2">
                <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-matcha-600 shrink-0" />
                <span className="truncate">Active Days</span>
              </div>
              <div>
                <span className="text-xl sm:text-2xl md:text-3xl font-extrabold text-matcha-950 tracking-tight">
                  {data.summary.activeDaysCount}{' '}
                  <span className="text-xs sm:text-base font-semibold text-matcha-800">
                    {data.summary.activeDaysCount === 1 ? 'day' : 'days'}
                  </span>
                </span>
                <span className="block text-[11px] sm:text-xs text-matcha-700/80 mt-0.5 truncate">Total active</span>
              </div>
            </div>
          </div>
        )}

        {/* Heatmap Section */}
        <div ref={heatmapWrapperRef} className="relative w-full">
          {/* Floating Tooltip positioned safely outside overflow container */}
          {hoveredTile && (
            <div
              style={{
                left: `${hoveredTile.x}px`,
                top: `${hoveredTile.y}px`,
              }}
              className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-30 transition-all duration-75 ease-out"
            >
              <div className="bg-matcha-950 text-beige-50 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                {hoveredTile.day.count === 0
                  ? 'No contributions'
                  : `${hoveredTile.day.count} contribution${hoveredTile.day.count === 1 ? '' : 's'}`}{' '}
                on {formatContributionDate(hoveredTile.day.date)}
              </div>
              <div
                style={{
                  transform: `translateX(${hoveredTile.arrowOffset || 0}px) rotate(45deg)`,
                }}
                className="w-2 h-2 bg-matcha-950 mx-auto -mt-1 pointer-events-none"
              />
            </div>
          )}

          {loading || !data ? (
            <div className="w-full h-36 bg-beige-100/50 rounded-2xl border border-beige-200/80 animate-pulse flex items-center justify-center">
              <span className="text-xs text-matcha-700 font-medium">Loading contribution calendar...</span>
            </div>
          ) : (
            <div
              ref={gridContainerRef}
              onScroll={() => setHoveredTile(null)}
              className="w-full overflow-x-auto pb-2 scrollbar-thin select-none"
            >
              <div className="min-w-[680px] w-full">
                {/* Month labels row aligned with columns */}
                <div className="flex gap-2 items-start mb-2 select-none">
                  <div className="shrink-0 w-6 sm:w-7 pr-1" />
                  <div className="relative h-4 flex-1">
                    {monthLabels.map((m) => (
                      <span
                        key={`${m.name}-${m.colIndex}`}
                        style={{
                          left: `${(m.colIndex / totalWeeks) * 100}%`,
                        }}
                        className="absolute top-0 text-[11px] font-medium text-matcha-700 select-none whitespace-nowrap"
                      >
                        {m.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Grid + Day Labels */}
                <div className="flex gap-2 items-stretch">
                  {/* Day of Week Labels (Mon, Wed, Fri) */}
                  <div className="grid grid-rows-7 gap-[2px] sm:gap-[3px] text-[10px] text-matcha-700/70 font-medium select-none shrink-0 w-6 sm:w-7 text-right pr-1">
                    <div className="flex items-center justify-end" />
                    <div className="flex items-center justify-end">
                      <span className="leading-none">Mon</span>
                    </div>
                    <div className="flex items-center justify-end" />
                    <div className="flex items-center justify-end">
                      <span className="leading-none">Wed</span>
                    </div>
                    <div className="flex items-center justify-end" />
                    <div className="flex items-center justify-end">
                      <span className="leading-none">Fri</span>
                    </div>
                    <div className="flex items-center justify-end" />
                  </div>

                  {/* 53 Columns spanning full width evenly */}
                  <div
                    className="flex-1 grid gap-[2px] sm:gap-[3px]"
                    style={{
                      gridTemplateColumns: `repeat(${totalWeeks}, minmax(0, 1fr))`,
                    }}
                  >
                    {data.weeks.map((week, colIndex) => (
                      <div key={colIndex} className="grid grid-rows-7 gap-[2px] sm:gap-[3px]">
                        {week.days.map((day, dayIndex) => {
                          if (!day) {
                            return (
                              <div
                                key={`empty-${colIndex}-${dayIndex}`}
                                className="w-full aspect-square rounded-[2px] sm:rounded-[3px] bg-transparent"
                              />
                            );
                          }

                          return (
                            <button
                              key={day.date}
                              type="button"
                              tabIndex={0}
                              aria-label={`${day.count} contributions on ${formatContributionDate(day.date)}`}
                              onMouseEnter={(e) => handleTileHover(day, e.currentTarget)}
                              onMouseLeave={handleTileLeave}
                              onFocus={(e) => handleTileHover(day, e.currentTarget)}
                              onBlur={handleTileLeave}
                              onClick={(e) => handleTileHover(day, e.currentTarget)}
                              className={`w-full aspect-square rounded-[2px] sm:rounded-[3px] border border-transparent transition-transform duration-100 ease-out hover:scale-125 hover:z-10 focus:scale-125 focus:z-10 focus:outline-none focus:ring-1 focus:ring-matcha-700 cursor-pointer relative ${TILE_LEVEL_CLASSES[day.level]}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer: GitHub Link, Metadata note & Matcha Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-matcha-700 pt-2 border-t border-beige-200/80">
          <div className="flex items-center gap-3">
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-matcha-800 hover:text-matcha-950 font-semibold transition-colors group min-h-[44px]"
            >
              <Github className="w-3.5 h-3.5 text-matcha-700 group-hover:text-matcha-950" />
              <span>github.com/{targetUser}</span>
              <ExternalLink className="w-3 h-3 text-matcha-500 group-hover:text-matcha-700" />
            </a>
            <span className="text-beige-300 hidden sm:inline">•</span>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-matcha-500 animate-pulse" />
              <span className="font-normal text-matcha-700/80">
                Activity mirror
              </span>
            </div>
          </div>

          {/* Color Scale Legend */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="font-medium text-matcha-700 text-xs">Less</span>
            <div className="flex items-center gap-1">
              {TILE_LEVEL_CLASSES.map((cls, idx) => (
                <span
                  key={idx}
                  title={`Level ${idx}`}
                  className={`w-3 h-3 rounded-[2px] sm:rounded-[3px] border border-transparent ${cls.split(' ')[0]}`}
                />
              ))}
            </div>
            <span className="font-medium text-matcha-700 text-xs">More</span>
          </div>
        </div>
      </div>
    </section>
  );
};
export default GitHubTiles;
