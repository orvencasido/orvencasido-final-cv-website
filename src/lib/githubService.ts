import { getCached, setCached, CacheKeys } from './cache';

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface ContributionWeek {
  days: (ContributionDay | null)[];
}

export interface GitHubContributionsSummary {
  totalLastYear: number;
  currentStreak: number;
  longestStreak: number;
  activeDaysCount: number;
}

export interface GitHubContributionsData {
  username: string;
  total: {
    [key: string]: number | undefined;
    lastYear?: number;
  };
  contributions: ContributionDay[];
  weeks: ContributionWeek[];
  summary: GitHubContributionsSummary;
  isFallback?: boolean;
}

const ONE_HOUR_MS = 60 * 60 * 1000;
const LOCAL_STORAGE_PREFIX = 'orven_gh_contributions_';

/**
 * Maps raw commit counts to the 5 visual Matcha intensity levels (0 to 4):
 * - Level 0: 0
 * - Level 1: 1–3
 * - Level 2: 4–6
 * - Level 3: 7–9
 * - Level 4: 10+
 */
export function getContributionLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count <= 3) return 1;
  if (count <= 6) return 2;
  if (count <= 9) return 3;
  return 4;
}

/**
 * Extracts a GitHub username from a URL, handle, or defaults to 'orvencasido'.
 */
export function extractGitHubUsername(urlOrHandle?: string | null): string {
  if (!urlOrHandle) return 'orvencasido';
  const clean = urlOrHandle.trim().replace(/\/+$/, '');
  const match = clean.match(/(?:github\.com\/|^)([a-zA-Z0-9-]+)$/i);
  return match && match[1] ? match[1] : 'orvencasido';
}

/**
 * Computes summary metrics: total contributions, streaks, active days.
 */
export function calculateContributionsSummary(days: ContributionDay[]): GitHubContributionsSummary {
  let totalLastYear = 0;
  let activeDaysCount = 0;
  let maxStreak = 0;
  let currentAccumulator = 0;

  for (const day of days) {
    totalLastYear += day.count;
    if (day.count > 0) {
      activeDaysCount++;
      currentAccumulator++;
      if (currentAccumulator > maxStreak) {
        maxStreak = currentAccumulator;
      }
    } else {
      currentAccumulator = 0;
    }
  }

  // Calculate current streak from the latest day backwards
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (day.count > 0) {
      currentStreak++;
    } else if (currentStreak === 0 && i === days.length - 1) {
      // If today has 0 so far, continue checking yesterday
      continue;
    } else {
      break;
    }
  }

  return {
    totalLastYear,
    currentStreak,
    longestStreak: maxStreak,
    activeDaysCount,
  };
}

/**
 * Organizes days into columns of 7-day weeks (Sunday=0 to Saturday=6).
 * Handles partial starting/ending weeks with null slots.
 */
export function groupContributionsIntoWeeks(days: ContributionDay[]): ContributionWeek[] {
  if (days.length === 0) return [];

  const weeks: ContributionWeek[] = [];
  let currentWeek: (ContributionDay | null)[] = [];

  // Determine starting weekday of the first element
  const [firstYear, firstMonth, firstDayNum] = days[0].date.split('-').map(Number);
  const firstDate = new Date(firstYear, firstMonth - 1, firstDayNum);
  const startDayOfWeek = firstDate.getDay(); // 0 is Sunday

  // Pad the first week if not starting on Sunday
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }
  }

  // Pad the final week if ending mid-week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push({ days: currentWeek });
  }

  return weeks;
}

/**
 * Deterministic pseudo-random number generator for resilient offline fallbacks.
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Generates a realistic, deterministic 53-week contribution dataset
 * when offline, network fails, or the public API rate-limits.
 */
export function generateFallbackContributions(username: string): GitHubContributionsData {
  const userHash = hashString(username);
  const days: ContributionDay[] = [];

  // Anchor to current date and find the most recent Saturday
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysToSaturday = 6 - dayOfWeek;
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + daysToSaturday);

  // Generate 53 full weeks (371 days) backwards
  const totalDays = 371;
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(endDate.getDate() - i);

    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const rand = pseudoRandom(userHash + i * 17);

    // Weekdays have higher commit frequency than weekends
    let count = 0;
    if (isWeekend) {
      if (rand > 0.7) {
        count = Math.floor(rand * 5) + 1;
      }
    } else {
      if (rand > 0.35) {
        count = Math.floor(rand * 9) + 1;
        // occasional high-intensity burst
        if (rand > 0.88) {
          count += 6;
        }
      }
    }

    days.push({
      date: dateStr,
      count,
      level: getContributionLevel(count),
    });
  }

  const summary = calculateContributionsSummary(days);
  const weeks = groupContributionsIntoWeeks(days);

  return {
    username,
    total: { lastYear: summary.totalLastYear },
    contributions: days,
    weeks,
    summary,
    isFallback: true,
  };
}

/**
 * Fetches contribution calendar data from the public API with:
 * 1. In-memory caching
 * 2. 1-hour LocalStorage cache
 * 3. Deterministic offline fallback
 */
export async function getGitHubContributions(username: string = 'orvencasido'): Promise<GitHubContributionsData> {
  const normalizedUser = extractGitHubUsername(username).toLowerCase();
  const memKey = CacheKeys.githubActivity(normalizedUser);
  const storageKey = `${LOCAL_STORAGE_PREFIX}${normalizedUser}`;

  // 1. Check in-memory cache
  const memCached = getCached<GitHubContributionsData>(memKey);
  if (memCached) {
    return memCached;
  }

  // 2. Check localStorage cache
  let localData: { timestamp: number; data: GitHubContributionsData } | null = null;
  try {
    const rawLocal = localStorage.getItem(storageKey);
    if (rawLocal) {
      localData = JSON.parse(rawLocal);
      if (localData && Date.now() - localData.timestamp < ONE_HOUR_MS) {
        setCached(memKey, localData.data, ONE_HOUR_MS);
        return localData.data;
      }
    }
  } catch {
    // Ignore localStorage parsing errors (private browsing, quotas)
  }

  // 3. Network Fetch
  try {
    const response = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(normalizedUser)}?y=last`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    if (!response.ok) {
      throw new Error(`Contribution API returned ${response.status}`);
    }

    const payload = (await response.json()) as {
      total?: { [key: string]: number; lastYear?: number };
      contributions?: Array<{ date: string; count: number; level: number }>;
    };

    if (!Array.isArray(payload.contributions) || payload.contributions.length === 0) {
      throw new Error('Invalid contributions payload structure');
    }

    const normalizedDays: ContributionDay[] = payload.contributions.map((c) => ({
      date: c.date,
      count: c.count,
      level: getContributionLevel(c.count),
    }));

    const summary = calculateContributionsSummary(normalizedDays);
    const weeks = groupContributionsIntoWeeks(normalizedDays);

    const result: GitHubContributionsData = {
      username: normalizedUser,
      total: {
        lastYear: payload.total?.lastYear ?? summary.totalLastYear,
        ...payload.total,
      },
      contributions: normalizedDays,
      weeks,
      summary,
      isFallback: false,
    };

    // Store in memory and localStorage
    setCached(memKey, result, ONE_HOUR_MS);
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: result,
        })
      );
    } catch {
      // Ignore quota exceptions
    }

    return result;
  } catch (err) {
    console.warn(`[GitHubService] Unable to fetch contribution graph for ${normalizedUser}. Using fallback cache.`, err);

    // If we have stale localStorage data, use it over deterministic mock
    if (localData?.data) {
      const staleData: GitHubContributionsData = {
        ...localData.data,
        isFallback: true,
      };
      setCached(memKey, staleData, ONE_HOUR_MS);
      return staleData;
    }

    // Otherwise, generate deterministic fallback
    const fallback = generateFallbackContributions(normalizedUser);
    setCached(memKey, fallback, 10 * 60 * 1000); // 10 minutes cache for fallback
    return fallback;
  }
}
