/** @type {import('tailwindcss').Config} */

// CSS-variable-backed tokens (defined in global.css, light + dark values) —
// resolves automatically with the system color scheme, no `dark:` variant
// needed at call sites. See global.css for why.
function themed(name) {
  return `rgb(var(--color-${name}) / <alpha-value>)`;
}

module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Ported from okelcor-website's admin panel (lib/admin-notifications.ts,
        // lib/admin-insights.ts, components/admin/admin-shell.tsx) — same product,
        // same accent, so the two apps read as one system. Accent itself stays a
        // flat hex — it's the one color deliberately identical in both themes.
        accent: "#E85C1A",
        "accent-tint": themed("accent-tint"),
        ink: themed("ink"),
        muted: themed("muted"),
        faint: themed("faint"),
        surface: themed("surface"),
        card: themed("card"),
        hairline: themed("hairline"),
        sidebar: "#161616",
        severity: {
          positive: "#059669",
          "positive-tint": themed("severity-positive-tint"),
          info: "#E85C1A",
          "info-tint": themed("severity-info-tint"),
          warning: "#d97706",
          "warning-tint": themed("severity-warning-tint"),
          critical: "#dc2626",
          "critical-tint": themed("severity-critical-tint"),
        },
      },
    },
  },
  plugins: [],
};
