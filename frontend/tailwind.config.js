/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Theme - Elegant Modern Lilac
        'bg-primary': '#FAFAFA',      // Soft Ivory
        'surface': '#F5F2F8',         // Mist Lavender
        'primary': '#C8A2C8',         // Soft Lilac
        'accent': '#6C63FF',          // Deep Violet
        'text-primary': '#2E2E2E',    // Charcoal Gray
        'text-secondary': '#6B6B6B',  // Cool Gray
        'hover': '#B388EB',           // Muted Purple
        'border': '#E2E2E2',          // Light Gray

        // Dark Theme - Lux Lilac
        'dark-bg-primary': '#1E1B22', // Deep Charcoal
        'dark-surface': '#2A2433',    // Graphite Purple
        'dark-primary': '#B497BD',    // Dusty Lilac
        'dark-accent': '#A77BCC',     // Soft Violet
        'dark-text-primary': '#F5F5F5', // Off White
        'dark-text-secondary': '#C7BFD9', // Pale Lavender Gray
        'dark-hover': '#8E6DAE',      // Muted Plum
        'dark-border': '#3A3444',     // Soft Border Gray

        // Legacy colors for backward compatibility
        lilac: '#C8A2C8',
        'lilac-light': '#E6D7E6',
        'lilac-dark': '#A085A0',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
      },
    },
  },
  plugins: [],
}