/**
 * Communication bodies are HTML from the web admin's plain `contenteditable`
 * composer (both the message and the appended signature) — browsers structure
 * that as one <div> per line, not <p>, so </div> has to become a line break
 * too or every line (including the signature) runs together as one blob.
 * RN's <Text> can't render HTML at all, so this is a plain-text approximation,
 * not a parser.
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(div|p|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
