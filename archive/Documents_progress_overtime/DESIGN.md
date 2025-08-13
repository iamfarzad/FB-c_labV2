# DESIGN.md

## F.B/c AI – Design System & Style Guide

This document defines the canonical design system for the F.B/c AI project. All UI work must follow these rules. Any changes to design tokens or style rules require approval from the UI owner.

---



All color variables must be defined in `globals.css` and referenced via Tailwind config or CSS custom properties. No hard-coded hex values in components.
## 1. Brand Color Palette

  | Token                  | Value         | Usage                        |
  |------------------------|--------------|------------------------------|
  | --color-orange-accent  | #ff5b04      | Primary accent, buttons      |
  | --color-orange-accent-hover | #e65200 | Button hover, highlights     |
  | --color-gunmetal       | #1a1a1a      | Main dark bg, text           |
  | --color-gunmetal-lighter | #2a2a2a    | Card bg, dark surfaces       |
  | --color-light-silver   | #f5f5f5      | Main light bg, text          |
  | --color-light-silver-darker | #e0e0e0 | Borders, muted bg            |
  ---

## 2. Font Stack

- **Primary font:** Inter, fallback to system sans-serif
- **Font variable:** `--font-sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif;`
- **Headings:** Use `font-display` if defined, else fallback to `--font-sans`

All font families must be referenced via CSS variables and Tailwind config. No inline font-family in components.

---

## 3. Spacing & Border Radius

- **Spacing:** Use Tailwind spacing scale (`p-4`, `m-2`, etc.)
- **Border radius:**
  - Minimal: 4px (`--border-radius-minimal`)
  - Medium: 8px (`--border-radius-medium`)
  - Use Tailwind’s `rounded` classes mapped to these tokens

---

## 4. Shadows & Effects

- **Minimal shadow:** `0 2px 8px rgba(0,0,0,0.1)`
- **Elevated shadow:** `0 4px 16px rgba(0,0,0,0.15)`
- **Glassmorphism:** Use `var(--glass-bg)` and `var(--glass-border)` for backgrounds and borders

---

## 5. Component Style Rules

- **Buttons:**
  - Use `.btn-primary` and `.btn-secondary` classes
  - Reference accent and surface tokens for bg/text
- **Cards:**
  - Use `.card-minimal` or `.card-glass` classes
  - Reference surface and accent tokens
- **Chat Bubbles:**
  - Use `.chat-bubble-user` and `.chat-bubble-assistant` classes
  - Reference accent and surface tokens
- **Inputs:**
  - Use `.input-minimal` class
  - Reference glass and border tokens

---

## 6. Responsive & Accessibility

- All layouts must be mobile-first and use Tailwind’s responsive classes
- All interactive elements must have focus states using accent color
- Use semantic HTML and ARIA attributes as needed

---

## 7. Prohibited Practices

- No inline styles for color, font, or spacing
- No hard-coded hex/rgb values in components
- No arbitrary values in Tailwind classes (e.g., `text-[#ff5b04]`)
- No direct font-family in component files

---

## 8. Design Token Source

All design tokens are defined in `globals.css` and referenced in `tailwind.config.ts`.

---

## 9. Change Policy

- Any change to design tokens or this guide requires UI owner approval
- All PRs must pass style lint and visual regression tests

---

## 10. References

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com/)
- [Figma Brand File](#) (add link if available)

---

**Link this file in your README.md for all contributors.**
