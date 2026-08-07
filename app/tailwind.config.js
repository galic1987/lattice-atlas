/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Lattice Atlas palette (design.md §2)
        ink: {
          950: '#05080F',
          900: '#0A0F1C',
          850: '#0E1526',
          800: '#121B31',
          700: '#1B2743',
          600: '#2A3A5F',
          500: '#3D5178',
        },
        'text-hi': '#EAF0FB',
        'text-mid': '#A9B4CC',
        'text-low': '#7B89A7',
        plaquette: '#22D3EE',
        star: '#9B7BFA',
        magic: '#F5B83D',
        syndrome: '#FB7185',
        stabilizer: '#34D399',
        tier: {
          1: '#38BDF8',
          2: '#22D3EE',
          3: '#34D399',
          4: '#A78BFA',
          5: '#F5B83D',
          6: '#FB7185',
        },
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
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
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'display-xl': ['72px', { lineHeight: '1.02', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['56px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'glow-cyan': '0 8px 32px rgba(34,211,238,0.08)',
        'glow-violet': '0 8px 32px rgba(139,92,246,0.10)',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
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
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "error-pulse": {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 2px rgba(251,113,133,0.4))" },
          "50%": { opacity: "0.55", filter: "drop-shadow(0 0 10px rgba(251,113,133,0.9))" },
        },
        "nudge-x": {
          "0%, 100%": { transform: "translateX(0)" },
          "50%": { transform: "translateX(6px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "error-pulse": "error-pulse 2s ease-in-out infinite",
        "nudge-x": "nudge-x 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
