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
          DEFAULT: '#ea580c', // dark orange
          dark: '#c2410c',
        },
        background: {
          DEFAULT: '#f5f5f5', // smoke white
        },
      },
    },
  },
  plugins: [],
}
