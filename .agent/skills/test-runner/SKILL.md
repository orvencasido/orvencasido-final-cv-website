---
name: test-runner
description: Runs project verification, type checks, and build validations.
---

# Verification Protocol
1. Execute `npm run lint` (`tsc --noEmit`).
2. Execute `npm run build` (`node seo/generate-sitemap.mjs && vite build`).
3. If failures occur:
   - Identify whether failure is a TypeScript type mismatch, missing property in `src/types/index.ts`, or build bundle error.
   - Fix underlying code—do not bypass type checks with `any` or `@ts-ignore`.
