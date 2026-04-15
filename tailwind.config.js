/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#020818',
        surface: 'rgba(255,255,255,0.04)',
        cyan: {
          DEFAULT: '#06b6d4',
          glow: '#00e5ff',
        },
        violet: {
          DEFAULT: '#8b5cf6',
          glow: '#a855f7',
        },
        neon: {
          green: '#4ade80',
          pink: '#f472b6',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '36px',
      },
      backgroundImage: {
        'glass': 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
        'neon-cyan': 'radial-gradient(circle, rgba(6,182,212,0.3) 0%, transparent 70%)',
        'neon-violet': 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
        'hero-gradient': 'linear-gradient(135deg, #020818 0%, #0d0b2a 50%, #060d1f 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(6,182,212,0.5), 0 0 60px rgba(6,182,212,0.2)',
        'neon-violet': '0 0 20px rgba(139,92,246,0.5), 0 0 60px rgba(139,92,246,0.2)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
        'inner-glow': 'inset 0 0 30px rgba(6,182,212,0.1)',
      },
      keyframes: {
        pulse_glow: {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.7, transform: 'scale(1.05)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      animation: {
        pulse_glow: 'pulse_glow 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        scan: 'scan 3s linear infinite',
        shimmer: 'shimmer 3s linear infinite',
      },
    },
  },
  plugins: [],
}
