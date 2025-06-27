import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        'tech': ['ui-sans-serif', 'system-ui', 'sans-serif'],
        'tech-mono': ['ui-monospace', 'Consolas', 'monospace'],
      },
      letterSpacing: {
        'tight': '-0.025em',
        'normal': '0.05em',
        'wide': '0.1em',
        'tech': '0.05em',
        'tech-wide': '0.1em',
      },
      transitionDuration: {
        'DEFAULT': '200ms',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'var(--color-orange-accent)',
          foreground: 'var(--color-text-on-orange)',
          hover: 'var(--color-orange-accent-hover)',
          light: 'var(--color-orange-accent-light)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Adding custom colors from globals.css
        'orange-accent': 'var(--color-orange-accent)',
        'gunmetal': 'var(--color-gunmetal)',
        'light-silver': 'var(--color-light-silver)',
        'gunmetal-light-alpha': 'var(--color-gunmetal-light-alpha)',
        'light-silver-dark-alpha': 'var(--color-light-silver-dark-alpha)',
        'gunmetal-lighter': 'var(--color-gunmetal-lighter)',
        'light-silver-darker': 'var(--color-light-silver-darker)',
        'orange-accent-hover': 'var(--color-orange-accent-hover)',
        'orange-accent-light': 'var(--color-orange-accent-light)',
        'text-on-orange': 'var(--color-text-on-orange)',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        'DEFAULT': 'var(--radius)', // Typically 4px from Shadcn/UI
        'sm': 'calc(var(--radius) - 2px)', // Example: 2px if --radius is 4px
        'md': 'var(--radius)', // Matches 'DEFAULT'
        'lg': 'var(--border-radius-minimal)', // 4px from globals.css
        'xl': 'calc(var(--border-radius-minimal) + 2px)', // Example: 6px
        '2xl': 'var(--border-radius-medium)', // 8px from globals.css
        '3xl': 'calc(var(--border-radius-medium) + 4px)', // Example: 12px
        'full': '9999px',
        'none': '0px',
        // Explicitly adding the custom variables
        'minimal': 'var(--border-radius-minimal)',
        'medium': 'var(--border-radius-medium)',
      },
      boxShadow: {
        'minimal': 'var(--shadow-minimal)',
        'elevated': 'var(--shadow-elevated)',
        // Retain existing shadows if any, or add more from a default theme if needed
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'DEFAULT': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'none': 'none',
      },
      keyframes: {
        'fade-scale': {
          '0%': {
            opacity: '0',
            transform: 'translateY(-50%) scale(0.95)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(-50%) scale(1)'
          }
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'fade-scale': 'fade-scale 0.2s ease-out',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
