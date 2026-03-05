/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        // ASUS ZenBook Fold specific breakpoints
        'fold-sm': '768px',      // Folded mode (portrait)
        'fold-md': '1024px',     // Partially unfolded
        'fold-lg': '1280px',     // Fully unfolded (landscape)
        'fold-xl': '1536px',     // Ultra-wide unfolded
        
        // Standard responsive breakpoints
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        
        // Ultra-wide and foldable specific
        'ultra-wide': '1920px',
        'fold-portrait': '768px',
        'fold-landscape': '1280px',
      },
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      }
    },
  },
  plugins: [],
}
