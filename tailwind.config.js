/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Sora"', 'sans-serif'],
        mono: ['"Space Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#12101c',
          900: '#1a1626',
          800: '#241f36',
          700: '#332b4d',
          600: '#453a68',
        },
        amber: {
          400: '#ffb84d',
          500: '#ff9d2e',
          600: '#f5811a',
        },
        coral: {
          400: '#ff7a6b',
          500: '#ff5c47',
        },
        mint: {
          400: '#6be3c2',
          500: '#3fcda3',
        },
        paper: '#faf6ef',
      },
      borderRadius: {
        stub: '28px 10px 28px 10px',
        tag: '4px 20px 4px 20px',
        chip: '999px 10px 999px 10px',
      },
      boxShadow: {
        stub: '6px 6px 0 0 rgba(18, 16, 28, 0.9)',
        'stub-sm': '4px 4px 0 0 rgba(18, 16, 28, 0.85)',
        glow: '0 0 0 3px rgba(255, 157, 46, 0.35)',
      },
      backgroundImage: {
        grain: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)",
      },
      backgroundSize: {
        grain: '14px 14px',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.4, transform: 'scale(0.8)' },
        },
        popIn: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      animation: {
        'pulse-dot': 'pulseDot 1.6s ease-in-out infinite',
        'pop-in': 'popIn 0.18s ease-out',
      },
    },
  },
  plugins: [],
};
