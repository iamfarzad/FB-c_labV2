/**
 * UI Component Audit
 *
 * This file contains a comprehensive audit of UI components
 * with issues and recommendations.
 */

export const componentAudit = [
  {
    component: "ChatLayout",
    issues: ["Inconsistent height calculation between mobile and desktop", "Missing proper error boundary"],
    recommendations: [
      "Standardize height calculation using CSS custom properties",
      "Add error boundary with fallback UI",
    ],
  },
  {
    component: "ChatHeader",
    issues: ["Inconsistent vertical alignment of elements", "Mobile title truncation handling"],
    recommendations: ["Use consistent flex alignment", "Add proper text truncation with tooltip"],
  },
  {
    component: "ChatMain",
    issues: [
      "No virtualization for message list",
      "Message timestamps not screen reader accessible",
      "Image loading states missing",
    ],
    recommendations: [
      "Implement react-window for message virtualization",
      "Add sr-only text for timestamps",
      "Add image loading skeleton states",
    ],
  },
  {
    component: "ChatFooter",
    issues: [
      "Small touch targets on mobile",
      "Upload menu closes immediately on some devices",
      "Icon-only buttons missing aria-labels",
    ],
    recommendations: [
      "Increase button size to minimum 44x44px",
      "Fix click outside handler",
      "Add descriptive aria-labels",
    ],
  },
  {
    component: "DesktopSidebar",
    issues: ["Animation causes layout shift", "Toggle button position calculation issues"],
    recommendations: [
      "Use transform instead of width for animation",
      "Use fixed positioning with CSS variables for toggle",
    ],
  },
  {
    component: "MobileSidebarSheet",
    issues: ["Focus trap not implemented correctly", "Gesture handling inconsistent"],
    recommendations: ["Implement focus-trap-react", "Standardize gesture handling with Framer Motion"],
  },
  {
    component: "VoiceInputModal",
    issues: ["Resource cleanup issues", "No visual feedback during silence", "Missing live region for transcription"],
    recommendations: [
      "Ensure MediaRecorder cleanup in useEffect",
      "Add idle state animation",
      "Implement aria-live region",
    ],
  },
  {
    component: "WebcamModal",
    issues: [
      "Video stream not disposed properly",
      "Permission denied state lacks recovery action",
      "Capture button too small on mobile",
    ],
    recommendations: [
      "Add comprehensive track.stop() in cleanup",
      "Add browser settings link for permissions",
      "Increase button size on mobile",
    ],
  },
  {
    component: "ScreenShareModal",
    issues: [
      "Browser compatibility issues",
      "No confirmation before ending share",
      "Screen selection UI breaks on some browsers",
    ],
    recommendations: [
      "Add browser-specific handling",
      "Add confirmation dialog",
      "Implement fallback UI for problematic browsers",
    ],
  },
  {
    component: "Video2AppModal",
    issues: [
      "Form validation errors not associated with fields",
      "Complex form overwhelming on mobile",
      "Loading states not clearly indicated",
    ],
    recommendations: [
      "Implement proper error message association",
      "Create step-by-step form for mobile",
      "Add clear loading indicators",
    ],
  },
]

// Component consistency issues
export const consistencyIssues = [
  {
    issue: "Inconsistent modal implementations",
    affected: ["VoiceInputModal", "WebcamModal", "ScreenShareModal", "Video2AppModal"],
    recommendation: "Create standardized modal component system",
  },
  {
    issue: "Inconsistent button sizes",
    affected: ["ChatFooter", "WebcamModal", "VoiceInputModal"],
    recommendation: "Standardize button sizing system",
  },
  {
    issue: "Inconsistent loading indicators",
    affected: ["ChatMain", "Video2AppModal", "ActivityTimeline"],
    recommendation: "Create unified loading component system",
  },
  {
    issue: "Inconsistent error handling",
    affected: ["WebcamModal", "ScreenShareModal", "ChatFooter"],
    recommendation: "Implement consistent error handling pattern",
  },
]

// Component best practices
export const componentBestPractices = [
  "Use React.memo for expensive components",
  "Extract complex logic to custom hooks",
  "Implement proper cleanup in useEffect",
  "Use proper semantic HTML elements",
  "Add comprehensive prop types/TypeScript interfaces",
  "Implement proper keyboard navigation",
  "Add appropriate ARIA attributes",
  "Use consistent naming conventions",
  "Implement proper loading and error states",
  "Add comprehensive test coverage",
]
