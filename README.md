# FB-c_labV2

A comprehensive AI consulting platform with interactive chat, voice capabilities, and educational content generation.

## Design System

This project uses a comprehensive design system with canonical design tokens. All components must use these tokens instead of hard-coded values.

### Key Files
- `DESIGN.md` - Complete design system documentation
- `app/globals.css` - CSS custom properties and design tokens
- `tailwind.config.ts` - Tailwind configuration with design tokens

### Design Tokens
- **Colors**: HSL-based semantic color system
- **Typography**: Consistent font families and sizes
- **Spacing**: Tailwind spacing scale
- **Border Radius**: Consistent border radius values
- **Shadows**: Standardized shadow system

### Linting Rules
The project enforces design token usage through:

- **ESLint**: Prevents hard-coded hex colors and arbitrary values
- **Stylelint**: Enforces HSL colors and design token usage in CSS

### Available Scripts
```bash
# Run all linting
pnpm lint:all

# Run ESLint only
pnpm lint

# Run Stylelint only
pnpm lint:style
```

## Features

- **AI Chat Interface**: Interactive chat with multiple AI models
- **Voice Integration**: Real-time voice input and output
- **Video Analysis**: Upload and analyze video content
- **Educational Content**: Generate interactive learning experiences
- **Lead Management**: Capture and manage potential clients
- **Admin Dashboard**: Analytics and performance monitoring
- **Meeting Scheduler**: Automated meeting booking system

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI, Shadcn UI
- **AI**: Google Gemini, OpenAI GPT
- **Database**: Supabase
- **Email**: Resend
- **Charts**: Recharts
- **Real-time**: WebSockets

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
pnpm dev
```

4. Run linting to ensure design token compliance:
```bash
pnpm lint:all
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── chat/              # Chat interface
│   └── globals.css        # Global styles and design tokens
├── components/            # React components
│   ├── admin/            # Admin dashboard components
│   ├── chat/             # Chat interface components
│   └── ui/               # Reusable UI components
├── lib/                  # Utility functions and services
├── hooks/                # Custom React hooks
├── DESIGN.md             # Design system documentation
├── tailwind.config.ts    # Tailwind configuration
└── package.json          # Dependencies and scripts
```

## Design Token Usage

### Colors
```tsx
// ✅ Correct - Using design tokens
<div className="bg-primary text-primary-foreground">
<div className="bg-accent text-accent-foreground">
<div className="border border-border">

// ❌ Incorrect - Hard-coded values
<div className="bg-[#ff0000]">
<div style={{ color: '#333' }}>
```

### Spacing
```tsx
// ✅ Correct - Using Tailwind spacing scale
<div className="p-4 m-2">
<div className="w-full h-64">

// ❌ Incorrect - Arbitrary values
<div className="p-[16px]">
<div className="w-[100%]">
```

### Typography
```tsx
// ✅ Correct - Using design tokens
<h1 className="text-2xl font-bold">
<p className="text-muted-foreground">

// ❌ Incorrect - Hard-coded values
<h1 className="text-[24px]">
<p style={{ fontSize: '14px' }}>
```

## Contributing

1. Follow the design system guidelines in `DESIGN.md`
2. Use design tokens instead of hard-coded values
3. Run linting before committing: `pnpm lint:all`
4. Ensure components work in both light and dark modes
5. Test accessibility and keyboard navigation

## License

MIT License
