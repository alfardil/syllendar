/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Neobrutalism specific colors
        main: '#8b5cf6',
        overlay: 'rgba(0,0,0,0.8)',
        text: '#000',
        darkText: '#fff',
        darkBg: '#1a1a1a',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        bounce: {
          '0%, 20%, 53%, 80%, 100%': {
            transform: 'translate3d(0,0,0)',
          },
          '40%, 43%': {
            transform: 'translate3d(0, -30px, 0)',
          },
          '70%': {
            transform: 'translate3d(0, -15px, 0)',
          },
          '90%': {
            transform: 'translate3d(0, -4px, 0)',
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        bounce: 'bounce 1s ease-in-out infinite',
      },
      fontFamily: {
        base: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        base: '5px 5px 0px 0px rgba(0,0,0,1)',
        lg: '8px 8px 0px 0px rgba(0,0,0,1)',
        xl: '12px 12px 0px 0px rgba(0,0,0,1)',
      },
      translate: {
        boxShadowX: '5px',
        boxShadowY: '5px',
      },
      fontWeight: {
        base: '400',
        heading: '700',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 