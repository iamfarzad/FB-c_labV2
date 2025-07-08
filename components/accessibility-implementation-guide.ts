"use client"

/**
 * Accessibility Implementation Guide
 *
 * This file contains practical guidance for implementing
 * accessibility improvements across the application.
 */

export const accessibilityImplementationGuide = {
  keyboardNavigation: {
    description: "Ensure all interactive elements are keyboard accessible",
    implementation: [
      "Ensure all interactive elements can receive focus",
      "Use tabIndex='0' only when necessary",
      "Implement logical tab order",
      "Add visible focus styles",
      "Implement keyboard shortcuts with documentation",
    ],
    examples: {
      focusStyles: `
        .focus-visible:focus {
          outline: 2px solid var(--color-focus);
          outline-offset: 2px;
        }
      `,
      keyboardShortcuts: `
        useEffect(() => {
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              inputRef.current?.focus();
            }
          };
          
          window.addEventListener('keydown', handleKeyDown);
          return () => window.removeEventListener('keydown', handleKeyDown);
        }, []);
      `,
    },
  },

  screenReaderSupport: {
    description: "Ensure content is accessible to screen readers",
    implementation: [
      "Add descriptive alt text to images",
      "Use aria-label for icon-only buttons",
      "Implement aria-live regions for dynamic content",
      "Use sr-only text for visual information",
      "Ensure proper heading hierarchy",
    ],
    examples: {
      srOnly: `
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
      `,
      ariaLive: `
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {newMessageText}
        </div>
      `,
    },
  },

  focusManagement: {
    description: "Manage focus for interactive components",
    implementation: [
      "Trap focus in modals",
      "Return focus after modal close",
      "Skip to content links",
      "Manage focus after dynamic content changes",
    ],
    examples: {
      focusTrap: `
        import { useFocusTrap } from '@/hooks/use-focus-trap';
        
        function Modal() {
          const focusTrapRef = useFocusTrap();
          
          return (
            <div ref={focusTrapRef}>
              {/* Modal content */}
            </div>
          );
        }
      `,
      returnFocus: `
        function Modal({ onClose }) {
          const previousFocus = useRef(null);
          
          useEffect(() => {
            previousFocus.current = document.activeElement;
            
            return () => {
              previousFocus.current?.focus();
            };
          }, []);
          
          // Modal content
        }
      `,
    },
  },

  semanticHTML: {
    description: "Use semantic HTML elements",
    implementation: [
      "Use proper heading levels (h1-h6)",
      "Use nav for navigation",
      "Use main for main content",
      "Use button for interactive elements",
      "Use appropriate list elements",
    ],
    examples: {
      properStructure: `
        <header>
          <nav>
            {/* Navigation items */}
          </nav>
        </header>
        <main>
          <h1>Page Title</h1>
          <section aria-labelledby="section-heading">
            <h2 id="section-heading">Section Title</h2>
            {/* Section content */}
          </section>
        </main>
        <footer>
          {/* Footer content */}
        </footer>
      `,
    },
  },

  ariaAttributes: {
    description: "Use ARIA attributes appropriately",
    implementation: [
      "Use aria-label for unlabeled elements",
      "Use aria-labelledby to reference visible labels",
      "Use aria-describedby for additional descriptions",
      "Use aria-expanded for expandable elements",
      "Use aria-controls to associate controls with their targets",
    ],
    examples: {
      ariaUsage: `
        <button 
          aria-expanded={isOpen} 
          aria-controls="dropdown-menu"
          aria-label="Toggle menu"
        >
          <MenuIcon />
        </button>
        <div id="dropdown-menu" hidden={!isOpen}>
          {/* Menu items */}
        </div>
      `,
    },
  },

  reducedMotion: {
    description: "Respect user motion preferences",
    implementation: [
      "Use prefers-reduced-motion media query",
      "Provide alternatives to motion-based interactions",
      "Reduce or eliminate animations for users who prefer reduced motion",
    ],
    examples: {
      prefersReducedMotion: `
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `,
      reactImplementation: `
        const prefersReducedMotion = 
          typeof window !== 'undefined' 
            ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
            : false;
            
        const animationSettings = prefersReducedMotion 
          ? { duration: 0 } 
          : { duration: 0.3 };
      `,
    },
  },
}

// Priority accessibility fixes
export const priorityAccessibilityFixes = [
  {
    component: "ChatFooter",
    issue: "Icon-only buttons missing aria-labels",
    fix: "Add aria-label to all icon-only buttons",
    example: `<Button aria-label="Send message"><SendIcon /></Button>`,
  },
  {
    component: "VoiceInputModal",
    issue: "Missing live region for transcription",
    fix: "Add aria-live region for real-time updates",
    example: `<div aria-live="polite" aria-atomic="true">{transcript}</div>`,
  },
  {
    component: "ChatMain",
    issue: "Message timestamps not accessible",
    fix: "Add sr-only text with formatted date/time",
    example: `
      <span className="sr-only">
        Message sent at {message.timestamp.toLocaleString()}
      </span>
    `,
  },
  {
    component: "WebcamModal",
    issue: "No announcement of capture success",
    fix: "Add aria-live region for capture status",
    example: `
      <div aria-live="assertive" aria-atomic="true" className="sr-only">
        {isCaptured ? 'Image captured successfully' : ''}
      </div>
    `,
  },
  {
    component: "ScreenShareModal",
    issue: "Screen selection not keyboard accessible",
    fix: "Make screen options keyboard navigable",
    example: `
      <button 
        onClick={() => selectScreen(screen)}
        onKeyDown={(e) => e.key === 'Enter' && selectScreen(screen)}
        tabIndex={0}
        aria-label="Select ${screen.label}"
      >
        <img src={screen.thumbnail || "/placeholder.svg"} alt="Preview of ${screen.label}" />
      </button>
    `,
  },
]
