/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#FFFFFF',
          surface: '#F8F7FF',
          border: '#EBEBF5',
          primary: '#1A1A2E',
          secondary: '#6B6B8A',
          muted: '#ABABC4',
          gradStart: '#A856F7',
          gradMid: '#6A5ACD',
          gradEnd: '#00A1E0',
        },
      },
    },
  },
  plugins: [],
}
