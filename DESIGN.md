# Design System

## Overview
This document defines the canonical design tokens and guidelines for the FB-c_labV2 project. All components must use these tokens instead of hard-coded values.

## Color System

### Primary Colors
- **Orange Accent**: `hsl(22 100% 51%)` - Primary brand color
- **Orange Accent Hover**: `hsl(22 100% 45%)` - Hover state for orange accent
- **Gunmetal**: `hsl(0 0% 10%)` - Primary dark color
- **Light Silver**: `hsl(0 0% 96%)` - Primary light color

### Semantic Colors
- **Background**: `hsl(var(--background))` - Main background
- **Foreground**: `hsl(var(--foreground))` - Main text color
- **Primary**: `hsl(var(--primary))` - Primary interactive elements
- **Secondary**: `hsl(var(--secondary))` - Secondary interactive elements
- **Accent**: `hsl(var(--accent))` - Accent color for highlights
- **Muted**: `hsl(var(--muted))` - Muted backgrounds and borders
- **Border**: `hsl(var(--border))` - Border colors
- **Card**: `hsl(var(--card))` - Card backgrounds
- **Popover**: `hsl(var(--popover))` - Popover backgrounds

### Chart Colors
- **Chart Primary**: `hsl(22 100% 51%)` (orange-accent)
- **Chart Secondary**: `hsl(0 0% 60%)` (muted-foreground)
- **Chart Success**: `hsl(142 76% 36%)` (green-600)
- **Chart Warning**: `hsl(38 92% 50%)` (yellow-500)
- **Chart Error**: `hsl(0 84% 60%)` (red-500)

## Typography

### Font Families
- **Sans**: `var(--font-sans)` - Primary font (Inter)
- **Display**: `var(--font-display)` - Headings
- **Mono**: `var(--font-mono)` - Code and monospace text

### Font Sizes
- **xs**: `0.75rem` (12px)
- **sm**: `0.875rem` (14px)
- **base**: `1rem` (16px)
- **lg**: `1.125rem` (18px)
- **xl**: `1.25rem` (20px)
- **2xl**: `1.5rem` (24px)
- **3xl**: `1.875rem` (30px)
- **4xl**: `2.25rem` (36px)

## Spacing

### Base Spacing
- **0**: `0px`
- **1**: `0.25rem` (4px)
- **2**: `0.5rem` (8px)
- **3**: `0.75rem` (12px)
- **4**: `1rem` (16px)
- **5**: `1.25rem` (20px)
- **6**: `1.5rem` (24px)
- **8**: `2rem` (32px)
- **10**: `2.5rem` (40px)
- **12**: `3rem` (48px)
- **16**: `4rem` (64px)
- **20**: `5rem` (80px)
- **24**: `6rem` (96px)

### Component Spacing
- **Button Padding**: `px-4 py-2`
- **Input Padding**: `px-3 py-2`
- **Card Padding**: `p-6`
- **Modal Padding**: `p-6`
- **Section Padding**: `py-12 px-4`

## Border Radius

- **sm**: `calc(var(--radius) - 4px)` (4px)
- **md**: `calc(var(--radius) - 2px)` (6px)
- **lg**: `var(--radius)` (12px)
- **xl**: `calc(var(--radius) + 4px)` (16px)

## Shadows

- **sm**: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
- **md**: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
- **lg**: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`
- **xl**: `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`

## Breakpoints

- **mobile**: `max-width: 767px`
- **tablet**: `min-width: 768px and max-width: 1023px`
- **desktop**: `min-width: 1024px`

## Component Guidelines

### Buttons
- Use `btn-minimal` utility class for minimal buttons
- Primary buttons: `bg-primary text-primary-foreground`
- Secondary buttons: `bg-secondary text-secondary-foreground`
- Accent buttons: `bg-accent text-accent-foreground`

### Cards
- Background: `bg-card`
- Border: `border border-border`
- Padding: `p-6`
- Radius: `rounded-lg`

### Forms
- Input background: `bg-background`
- Input border: `border border-input`
- Focus ring: `ring-2 ring-ring`

### Modals
- Background: `bg-background`
- Border: `border border-border`
- Shadow: `shadow-lg`
- Padding: `p-6`

## Accessibility

### Color Contrast
- Ensure minimum 4.5:1 contrast ratio for normal text
- Ensure minimum 3:1 contrast ratio for large text
- Use semantic colors for interactive elements

### Focus States
- Always provide visible focus indicators
- Use `ring-2 ring-ring` for focus states
- Ensure keyboard navigation works for all interactive elements

### Touch Targets
- Minimum 44px height for touch targets on mobile
- Use `btn-touch` utility class for mobile-optimized buttons

## Dark Mode

All colors automatically adapt to dark mode through CSS custom properties. The design system supports:
- Automatic color inversion
- Proper contrast ratios in both modes
- Consistent visual hierarchy

## Usage Rules

1. **Never use hard-coded colors** - Always use design tokens
2. **Never use hard-coded spacing** - Use Tailwind spacing scale
3. **Never use hard-coded font sizes** - Use Tailwind typography scale
4. **Use semantic color names** - Prefer `text-primary` over `text-black`
5. **Maintain consistency** - Use the same tokens across similar components
6. **Test in both themes** - Ensure components work in light and dark modes

## Linting Rules

The project includes ESLint and Stylelint rules to enforce:
- No hard-coded hex colors
- No hard-coded pixel values for spacing
- Required use of design tokens
- Consistent naming conventions