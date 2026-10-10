# Feature: Modern UI Redesign & Content De-Cluttering (Agentic Frontend)

## 1. Overview & Objective
Comprehensive UI redesign and content discipline refactor across both the Public Portfolio and the Admin CMS (`/orven`). The goal is to elevate the website's visual quality to align strictly with the **Modern UI (Japanese Minimalist Organic Matcha & Beige)** design skill and eliminate all redundant, verbose, and filler texts across administrative and public views.

---

## 2. Designated Agent Responsibilities
- **Frontend & UI Agent (`src/`)**:
  - Implements refined layouts, responsive spacing, and crisp visual components.
  - Adheres strictly to design tokens in `.agent/skills/modern-ui/references/design-tokens.md` (`--color-matcha-*`, `--color-beige-*`, `Plus Jakarta Sans`).
  - Eliminates filler subtitles, pseudo-technical mono-caps kickers, redundant toggle status rows, and unnecessary explanatory text.
  - Ensures all interactive components maintain accessible contrast and smooth micro-interactions.
- **Quality & Verification Agent**:
  - Validates zero TypeScript errors via `npm run lint` (`tsc --noEmit`).
  - Verifies production builds and sitemap generation via `npm run build`.

---

## 3. Scope of Work

### A. Admin CMS (`/orven`) Content & UI Cleanup
1. **Header & Section Hierarchy**:
   - Modernize `SectionHeader` across all dashboard modules.
   - Remove long-winded, patronizing helper descriptions (e.g., *"Monitor portfolio metrics, publish new content, manage project showcases..."*, *"Curate and manage your articles..."*). Titles speak for themselves; use compact, contextual actions.
2. **Dashboard Overview (`DashboardOverview.tsx`)**:
   - Streamline metric cards with cleaner typography, crisp borders, and subtle elevation.
   - Remove noisy uppercase mono-caps labels.
   - Refine quick action shortcuts.
3. **Home & Profile Manager (`HomeContentManager.tsx`)**:
   - Remove intrusive promotional banners (e.g. *"Manage Tech Stack Icons"* promo inside profile form).
   - Clean up section visibility toggles: remove the redundant bottom *"Status: Visible / Hidden"* bar underneath switches—the toggle switch itself communicates state.
   - Clean card padding, borders, and input focus states.
4. **Content Managers (`BlogManager`, `ProjectManager`, `TechStackManager`, etc.)**:
   - Compact table headers and search toolbars.
   - Modern, sleek buttons with clear affordances.
   - Consistent modal dialogues and action buttons.
5. **AI Assistant View (`AIAssistantPage.tsx`)**:
   - Streamlined top bar without redundant subtitles.
   - Clean conversation sidebar and message bubbles.

### B. Public Portfolio Refinement
1. **Hero & Intro (`HomePage.tsx`)**:
   - Remove all mono-caps kickers and filler tags (e.g. `Deployed Projects`, `Engineering Higlights`).
   - Clean typography with strong hierarchy (`text-matcha-950`, `text-matcha-700`).
   - Refined tech stack expertise row with smooth hover tooltips.
2. **Cards & Showcases (`HomePage`, `ProjectsPage`, `BlogsPage`)**:
   - Ultra-clean borders (`border-beige-200`, `hover:border-matcha-300`).
   - Consistent badge styles (`bg-matcha-100 text-matcha-800`).
   - Crisp date, tag, and reading-time metadata.
3. **Global Layout & Navigation (`PublicNavbar.tsx`, `PublicFooter.tsx`, `CommonUI.tsx`)**:
   - Seamless backdrop blur, elegant borders, and responsive spacing.

---

## 4. Acceptance Criteria
- [ ] No unnecessary filler strings or redundant helper paragraphs in Admin CMS.
- [ ] No mono-caps kicker tags on public pages.
- [ ] Strict token fidelity to `--color-matcha-*` and `--color-beige-*`.
- [ ] `npm run lint` passes with 0 errors.
- [ ] `npm run build` succeeds cleanly.
