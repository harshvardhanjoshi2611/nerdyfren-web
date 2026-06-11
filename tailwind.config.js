/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#0B0F19',
        surface: '#111827',
      },
      boxShadow: {
        glow: '0 0 60px rgba(124, 58, 237, 0.24)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
