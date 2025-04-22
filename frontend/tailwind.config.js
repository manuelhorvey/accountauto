/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
      "./app/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',  // Enables dark mode based on a class on the root element
    theme: {
      extend: {
        colors: {
          // You can extend Tailwind's default color palette here if needed
          'primary': '#2563eb', // Example color
          'secondary': '#22c55e', // Example color
        },
        spacing: {
          // Custom spacing
          '128': '32rem', // Example custom spacing
        },
        borderRadius: {
          'xl': '1.5rem', // Example custom border-radius
        },
        boxShadow: {
          'custom': '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)', // Example custom box-shadow
        },
      },
    },
    plugins: [],
  }
  