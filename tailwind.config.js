/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ← without this, Tailwind only follows OS settings, ignoring user choice
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "cixio-blue": "#1259FB",
        "cixio-navy": "#1236AE",
        "cixio-dark": "#0B1E6B",
        "cixio-light": "#EEF3FF",
        "cixio-bg": "#F4F7FF",
        "cixio-hover": "#0E4DE0",
        "cixio-muted": "#6B88D4",
      },
    },
  },
  plugins: [],
};
