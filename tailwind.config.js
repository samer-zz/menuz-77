/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#040A1C',
          900: '#060D1F',
          850: '#081230',
          800: '#0A1A3D',
          700: '#0F2A5C',
          600: '#16407F',
        },
        brand: {
          50: '#FFF4E8',
          100: '#FFE8D1',
          200: '#FFD0A3',
          300: '#FFB26B',
          400: '#FF8F2E',
          500: '#FF7A1A',
          600: '#F05E00',
          700: '#C44A00',
        },
        gold: { 400: '#E8B84B', 500: '#D9A62E' },
      },
      fontFamily: {
        sans: ['Cairo', 'Tajawal', 'IBM Plex Sans Arabic', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(255,122,26,0.25)',
        card: '0 10px 40px rgba(0,0,0,0.45)',
      },
    },
  },
  plugins: [],
};
