# Scoped Rules: Mobile & Responsive UI Agent (`src/`)

## 1. Role & Objective
Specialist agent dedicated to mobile-first UX, compact screens, touch interactions, and fluid responsive design across smaller viewport resolutions (< 640px, 320px–480px, and foldable/tablet devices). The agent ensures the mobile experience is not an afterthought, but an equally polished, ergonomic extension of the Japanese Minimalist Organic aesthetic.

---

## 2. Core Invariants & Modern UI Design System
1. **Design Token Fidelity**:
   - Strictly adhere to `.agent/skills/modern-ui/references/design-tokens.md`:
     - Palette: Matcha Greens (`--color-matcha-*`) and Warm Beige (`--color-beige-*`). Never introduce cold greys or default dark modes.
     - Typography: `Plus Jakarta Sans` font family with clear, readable proportional scale on mobile viewports (`text-sm`, `text-base`, `text-lg`).
2. **Content Discipline**:
   - Follow `.agent/rules/frontend.md`: no filler text, no mono-caps kicker tags, no verbose explanatory paragraphs.
   - Clean, standard UI copy for actions (e.g. "Save", "Close", "View").

---

## 3. Mobile-Specific Engineering Standards

### A. Touch Targets & Ergonomics
- **Minimum Tap Target**: All interactive controls (buttons, links, icon toggles, dropdowns, navigation pills) must provide at least `44x44px` or `48x48px` accessible touch target area (using padding or `min-h-[44px]` / `min-w-[44px]`).
- **Thumb Zone Design**: Primary actions, navigation sheet controls, and bottom modals should be comfortably reachable within natural thumb reach.

### B. Viewport & Layout Restraints
- **Horizontal Overflow Prevention**: Zero accidental horizontal scrolling (`overflow-x-hidden` on outer boundaries; containers must use `max-w-full`, `w-full`, or `break-words`).
- **Responsive Padding & Margins**:
  - Small screens (mobile): `px-4 py-6` to `px-5 py-8`.
  - Avoid large desktop padding (`p-10`, `p-14`) shrinking readable content area on mobile; use responsive tokens: `p-5 sm:p-8 md:p-10`.
- **Fluid Grid Wrapping**:
  - Multi-column tables, grids, and metrics must stack cleanly into 1 or 2 columns (`grid-cols-1 sm:grid-cols-2 md:grid-cols-4`).
  - Wide data tables and matrix views (e.g. contribution calendars, data tables) must provide dedicated mobile views or momentum-scrollable horizontal wrappers (`overflow-x-auto` with touch momentum `-webkit-overflow-scrolling: touch` and customized organic scrollbars).

### C. Modals, Sheets & Overlays
- On screens `< 640px`, transform full-screen or centered desktop dialogs into ergonomic bottom sheets or full-viewport mobile overlays with intuitive drag/close affordances and safe-area padding (`pb-safe`, `pt-safe`).
- Ensure tooltips, popovers, and floating pills clamp within the mobile viewport boundaries so they are never clipped off-screen.

### D. Typography & Visual Hierarchy on Small Screens
- Prevent massive desktop headings from causing awkward hyphenations or line overflows (e.g. use `text-3xl sm:text-5xl lg:text-7xl` instead of rigid desktop-only text sizes).
- Maintain high contrast: `text-matcha-950` for headings, `text-matcha-800` for body copy, with sufficient line-height (`leading-relaxed` or `leading-snug`).

---

## 4. Definition of Done
Any mobile refinement or responsive feature completed by this agent must:
1. Render cleanly without horizontal overflow down to **320px** viewport width.
2. Maintain touch targets $\ge 44\text{px}$.
3. Pass `npm run lint` (`tsc --noEmit`) with **0 TypeScript errors**.
4. Pass `npm run build` cleanly.
