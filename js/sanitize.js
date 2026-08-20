// ============================================
// MODISH JUNCTION - HTML SANITIZER UTILITY
// File: js/sanitize.js
// Purpose: Prevent XSS attacks by escaping user-controlled data
// ============================================

const Sanitize = (() => {

  /**
   * Escape HTML special characters for safe text display.
   * Use when inserting user data as text content inside HTML elements.
   * @param {*} str - The string to escape
   * @returns {string} - Escaped string safe for HTML text content
   */
  function text(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Escape a string for safe use inside HTML attribute values.
   * Covers all special characters that could break out of attribute context.
   * @param {*} str - The string to escape
   * @returns {string} - Escaped string safe for HTML attributes
   */
  function attr(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/`/g, '&#96;');
  }

  /**
   * Validate and sanitize a URL. Blocks javascript: and data: URIs 
   * (except data:image/ which are legitimate base64 images).
   * @param {*} str - The URL to validate
   * @param {string} fallback - Fallback URL if the input is invalid
   * @returns {string} - Safe URL or fallback
   */
  function url(str, fallback = '') {
    if (!str || typeof str !== 'string') return fallback;
    const trimmed = str.trim();

    // Allow relative paths
    if (trimmed.startsWith('./') || trimmed.startsWith('../') || trimmed.startsWith('/')) {
      return trimmed;
    }

    // Allow http/https
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    // Allow data:image/ (base64 product images)
    if (trimmed.startsWith('data:image/')) {
      return trimmed;
    }

    // Block everything else (javascript:, data:text/html, vbscript:, etc.)
    return fallback;
  }

  /**
   * Strip all HTML tags from a string (for plain text extraction).
   * @param {*} str - The string to strip
   * @returns {string} - String with all HTML tags removed
   */
  function stripTags(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/<[^>]*>/g, '');
  }

  /**
   * Truncate a string to a maximum length with ellipsis.
   * @param {*} str - The string to truncate
   * @param {number} maxLen - Maximum allowed length
   * @returns {string} - Truncated string
   */
  function truncate(str, maxLen) {
    if (!str) return '';
    const s = String(str);
    if (s.length <= maxLen) return s;
    return s.substring(0, maxLen) + '…';
  }

  // Public API
  return {
    text,
    attr,
    url,
    stripTags,
    truncate
  };
})();

window.Sanitize = Sanitize;
