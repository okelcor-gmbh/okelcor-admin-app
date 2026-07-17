const ENTITIES: Record<string, string> = {
  "&lt;": "<",
  "&gt;": ">",
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

/**
 * Notification bodies (e.g. quoted email replies) can arrive HTML-escaped.
 * React Native's <Text> doesn't decode entities the way a browser would, so
 * this does it manually — deliberately narrow, not a full HTML parser.
 */
export function decodeHtmlEntities(text: string): string {
  return text.replace(/&lt;|&gt;|&amp;|&quot;|&#39;|&apos;|&nbsp;/g, (match) => ENTITIES[match] ?? match);
}
