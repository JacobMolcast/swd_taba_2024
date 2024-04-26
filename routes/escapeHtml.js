function escapeHtml(unsafe) {
  if (/<[a-z][\s\S]*>/i.test(unsafe)) {
    throw new Error('Input contains characters that are not allowed.');
  }
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

module.exports = escapeHtml;
