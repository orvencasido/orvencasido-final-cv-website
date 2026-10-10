# Feature: Public Portfolio Web Animation Architecture (`animation.md`)

## 1. Overview & Objective
Elevate the visual experience and tactile responsiveness of the public-facing portfolio through purposeful, natural, and high-performance web animations. 

All animations strictly adhere to:
- Emil Kowalski's *Animations on the Web* principles (from `.agent/skills/web-animation/SKILL.md` and `.agent/rules/web-animator.md`).
- The project's **Japanese Minimalist Organic (Matcha & Warm Beige)** design system (`--color-matcha-*`, `--color-beige-*`, `Plus Jakarta Sans`).
- Strict performance discipline: **only animate `transform` and `opacity`** (GPU-accelerated, zero layout reflows).
- Accessibility and ergonomics: robust `prefers-reduced-motion` fallbacks and touch screen hover guards (`@media (hover: hover) and (pointer: fine)`).

---

## 2. Designated Agent Roles & Task Boundaries

- **Web Animator Agent (`src/`)**:
  - Architects animation primitives, easing curves, and duration timing tokens.
  - Implements motion components (leveraging Motion `motion/react` and hardware-accelerated CSS keyframes).
  - Enforces the Easing Blueprint: `ease-out` for entrances/exits, `ease-in-out` for movement, `ease` (150ms) for hover/color shifts.
  - Ensures paired elements (e.g. mobile drawer + backdrop scrim, tooltip + anchor) animate in exact unison.
  - Provides animation audit tables in the mandatory `| Before | After |` format.
- **Frontend & UI Agent (`src/`)**:
  - Integrates animated wrappers into public layout, route pages, cards, and navigation.
  - Guarantees token integrity: Matcha greens (`--color-matcha-50` to `950`) and warm beige (`--color-beige-50` to `400`).
  - Preserves content discipline: no gratuitous or distracting bouncy effects that detract from readability or technical professionalism.
- **Mobile & Responsive Developer Agent (`src/`)**:
  - Guards mobile touch targets ($\ge 44$px) during animated states.
  - Ensures smooth touch gesture physics and eliminates hover stickiness on mobile devices.
  - Verifies zero horizontal overflow during slide or scale transitions on viewports down to 320px.
- **Quality & Verification Agent**:
  - Verifies zero TypeScript compiler errors via `npm run lint` (`tsc --noEmit`).
  - Validates production bundle build and sitemap generation via `npm run build`.

---

## 3. Motion Audit & Transformation Blueprint

In accordance with `.agent/rules/web-animator.md`, here is the baseline audit of current transitions versus the target state:

| Element / Area | Before (Current State) | After (Target Animated State) |
| :--- | :--- | :--- |
| **Page Route Transitions** | Static mount or generic `animate-in fade-in` without exit handling | Motion `AnimatePresence` with subtle `opacity: 0 -> 1` and `y: 6 -> 0`, 200ms `ease-out` |
| **Hero Stagger Entrance** | All elements appear simultaneously | Staggered entrance (title $\rightarrow$ bio $\rightarrow$ tech stack $\rightarrow$ CTA) with 40ms stagger offset, max 250ms per item |
| **Tech Stack Badges** | Static hover without tactile elevation | Micro-lift (`translateY(-2px)` + `scale(1.04)`), 150ms `ease` with subtle Matcha border glow |
| **Project & Blog Cards** | Basic border color swap | Card elevation lift (`translateY(-4px)`), smooth Matcha shadow depth, 200ms `ease-out` |
| **Interactive Buttons** | No tactile click feedback | Active press compression: `active:scale-[0.97]` via 100ms `ease-out` |
| **Mobile Navigation Menu** | Abrupt display toggle without unified scrim | Coordinated `ease-out` slide-down (200ms) with simultaneous backdrop scrim fade (200ms) |
| **Timeline Nodes** | Flat static nodes | Viewport-triggered fade-in with subtle indicator line draw effect |
| **Tooltips (GitHub / Tech)** | Instant render or harsh jump | Origin-aware scale entrance (`scale(0.95) -> 1`), 150ms `ease-out` |
| **Reduced Motion** | Not consistently declared on custom styles | Universal `@media (prefers-reduced-motion: reduce)` disabling all translate/scale shifts |

---

## 4. Architectural Specifications by Component

### A. Route & Layout Transition ([PublicLayout.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/components/public/PublicLayout.tsx))
- **Behavior**: When navigating between `/`, `/projects`, `/blogs`, `/experience`, `/certifications`, `/education`, and `/contact`, content smoothly transitions without layout shifts.
- **Specification**:
  - Container: Motion wrapper listening to `location.pathname`.
  - Initial: `{ opacity: 0, y: 6 }`
  - Animate: `{ opacity: 1, y: 0 }`
  - Transition: `duration: 0.2, ease: [0.165, 0.84, 0.44, 1]` (`ease-out-quart`).
  - Reduced Motion fallback: `{ opacity: 1, y: 0 }` instantly.

### B. Header & Mobile Menu Sheet ([PublicNavbar.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/components/public/PublicNavbar.tsx))
- **Desktop Nav Links**:
  - Active pill indicator transition: smooth layout transition or underline slide.
  - Resume CTA button: tactile press `active:scale-[0.97]` with 100ms `ease-out`.
- **Mobile Menu Overlay**:
  - Scrim Backdrop: `opacity: 0 -> 1` over 200ms `ease-out`.
  - Menu Container: `translateY(-8px) -> translateY(0)` with `opacity: 0 -> 1` over 200ms `ease-out`.
  - Both backdrop and menu close at 160ms (20% faster exit).

### C. Home Page Hero & Showcases ([HomePage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/HomePage.tsx))
- **Hero Hierarchy**:
  - Name heading & title: enters immediately (`0ms` delay).
  - Introduction bio: enters with `40ms` delay.
  - Core tech stack pills: staggered pill entrance with smooth icon rendering.
  - Primary CTA buttons: enters with `80ms` delay.
- **Tech Stack Badges**:
  - Hover: `transform: translateY(-2px) scale(1.03)`, `transition: transform 150ms ease, border-color 150ms ease`.
  - Touch guard: hover effect scoped strictly under `@media (hover: hover) and (pointer: fine)`.
- **Featured Project Cards**:
  - Card hover: `transform: translateY(-4px)`, `box-shadow` to soft Matcha-tinted shadow (`rgba(22, 43, 32, 0.08)`).
  - Thumbnail image: subtle scale `scale(1.02)` inside `overflow-hidden` container.

### D. Career & Education Timelines ([ExperiencePage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/ExperiencePage.tsx), [EducationPage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/EducationPage.tsx))
- **Timeline Nodes**:
  - Left vertical connector: subtle continuous gradient.
  - Milestone cards: viewport entrance (`whileInView`) triggering once (`viewport: { once: true, margin: "-40px" }`).
  - Subtle entrance from bottom: `y: 12 -> 0`, `opacity: 0 -> 1` over 250ms `ease-out`.

### E. Certifications Grid ([CertificationsPage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/CertificationsPage.tsx))
- **Grid Tiles**:
  - Staggered tile reveal.
  - Hover elevation: `translateY(-3px)` with `border-matcha-400` border highlight.

### F. GitHub Activity Heatmap ([GitHubTiles.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/components/public/GitHubTiles.tsx))
- **Tile Interaction**:
  - Tile hover: subtle scale `scale(1.25)` centered on `transform-origin: center`.
  - Tooltip: pops in smoothly from `scale(0.95)` to `scale(1.0)` with `opacity: 0 -> 1` in 120ms `ease-out`.

### G. Draggable Floating Player ([FloatingPhonePlayer.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/components/public/FloatingPhonePlayer.tsx))
- **Physics**:
  - Spring-based release snap using spring physics (`type: "spring", duration: 0.4, bounce: 0.15`).
  - Open/Close expansion: expands from floating button anchor with origin-aligned scale (`scale: 0.95 -> 1.0`).

### H. Contact Form & Action Feedback ([ContactPage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/ContactPage.tsx))
- **Input Fields**:
  - Focus state: smooth outline expansion and border color transition (150ms `ease`).
- **Submit Button**:
  - Idle: tactile `active:scale-[0.97]`.
  - Loading spinner: smooth GPU rotation.
  - Success message banner: enters with `opacity: 0 -> 1` and `y: -4 -> 0` in 200ms `ease-out`.

---

## 5. Step-by-Step Implementation Plan

### Phase 1: Animation Tokens & Shared Primitives
- [ ] **Step 1.1**: Define reusable motion easing constants and variants in `src/lib/animations.ts` (or `src/index.css`):
  - `EASE_OUT = [0.165, 0.84, 0.44, 1]`
  - `EASE_IN_OUT = [0.645, 0.045, 0.355, 1]`
  - `SPRING_TACTILE = { type: "spring", duration: 0.35, bounce: 0.15 }`
- [ ] **Step 1.2**: Implement `MotionPageContainer` or lightweight wrapper with `prefers-reduced-motion` integration for seamless route transitions.

### Phase 2: Navigation & Header Interactions
- [ ] **Step 2.1**: Enhance [PublicNavbar.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/components/public/PublicNavbar.tsx) with coordinated mobile menu entrance (paired overlay scrim + sheet slide).
- [ ] **Step 2.2**: Add tactile press feedback (`active:scale-[0.97]`) to Resume CTA and navigation toggles.

### Phase 3: Home Page Experience
- [ ] **Step 3.1**: Implement staggered hero entrance on [HomePage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/HomePage.tsx).
- [ ] **Step 3.2**: Refine tech stack badge micro-interactions with `@media (hover: hover)` guards.
- [ ] **Step 3.3**: Refine featured project and blog card hover elevations.
- [ ] **Step 3.4**: Smooth GitHub Activity tooltip animations on [GitHubTiles.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/components/public/GitHubTiles.tsx).

### Phase 4: Inner Public Pages (Showcases, Timelines, Contact)
- [x] **Step 4.1**: Enhance [ProjectsPage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/ProjectsPage.tsx) and [BlogsPage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/BlogsPage.tsx) card grids with responsive hover elevations.
- [x] **Step 4.2**: Add viewport scroll reveal (`whileInView`) to timeline nodes on [ExperiencePage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/ExperiencePage.tsx) and [EducationPage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/EducationPage.tsx).
- [x] **Step 4.3**: Add tactile card hover to [CertificationsPage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/CertificationsPage.tsx).
- [x] **Step 4.4**: Refine input focus and submission feedback transitions on [ContactPage.tsx](file:///home/orven/Documents/orvencasido-final-cv-website/src/pages/public/ContactPage.tsx).

### Phase 5: Verification & Accessibility Testing
- [ ] **Step 5.1**: Validate `prefers-reduced-motion` simulation in browser dev tools.
- [ ] **Step 5.2**: Test on mobile viewports (320px–480px) to verify zero horizontal overflow and no sticky hover artifacts.
- [ ] **Step 5.3**: Run `npm run lint` (`tsc --noEmit`) to verify 0 TypeScript compiler errors.
- [ ] **Step 5.4**: Run `npm run build` to verify clean production bundle stability.

---

## 6. Acceptance Criteria
1. **Performance**: Only `transform` and `opacity` animated; zero layout thrashing or dropped frames.
2. **Timing**: All UI durations $\le 300$ms; no slow or sluggish `ease-in` curves.
3. **Aesthetic**: Harmonious with Matcha & Beige design tokens; understated, tactile, and professional.
4. **Accessibility**: 100% compliant with `prefers-reduced-motion: reduce`.
5. **Quality**: Zero TypeScript errors (`npm run lint`), passing production build (`npm run build`).
