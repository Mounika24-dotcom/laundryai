/**
 * Formats raw AI/API responses into clean HTML
 * Handles: **bold**, *italic*, bullet points, numbered lists, line breaks
 */
export function formatAIResponse(text) {
  if (!text) return "";

  let html = text
    // Escape HTML special chars first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

    // Bold: **text** → <strong>
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

    // Italic: *text* → <em>
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")

    // Numbered list items: "1. text" → styled list item
    .replace(/^\d+\.\s+(.+)$/gm, '<div class="fmt-list-item fmt-numbered">$1</div>')

    // Bullet points: "• text" or "- text" or "* text" at line start
    .replace(/^[•\-]\s+(.+)$/gm, '<div class="fmt-list-item">$1</div>')

    // Headers: lines ending with : that are short (section titles)
    .replace(/^([A-Z][^:\n]{2,30}:)\s*$/gm, '<div class="fmt-section-header">$1</div>')

    // Double newline → paragraph break
    .replace(/\n\n+/g, '</p><p class="fmt-para">')

    // Single newline → line break (but not inside list items)
    .replace(/\n(?!<div)/g, "<br/>");

  return `<p class="fmt-para">${html}</p>`;
}

/**
 * Formats chat messages — lighter touch, keeps conversational feel
 */
export function formatChatMessage(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/^[•\-]\s+(.+)$/gm, '<div class="fmt-list-item">$1</div>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, "<br/>");
}
