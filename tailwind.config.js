/** @type {import('tailwindcss').Config} */
// Replaces the per-page cdn.tailwindcss.com runtime engine with a prebuilt CSS file.
// Theme is the union of every page's former inline `tailwind.config` block.
// Rebuild after editing markup:  npm run build:css   (or `npm run deploy`)
module.exports = {
  content: [
    './*.html',
    './docs/**/*.html', // docs fragments injected into docs.html at runtime
  ],
  theme: {
    extend: {
      colors: {
        'deep-slate':    '#020617',
        'electric-blue': '#3b82f6',
        'blue-glow':     '#60a5fa',
        'blue-bright':   '#93c5fd',
      },
      fontFamily: {
        'display': ['Syne', 'sans-serif'],
        'body':    ['DM Sans', 'sans-serif'],
        'mono':    ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
