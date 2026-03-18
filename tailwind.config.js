module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF6B6B",
        secondary: "#4ECDC4",
        dark: "#2C3E50",
        light: "#ECF0F1",
        gray: {
          50: "#F9FAFB",
          100: "#F3F4F6",
          200: "#E5E7EB",
          300: "#D1D5DB",
          400: "#9CA3AF",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
        },
      },
      boxShadow: {
        soft: "0 4px 12px rgba(0, 0, 0, 0.08)",
        medium: "0 8px 24px rgba(0, 0, 0, 0.12)",
        hover: "0 12px 32px rgba(0, 0, 0, 0.15)",
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-in",
        slideUp: "slideUp 0.3s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
}
