/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Golden Retriever Puppy Brand Palette
        brand: {
          50: '#fffbeb',  // warm cream
          100: '#fef3c7', // puppy biscuit
          200: '#fde68a', // soft golden fluff
          300: '#fcd34d', // golden honey
          400: '#fbbf24', // warm golden retriever
          500: '#f59e0b', // rich golden amber
          600: '#d97706', // warm caramel
          700: '#b45309', // golden toffee
          800: '#92400e', // hazel brown
          900: '#78350f', // deep warm bark
          950: '#451a03', // espresso puppy nose
        },
        golden: {
          50: '#fffdf5',
          100: '#fef9ee',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Theme Aliases to transform entire app into Golden Retriever Theme
        cyan: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        sky: {
          50: '#fffdf5',
          100: '#fef9ee',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#3f2206',
        },
        indigo: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        // Warm Golden Puppy Obsidian / Dark coat
        slate: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          850: '#1c1917',
          900: '#181513',
          950: '#0c0a09'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
