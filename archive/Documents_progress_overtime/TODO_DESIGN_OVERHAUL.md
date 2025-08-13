# Design Overhaul TODO List

## 🎯 **CRITICAL: Follow Design Specifications Exactly**

### **Phase 1: CSS Token Updates**
- [x] **Update globals.css** - Fix design token definitions to match spec
  - [x] Fix `.card-minimal` class (should use `--color-light-silver` and `--color-light-silver-darker`)
  - [x] Fix `.chat-bubble-user` class (should use `bg-accent text-light-silver`)
  - [x] Fix `.chat-bubble-assistant` class (should use `bg-popover text-foreground`)
  - [x] Fix `.btn-primary` class (should use `bg-accent hover:bg-accent/90`)
  - [x] Fix `.btn-secondary` class (should use `bg-secondary hover:bg-secondary/80`)
  - [x] Fix `.input-minimal` class (should use `bg-card border border-muted`)

### **Phase 2: Component Structure Overhaul**
- [x] **ToolCardWrapper.tsx** - Replace with exact spec implementation
  - [x] Remove Card component usage
  - [x] Use direct div with `card-minimal p-6 space-y-4 rounded-md shadow-sm bg-card text-foreground`
  - [x] Remove motion components
  - [x] Follow spec exactly: `<div className="card-minimal p-6 space-y-4 rounded-md shadow-sm bg-card text-foreground">`

- [x] **ChatArea.tsx** - Fix chat bubble implementation
  - [x] Replace Card components with direct divs
  - [x] Use exact chat bubble classes from spec
  - [x] User: `chat-bubble-user bg-accent text-light-silver self-end`
  - [x] Assistant: `chat-bubble-assistant bg-popover text-foreground self-start`
  - [x] Add required classes: `px-4 py-2 rounded-lg max-w-[75%] break-words`

- [x] **ChatFooter.tsx** - Implement exact input bar spec
  - [x] Replace motion components with standard HTML
  - [x] Use exact container: `bg-card border-t border-muted p-4 flex items-center space-x-3`
  - [x] Use exact textarea: `input-minimal flex-1 resize-none h-12`
  - [x] Use exact buttons: `btn-primary` and `btn-secondary`

### **Phase 3: Tool Card Components**
- [ ] **VoiceInputCard.tsx** - Update to use ToolCardWrapper correctly
- [ ] **WebcamCaptureCard.tsx** - Update to use ToolCardWrapper correctly  
- [ ] **ROICalculatorCard.tsx** - Update to use ToolCardWrapper correctly
- [ ] **VideoToAppCard.tsx** - Update to use ToolCardWrapper correctly
- [ ] **ScreenShareCard.tsx** - Update to use ToolCardWrapper correctly

### **Phase 4: Button & Input Components**
- [ ] **All buttons** - Use exact spec classes
  - [ ] Primary: `btn-primary px-4 py-2 rounded shadow-md focus:outline-none focus:ring-2 focus:ring-accent-hover`
  - [ ] Secondary: `btn-secondary` with proper hover states
  - [ ] Remove motion components

- [ ] **All inputs** - Use exact spec classes
  - [ ] Input: `input-minimal w-full px-3 py-2 rounded border border-muted focus:border-accent focus:ring-0`
  - [ ] Textarea: `input-minimal flex-1 resize-none h-12`

### **Phase 5: Typography & Icons**
- [ ] **Typography** - Use exact font classes
  - [ ] Headings: `text-2xl font-display` and `text-xl font-display`
  - [ ] Body: `text-base font-sans`
  - [ ] Small: `text-sm font-sans`

- [ ] **Icons** - Use exact spec
  - [ ] Active: `w-5 h-5 text-accent`
  - [ ] Disabled: `text-muted`
  - [ ] Use Lucide React only

### **Phase 6: Responsive Design**
- [ ] **Mobile responsiveness** - Use exact breakpoints
  - [ ] Use `sm:`, `md:`, `lg:` prefixes only
  - [ ] No custom breakpoints
  - [ ] Sidebar collapsed on mobile

### **Phase 7: Validation & Testing**
- [ ] **Remove all violations**
  - [ ] No hard-coded hex values
  - [ ] No inline styles
  - [ ] No arbitrary Tailwind classes
  - [ ] No motion components where not specified

- [ ] **Test all components**
  - [ ] Verify design token usage
  - [ ] Check responsive behavior
  - [ ] Validate accessibility
  - [ ] Test all interactive states

### **Phase 8: Documentation**
- [ ] **Update CHANGELOG.md** - Document all changes
- [ ] **Verify rule compliance** - Ensure all backend architecture rules followed
- [ ] **Test deployment** - Ensure app still works after changes

---

## 🚨 **CRITICAL RULES TO FOLLOW:**

1. **NO DEVIATIONS** from the design specification
2. **USE EXACT CLASSES** as specified in the requirements
3. **REMOVE MOTION COMPONENTS** unless explicitly required
4. **USE DESIGN TOKENS** instead of hard-coded values
5. **FOLLOW BACKEND ARCHITECTURE RULES** for all changes
6. **UPDATE CHANGELOG.md** for every change
7. **TEST AFTER EACH COMPONENT** to ensure no regressions

---

## 📋 **IMPLEMENTATION ORDER:**

1. CSS Token Updates (globals.css)
2. ToolCardWrapper (foundation component)
3. ChatArea (chat bubbles)
4. ChatFooter (input bar)
5. Tool Cards (individual components)
6. Buttons & Inputs (reusable components)
7. Typography & Icons
8. Responsive Design
9. Validation & Testing
10. Documentation

---

**Status**: Ready to begin implementation
**Priority**: High - Design system compliance required
**Estimated Time**: 2-3 hours for complete overhaul
