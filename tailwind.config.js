/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Ported from okelcor-website's admin panel (lib/admin-notifications.ts,
        // lib/admin-insights.ts, components/admin/admin-shell.tsx) — same product,
        // same accent, so the two apps read as one system.
        accent: "#E85C1A",
        "accent-tint": "#fff1ec",
        ink: "#1a1a1a",
        muted: "#5c5e62",
        faint: "#9ca3af",
        surface: "#f0f2f5",
        sidebar: "#161616",
        severity: {
          positive: "#059669",
          "positive-tint": "#ecfdf5",
          info: "#E85C1A",
          "info-tint": "#fff1ec",
          warning: "#d97706",
          "warning-tint": "#fffbeb",
          critical: "#dc2626",
          "critical-tint": "#fef2f2",
        },
      },
    },
  },
  plugins: [],
};
