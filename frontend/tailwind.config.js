/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Define the custom fonts from your design brief
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'serif': ['"Playfair Display"', 'serif'],
      },
      // Define the custom color palette
      colors: {
        'cream': '#F9F6F1',
        'navy': '#0A192F',
        'emerald': '#0F766E',
        'golden': '#FFC700',
      },
      // Define custom animations for smooth transitions
      animation: {
        'fade-in': 'fadeIn 0s ease-in-out',
        'slide-up': 'slideUp 1s ease-out forwards',
        'slide-up-fast': 'slideUp 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        }
      }
    },
  },
  plugins: [],
}