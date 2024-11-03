/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B00', // Main orange color
          dark: '#E65100',    // Darker shade for hover states
          light: '#FF8533',   // Lighter shade for highlights
        },
        background: {
          DEFAULT: '#FFF5EB', // Light cream background
          dark: '#FFF0E0',    // Slightly darker cream for sections
        },
        text: {
          DEFAULT: '#1A1A1A', // Main text color
          light: '#4A4A4A',   // Secondary text color
        }
      }
    },
  },
  plugins: [],
}