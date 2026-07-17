/**
 * Communication bodies are HTML (the web composer sends rich HTML). RN's
 * <Text> can't render HTML, so this converts common block breaks to
 * newlines and strips the rest — a plain-text rendering, not a parser.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .trim();
}
