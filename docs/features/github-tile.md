# Feature: GitHub Contribution Activity Tile (`github-tile.md`)

## 1. Overview & Objective
Add an interactive, organic GitHub Contribution Activity section to the public Home page (`HomePage.tsx`). As visitors scroll down the home page, they will see a live visual mirror of Orven's GitHub activity ("tiles" / contribution calendar graph) that reflects commit volume, streaks, and repository activity.

The aesthetic must integrate seamlessly with the portfolio's **Japanese Minimalist Organic (Matcha & Warm Beige)** design system (`--color-matcha-*`, `--color-beige-*`, `Plus Jakarta Sans`) without harsh generic dark-mode greens or foreign styling.

---

## 2. Designated Agent Responsibilities
- **Frontend & UI Agent (`src/`)**:
  - Implements the new `GitHubTiles` component (`src/components/public/GitHubTiles.tsx`) and integrates it into `HomePage.tsx`.
  - Implements robust contribution calendar data fetching with cache persistence and graceful fallback.
  - Honors the design tokens in `.agent/skills/modern-ui/references/design-tokens.md`:
    - Base empty tile: `bg-beige-200`
    - Level 1 contribution: `bg-matcha-200`
    - Level 2 contribution: `bg-matcha-400`
    - Level 3 contribution: `bg-matcha-600`
    - Level 4 contribution: `bg-matcha-800`
    - High contrast text: `text-matcha-950`
  - Maintains content discipline: no fake vanity metrics, no filler mono-caps headers (`// TELEMETRY`, `GITHUB MATRIX`). Use clean, clear copy: "GitHub Activity", "Contributions in the last year", "Current streak", etc.
  - Adds interactive hover tooltips displaying date and contribution count for each tile.
  - Ensures responsive horizontal scrolling or clean responsive grid wrapping on mobile screens.
- **Quality & Verification Agent**:
  - Validates zero TypeScript errors via `npm run lint` (`tsc --noEmit`).
  - Verifies production builds via `npm run build`.

---

## 3. Architecture & Data Strategy

### A. Data Fetching Strategy
GitHub's public user contribution calendar can be fetched client-side with fallback resiliency:
1. **Primary API Endpoint**:
   Use the reliable public contribution calendar JSON endpoint:
   `https://github-contributions-api.jogruber.de/v4/{username}?y=last`
   (Target username: `orvencasido`, extracted dynamically from `social_links` GitHub entry or defaulting to `orvencasido`).
2. **Local Storage / Memory Cache**:
   Cache contribution calendar data for 1 hour (`CacheKeys.GITHUB_ACTIVITY` in `src/lib/cache.ts` or local cache) to avoid redundant network requests on page reloads.
3. **Graceful Offline / Fallback State**:
   If the network request fails or rate-limits, generate a deterministic fallback calendar model so the UI never displays broken layouts or crashes (adhering to the project's hybrid fallback guarantee).

### B. Visual Tile Scale (Matcha Palette)
Map GitHub's 5 intensity levels (0 to 4) directly to the Matcha design tokens:
- **Level 0 (No contributions)**: `bg-beige-200 hover:border-beige-300`
- **Level 1 (1–3 contributions)**: `bg-matcha-200/90 hover:border-matcha-300`
- **Level 2 (4–6 contributions)**: `bg-matcha-400 hover:border-matcha-500`
- **Level 3 (7–9 contributions)**: `bg-matcha-600 hover:border-matcha-700`
- **Level 4 (10+ contributions)**: `bg-matcha-800 hover:border-matcha-900`

---

## 4. UI Layout & Component Specification

### Placement on `HomePage.tsx`
Place the GitHub Activity section directly after the **Hero Section** (or between Featured Projects and Latest Articles), housed on a clean `bg-beige-100` canvas with:
1. **Section Header**:
   - Title: `GitHub Activity`
   - Subtitle: Clean sentence-case explanation: `Consistent contributions and open-source DevOps automation across repositories.`
   - Profile Link: External badge/link to `github.com/orvencasido` with GitHub icon and arrow.
2. **Summary Stats Strip**:
   - Total contributions in the past year
   - Longest / current streak (if available from data)
   - Most active day / average per week
3. **Interactive Calendar Grid**:
   - 52-week grid (7 rows for days of the week, 52 columns for weeks).
   - Month labels along the top (Jan, Feb, Mar, etc.) in `text-xs text-matcha-700 font-medium`.
   - Smooth hover tooltips: `"[X] contributions on [Date]"`.
   - Legend at bottom right: `Less` [tiles: L0 -> L4] `More`.

---

## 5. Scope of Work & Step-by-Step Execution Plan

- [ ] **Step 1: Data Service & Helper** (`src/lib/githubService.ts` or `src/lib/services.ts`):
  - Create `getGitHubContributions(username: string)` function with caching and fallback.
  - Export TypeScript types for `ContributionDay`, `ContributionWeek`, and `GitHubContributionsData`.
- [ ] **Step 2: Component Creation** (`src/components/public/GitHubTiles.tsx`):
  - Build responsive container with horizontal scroll handling.
  - Implement SVG/CSS grid matching Matcha tokens.
  - Add interactive tooltips on hover.
  - Add summary stats card (total contributions, active weeks).
- [ ] **Step 3: Integration into `HomePage.tsx`**:
  - Import `GitHubTiles` into `HomePage.tsx`.
  - Wire GitHub username dynamically from `socialLinks` or fallback to `'orvencasido'`.
- [ ] **Step 4: Quality & Verification**:
  - Run `npm run lint` (`tsc --noEmit`) to verify 0 errors.
  - Run `npm run build` to confirm clean bundle.
