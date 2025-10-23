/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
  theme: {
    extend: {
      colors: {
        ritual: {
          indigo: {
            DEFAULT: '#2D3561',
            dark: '#1f2542',
            light: '#3d4675',
          },
          gold: {
            DEFAULT: '#F4C430',
            light: '#f7d566',
            dark: '#d4a820',
          },
          sage: {
            DEFAULT: '#9CAF88',
            light: '#b5c5a4',
            dark: '#7d9069',
          },
          charcoal: {
            DEFAULT: '#1A1A1A',
            light: '#2a2a2a',
            lighter: '#3a3a3a',
          },
          aurora: {
            purple: '#8B5CF6',
            blue: '#3B82F6',
            green: '#10B981',
          },
        },
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'rounded': ['SF Pro Rounded', 'ui-rounded', 'system-ui', 'sans-serif'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      animation: {
        'breath': 'breath 8s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139, 92, 246, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(139, 92, 246, 0.8)' },
        },
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 50%, #10B981 100%)',
        'ritual-gradient': 'linear-gradient(135deg, #2D3561 0%, #3d4675 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
