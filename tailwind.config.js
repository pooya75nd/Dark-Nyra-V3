export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        background: '#0d0d0d',
        panel: '#1a1a1a',
        border: '#2a2a2a',
        buy: '#4ade80',
        sell: '#ef4444',
        accent: '#facc15', // doré
      },
    },
  },
  plugins: [],
}
