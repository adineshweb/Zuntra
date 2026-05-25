/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        zuntra: {
          red: '#e60023',
          dark: '#111111',
          gray: '#767676',
          lightgray: '#efefef',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      gridTemplateColumns: {
        'masonry-sm': 'repeat(auto-fill, minmax(140px, 1fr))',
        'masonry-md': 'repeat(auto-fill, minmax(200px, 1fr))',
        'masonry-lg': 'repeat(auto-fill, minmax(236px, 1fr))',
      }
    },
  },
  plugins: [],
}
