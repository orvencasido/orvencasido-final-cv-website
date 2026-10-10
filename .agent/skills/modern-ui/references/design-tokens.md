# Visual Tokens & Design System: Matcha & Warm Beige

## Aesthetic Philosophy
Japanese Minimalist Organic aesthetic featuring a warm earthy palette centered on Matcha Greens and Warm Beige/Washi tones. Clean, deliberate, high-contrast readability without cold greys or generic dark modes.

---

## 1. Typography
- **Primary Font Family**: `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Headings**: `font-bold` to `font-extrabold`, `tracking-tight`, `text-matcha-950`
- **Body**: `font-normal` to `font-medium`, `text-matcha-900` / `text-matcha-800`
- **Muted / Subtitles**: `text-matcha-600` / `text-matcha-700`

---

## 2. Color Palette Hex Reference

### Warm Beige Palette (Surfaces & Backgrounds)
- **`--color-beige-50` (`#FAF8F5`)**: Lightest highlight surface, elevated card background, input field background.
- **`--color-beige-100` (`#F5F2EB`)**: Default page body background (`body`), base canvas.
- **`--color-beige-200` (`#EAE4D8`)**: Primary borders, dividers, subtle hover surface.
- **`--color-beige-300` (`#DDD4C3`)**: Secondary borders, emphasized dividers.
- **`--color-beige-400` (`#C7B9A2`)**: Darkest beige tone, subtle contrast borders.

### Matcha Green Palette (Text, Branding & Accents)
- **`--color-matcha-50` (`#F3F7F4`)**: Softest matcha tint, delicate badge backgrounds.
- **`--color-matcha-100` (`#E3EDE6`)**: Light pill/tag background, subtle button backgrounds.
- **`--color-matcha-200` (`#C6DBCF`)**: Text selection highlight (`::selection`), scrollbar thumb, badge borders.
- **`--color-matcha-300` (`#9EC0AD`)**: Scrollbar hover state, secondary accents.
- **`--color-matcha-400` (`#6D9D82`)**: Decorative borders, icons, tertiary status indicators.
- **`--color-matcha-500` (`#4B7E63`)**: Primary green accent, link highlights, active icon tints.
- **`--color-matcha-600` (`#39644D`)**: Interactive buttons hover state, secondary text in high contrast.
- **`--color-matcha-700` (`#2C4E3C`)**: Mid-tone text, strong secondary emphasis.
- **`--color-matcha-800` (`#203B2D`)**: Subheadings, active navigation states, strong body text.
- **`--color-matcha-900` (`#162B20`)**: Primary body copy color (`body`), dark solid CTA backgrounds.
- **`--color-matcha-950` (`#0C1A13`)**: Primary headings (`h1`, `h2`), branding logos, high-contrast titles.

---

## 3. Component Design Tokens

### Surfaces & Containers
- **Page Background**: `bg-beige-100`
- **Sticky Header / Navbar**: `bg-beige-100/90 backdrop-blur-md border-b border-beige-200`
- **Card / Panel**: `bg-beige-50 border border-beige-200 rounded-2xl` (or `bg-white/80`)
- **Card Hover**: `hover:border-matcha-300 hover:shadow-sm transition-all`
- **Form Inputs**: `bg-beige-50 border border-beige-200 text-matcha-900 focus:border-matcha-500 focus:ring-1 focus:ring-matcha-500`

### Buttons & Interactive Elements
- **Primary CTA**: `bg-matcha-900 text-beige-50 hover:bg-matcha-950 transition-colors`
- **Secondary Button**: `bg-beige-200 text-matcha-900 hover:bg-beige-300 border border-beige-300 transition-colors`
- **Accent Button**: `bg-matcha-600 text-white hover:bg-matcha-700 transition-colors`
- **Ghost / Icon Button**: `text-matcha-700 hover:text-matcha-950 hover:bg-beige-200/60 rounded-lg p-2`

### Badges, Tags & Chips
- **Category / Skill Badge**: `bg-matcha-100 text-matcha-800 border border-matcha-200 rounded-full text-xs font-medium`
- **Secondary Tag**: `bg-beige-200 text-matcha-800 border border-beige-300 rounded-full text-xs`

### Skeletons & Texture
- **Skeleton Base**: `bg-beige-200/80` or `bg-matcha-100/50`
- **Shimmer Wave**: `.animate-shimmer` with subtle white highlight overlay
