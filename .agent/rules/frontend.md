# Scoped Rules: Frontend (src/)
- Use strict TypeScript; avoid `any`.
- Keep Supabase queries and local storage routines isolated in service functions (`src/lib/services.ts`) and hooks—never call `supabase` directly inside view components.
- Adhere strictly to the design system in `.agent/skills/modern-ui/references/design-tokens.md`:
  - Palette: `--color-matcha-*` and `--color-beige-*`.
  - Typography: `Plus Jakarta Sans` font family.
- Follow Content Discipline:
  - Eliminate filler copy, obvious explanatory subtitles, and mono-caps kicker tags.
  - Buttons and toggles must clearly communicate state without redundant text rows (e.g. avoid separate "Status: Visible" labels under switches).
  - All public and admin views must have responsive layout, accessible contrast, and clean whitespace.
