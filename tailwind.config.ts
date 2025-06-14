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
  			'sans': ['var(--font-rajdhani)', 'Rajdhani', 'system-ui', 'sans-serif'],
  			'mono': ['var(--font-space-mono)', 'Space Mono', 'monospace'],
  			'tech': ['var(--font-rajdhani)', 'Rajdhani', 'sans-serif'],
  			'tech-mono': ['var(--font-space-mono)', 'Space Mono', 'monospace'],
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
  					from: {
  						height: '0'
  					},
  					to: {
  						height: 'var(--radix-accordion-content-height)'
  					}
  				},
  				'accordion-up': {
  					from: {
  						height: 'var(--radix-accordion-content-height)'
  					},
  					to: {
  						height: '0'
  					}
  				}
  			},
  			animation: {
  				'fade-scale': 'fade-scale 0.2s ease-out',
  				'accordion-down': 'accordion-down 0.2s ease-out',
  				'accordion-up': 'accordion-up 0.2s ease-out'
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
  			'DEFAULT': '2px',
  			'sm': '1px',
  			'md': '2px', 
  			'lg': '4px',
  			'xl': '6px',
  			'2xl': '8px',
  			'3xl': '12px',
  			'full': '9999px',
  			'none': '0px'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
