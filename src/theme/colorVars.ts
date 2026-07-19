import { vars } from "nativewind";

/**
 * The actual reactive light/dark mechanism (see global.css for why the
 * `@media` approach doesn't work). `vars()` on a root View, combined with
 * `useColorScheme()` in App.tsx, re-renders and re-applies these on every
 * OS appearance change — verified against the simulator's live toggle.
 */
export const lightVars = vars({
  "--color-surface": "240 242 245",
  "--color-card": "255 255 255",
  "--color-ink": "26 26 26",
  "--color-muted": "92 94 98",
  "--color-faint": "156 163 175",
  "--color-hairline": "0 0 0",
  "--color-accent-tint": "255 241 236",
  "--color-severity-positive-tint": "236 253 245",
  "--color-severity-info-tint": "255 241 236",
  "--color-severity-warning-tint": "255 251 235",
  "--color-severity-critical-tint": "254 242 242",
});

export const darkVars = vars({
  "--color-surface": "13 13 15",
  "--color-card": "28 28 30",
  "--color-ink": "245 245 247",
  "--color-muted": "161 161 170",
  "--color-faint": "113 113 122",
  "--color-hairline": "255 255 255",
  "--color-accent-tint": "61 33 21",
  "--color-severity-positive-tint": "6 46 34",
  "--color-severity-info-tint": "61 33 21",
  "--color-severity-warning-tint": "55 38 3",
  "--color-severity-critical-tint": "55 15 15",
});
