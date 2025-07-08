"use client"

/**
 * Responsive Design Implementation Guide
 *
 * This file contains practical guidance for implementing
 * responsive design improvements across the application.
 */

export const responsiveDesignImplementationGuide = {
  breakpointSystem: {
    description: "Standardized breakpoint system",
    implementation: [
      "Use Tailwind's breakpoint system consistently",
      "Create custom utility classes for common patterns",
      "Avoid hardcoded pixel values",
      "Use mobile-first approach",
    ],
    examples: {
      tailwindBreakpoints: `
        // Default Tailwind breakpoints
        'sm': '640px',   // Small screens, like phones in landscape
        'md': '768px',   // Medium screens, like tablets
        'lg': '1024px',  // Large screens, like laptops
        'xl': '1280px',  // Extra large screens, like desktops
        '2xl': '1536px', // 2X large screens, like large desktops
      `,
      customUtilities: `
        // Custom responsive utilities
        .mobile\\:hidden { @media (max-width: 767px) { display: none; } }
        .tablet\\:hidden { @media (min-width: 768px) and (max-width: 1023px) { display: none; } }
        .desktop\\:hidden { @media (min-width: 1024px) { display: none; } }
      `,
    },
  },

  fluidTypography: {
    description: "Typography that scales smoothly across screen sizes",
    implementation: [
      "Use relative units (rem, em) for font sizes",
      "Implement fluid typography with clamp()",
      "Set appropriate line heights for readability",
      "Ensure minimum font sizes for accessibility",
    ],
    examples: {
      fluidTypography: `
        // Fluid typography with clamp()
        h1 {
          font-size: clamp(1.5rem, 5vw, 2.5rem);
          line-height: 1.2;
        }
        
        p {
          font-size: clamp(1rem, 2vw, 1.125rem);
          line-height: 1.5;
        }
      `,
      tailwindImplementation: `
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
          Page Title
        </h1>
      `,
    },
  },

  layoutPatterns: {
    description: "Responsive layout patterns",
    implementation: [
      "Use CSS Grid for two-dimensional layouts",
      "Use Flexbox for one-dimensional layouts",
      "Implement stack-and-wrap patterns for mobile",
      "Use container queries for component-level responsiveness",
    ],
    examples: {
      responsiveGrid: `
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
      `,
      stackAndWrap: `
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/3">Sidebar</div>
          <div className="w-full md:w-2/3">Main Content</div>
        </div>
      `,
    },
  },

  touchTargets: {
    description: "Properly sized touch targets for mobile",
    implementation: [
      "Minimum 44x44px for touch targets",
      "Adequate spacing between interactive elements",
      "Larger hit areas for important actions",
      "Consider thumb zones on mobile devices",
    ],
    examples: {
      properTouchTargets: `
        // Button with adequate touch target size
        .touch-button {
          min-height: 44px;
          min-width: 44px;
          padding: 0.5rem 1rem;
        }
      `,
      tailwindImplementation: `
        <button className="h-11 w-11 md:h-10 md:w-10 flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </button>
      `,
    },
  },

  mediaQueries: {
    description: "Strategic use of media queries",
    implementation: [
      "Use mobile-first approach with min-width queries",
      "Consider device capabilities with feature queries",
      "Account for orientation changes",
      "Support dark mode with prefers-color-scheme",
    ],
    examples: {
      featureQueries: `
        @supports (display: grid) {
          .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }
        
        @supports not (display: grid) {
          .features {
            display: flex;
            flex-wrap: wrap;
          }
          
          .feature {
            flex: 0 0 100%;
          }
          
          @media (min-width: 768px) {
            .feature {
              flex: 0 0 50%;
            }
          }
        }
      `,
      orientationQueries: `
        @media (orientation: landscape) and (max-height: 500px) {
          .modal {
            max-height: 90vh;
            overflow-y: auto;
          }
        }
      `,
    },
  },

  responsiveImages: {
    description: "Images that adapt to different screen sizes",
    implementation: [
      "Use Next.js Image component with responsive sizes",
      "Implement art direction with picture element",
      "Set appropriate aspect ratios",
      "Optimize images for different devices",
    ],
    examples: {
      nextImage: `
        <Image
          src="/hero-image.jpg"
          alt="Hero image"
          width={1200}
          height={600}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
      `,
      pictureElement: `
        <picture>
          <source media="(max-width: 767px)" srcSet="/mobile-hero.jpg" />
          <source media="(max-width: 1023px)" srcSet="/tablet-hero.jpg" />
          <img src="/desktop-hero.jpg" alt="Hero image" loading="eager" />
        </picture>
      `,
    },
  },
}

// Priority responsive fixes
export const priorityResponsiveFixes = [
  {
    component: "ChatFooter",
    issue: "Action buttons too small on mobile",
    fix: "Increase touch target size to minimum 44x44px",
    example: `
      <Button
        variant="ghost"
        className="mobile:w-11 mobile:h-11 tablet:w-10 tablet:h-10 desktop:w-10 desktop:h-10"
        aria-label="Voice input"
      >
        <MicIcon className="mobile:w-5 mobile:h-5 tablet:w-4 tablet:h-4 desktop:w-5 desktop:h-5" />
      </Button>
    `,
  },
  {
    component: "VoiceInputModal",
    issue: "Controls difficult to access on mobile",
    fix: "Reposition controls for thumb accessibility",
    example: `
      <div className="fixed bottom-6 left-0 right-0 flex justify-center">
        <Button
          size="lg"
          className="h-16 w-16 rounded-full"
          onClick={toggleRecording}
        >
          {isRecording ? <StopIcon /> : <MicIcon />}
        </Button>
      </div>
    `,
  },
  {
    component: "WebcamModal",
    issue: "Modal too large on small screens",
    fix: "Adjust modal size based on viewport",
    example: `
      <div 
        className={cn(
          "bg-background rounded-lg overflow-hidden",
          "w-[95vw] max-w-3xl mx-auto",
          "max-h-[80vh] md:max-h-[90vh]"
        )}
      >
        {/* Modal content */}
      </div>
    `,
  },
  {
    component: "Video2AppModal",
    issue: "Form overwhelms on mobile screens",
    fix: "Create step-by-step form for mobile",
    example: `
      {isMobile ? (
        <StepForm steps={formSteps} currentStep={currentStep} onNext={handleNext} onBack={handleBack} />
      ) : (
        <FullForm formData={formData} onChange={handleChange} onSubmit={handleSubmit} />
      )}
    `,
  },
  {
    component: "ScreenShareModal",
    issue: "Screen selection grid breaks on small screens",
    fix: "Implement responsive grid with proper sizing",
    example: `
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {screens.map((screen) => (
          <ScreenOption key={screen.id} screen={screen} onSelect={selectScreen} />
        ))}
      </div>
    `,
  },
]
