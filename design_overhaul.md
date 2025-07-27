# Design Overhaul Specification

## Overview
This document outlines the comprehensive design overhaul for the F.B/c AI chat interface, migrating from modal-based interactions to inline tool cards while enforcing a unified design system.

## 1. Brand Palette & Design Tokens

### Color System
- **Primary Accent**: `--color-orange-accent` (#ff5b04) - Buttons, highlights, focus states
- **Accent Hover**: `--color-orange-accent-hover` (#e65200) - Button hover states
- **Background**: `--background` - Main app background
- **Foreground**: `--foreground` - Primary text color
- **Card Background**: `--card` - Tool cards, modals, elevated surfaces
- **Muted**: `--muted` - Secondary text, borders, inactive states
- **Border**: `--border` - Subtle borders and dividers
- **Destructive**: `--destructive` - Error states, delete actions

### Typography
- **Primary Font**: `--font-sans` (Inter) - Body text, UI elements
- **Display Font**: `--font-display` (Inter) - Headings, titles
- **Font Sizes**: Use Tailwind's text scale (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`)

### Spacing Scale
- **Container Padding**: `p-6` for tool cards
- **Vertical Rhythm**: `space-y-4` for consistent spacing
- **Margins**: Use Tailwind spacing scale (`m-2`, `m-4`, `m-6`)
- **Gaps**: `gap-4` for flex layouts

### Border Radius
- **Minimal**: `rounded-md` (6px) - Buttons, inputs
- **Medium**: `rounded-lg` (8px) - Cards, modals
- **Large**: `rounded-xl` (12px) - Large containers

### Shadows
- **Minimal**: `shadow-md` - Cards, tool wrappers
- **Elevated**: `shadow-lg` - Modals, dropdowns
- **Focus**: `ring-2 ring-accent` - Focus states

## 2. Component Classes

### Button Classes
```css
.btn-primary: bg-accent text-accent-foreground hover:bg-accent/90
.btn-secondary: bg-secondary text-secondary-foreground hover:bg-secondary/80
.btn-minimal: bg-transparent border border-border hover:bg-accent/10
```

### Card Classes
```css
.card-minimal: bg-card border border-border rounded-lg shadow-md p-6
.card-glass: bg-glass-bg border border-glass-border backdrop-blur-sm
```

### Chat Bubble Classes
```css
.chat-bubble-user: bg-accent text-accent-foreground rounded-lg p-4
.chat-bubble-assistant: bg-card border border-border rounded-lg p-4
```

### Input Classes
```css
.input-minimal: bg-background border border-border rounded-md px-3 py-2
```

## 3. Layout Structure

### Unified Chat Layout
```
<ChatLayout>
  <div className="flex h-full bg-background text-foreground overflow-hidden">
    <Sidebar /> {/* Left sidebar with activity log */}
    <div className="flex flex-col flex-1 min-h-0">
      <ChatHeader /> {/* Top header with navigation */}
      <ChatArea /> {/* Main chat content area */}
      <ToolCardWrapper /> {/* Inline tool cards */}
      <ChatInputBar /> {/* Bottom input bar */}
    </div>
  </div>
</ChatLayout>
```

### Tool Card Wrapper
```tsx
<ToolCardWrapper>
  <div className="card-minimal space-y-4">
    {/* Tool-specific content */}
  </div>
</ToolCardWrapper>
```

## 4. Migration Plan

### Phase 1: Foundation
1. Update `globals.css` with all design tokens
2. Create `ToolCardWrapper` component
3. Update `ChatPage` to use unified layout

### Phase 2: Modal Migration
1. **VoiceInputCard** - Replace `VoiceInputModal`
2. **WebcamCaptureCard** - Replace `WebcamModal`
3. **ROICalculatorCard** - Replace `ROICalculatorModal`
4. **VideoToAppCard** - Replace `Video2AppModal`
5. **ScreenShareCard** - Replace `ScreenShareModal`

### Phase 3: Chat Integration
1. Update `ChatArea` to render tool cards inline
2. Implement message type detection (`toolType` flag)
3. Standardize chat bubble styling

### Phase 4: UI Polish
1. Remove system activity logs from public UI
2. Standardize dropdown and tool triggers
3. Implement accessibility improvements
4. Test responsive behavior

## 5. Tool Card Specifications

### VoiceInputCard
- Live transcript display
- Start/stop recording button
- Confirm/cancel actions
- ARIA labels for accessibility

### WebcamCaptureCard
- Live camera feed
- Capture button
- Image preview
- Confirm/retry actions

### ROICalculatorCard
- Step-by-step wizard interface
- Input collection
- Result display as chat bubble

### VideoToAppCard
- YouTube URL input
- Progress spinner
- Generated content preview
- Action buttons

### ScreenShareCard
- Screen capture interface
- Live capture status
- Analysis results inline

## 6. Accessibility Requirements

### Focus Management
- All interactive elements must have visible focus states
- Use `outline-accent` for focus rings
- Implement proper tab order

### ARIA Labels
- Add `aria-label` to all icon buttons
- Use semantic HTML elements
- Provide screen reader support

### Keyboard Navigation
- Support for arrow keys in tool cards
- Escape key to cancel/close
- Enter key to confirm actions

## 7. Responsive Design

### Mobile (<768px)
- Sidebar hidden by default
- Full-width tool cards
- Touch-friendly button sizes (44px minimum)

### Tablet (768px - 1024px)
- Collapsible sidebar
- Adaptive tool card layouts
- Optimized touch targets

### Desktop (>1024px)
- Persistent sidebar
- Multi-column tool layouts
- Hover states and animations

## 8. Implementation Checklist

- [ ] Update design tokens in `globals.css`
- [ ] Create `ToolCardWrapper` component
- [ ] Migrate `ChatPage` to unified layout
- [ ] Implement each tool card component
- [ ] Update `ChatArea` rendering logic
- [ ] Remove system activity logs from public UI
- [ ] Standardize dropdown and tool triggers
- [ ] Implement accessibility improvements
- [ ] Test responsive behavior
- [ ] Run style lint and visual regression tests
- [ ] QA functional flows end-to-end

## 9. References

- [DESIGN.md](DESIGN.md) - Design token source
- [frontend_design.md](frontend_design.md) - Frontend design system
- [backend_architecture.md](backend_architecture.md) - Backend architecture rules
- [CHANGELOG.md](CHANGELOG.md) - Change tracking 