/**
 * Formats raw AI/API responses into clean HTML
 * Removes all raw asterisks — converts to proper bold/italic/list styling
 * Used for both "Get Advice" output and chat messages (consistent behavior)
 */

function processMarkdown(text) {
  return text
    // Escape HTML special chars first
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Bold: **text** → <strong> (no asterisks shown)
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic: *text* → <em> (no asterisks shown)
    .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
    // Numbered list: "1. text"
    .replace(/^\d+\.\s+(.+)$/gm, '<div class="fmt-list-item fmt-numbered">$1</div>')
    // Bullets: "• text" or "- text"
    .replace(/^[•\-]\s+(.+)$/gm, '<div class="fmt-list-item">$1</div>')
    // Section headers: short lines ending with colon
    .replace(/^([A-Z][^:\n]{2,40}:)\s*$/gm, '<div class="fmt-section-header">$1</div>');
}

/**
 * For "Get Advice" recommendation block
 */
export function formatAIResponse(text) {
  if (!text) return "";
  const processed = processMarkdown(text)
    .replace(/\n\n+/g, '</p><p class="fmt-para">')
    .replace(/\n(?!<div)/g, "<br/>");
  return `<p class="fmt-para">${processed}</p>`;
}

/**
 * For chat messages — same rules, consistent output
 */
export function formatChatMessage(text) {
  if (!text) return "";
  return processMarkdown(text)
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n(?!<div)/g, "<br/>");
}
