const fetch = require('node-fetch');

class WebSearchService {
  static async search(query, engine = 'duckduckgo') {
    const engines = {
      duckduckgo: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`,
      google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      wikipedia: `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
    };

    const url = engines[engine] || engines.duckduckgo;

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        }
      });

      if (!response.ok) {
        return { success: false, error: `HTTP ${response.status}` };
      }

      const text = await response.text();
      
      return {
        success: true,
        results: text,
        url
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static getSuggestions(query) {
    // Return quick action suggestions based on query patterns
    const suggestions = [];

    // URL detection
    if (/^https?:\/\//.test(query) || /^\w+\.\w+/.test(query)) {
      suggestions.push({
        type: 'open_url',
        title: `Open ${query}`,
        icon: '🌐',
        action: query.startsWith('http') ? query : `https://${query}`
      });
    }

    // Email detection
    if (/^\S+@\S+\.\S+$/.test(query)) {
      suggestions.push({
        type: 'email',
        title: `Email ${query}`,
        icon: '📧',
        action: `mailto:${query}`
      });
    }

    // Calculator mode
    if (/^[0-9+\-*/().\s]+$/.test(query) && /[+\-*/]/.test(query)) {
      suggestions.push({
        type: 'calculate',
        title: `Calculate: ${query}`,
        icon: '🔢',
        action: query
      });
    }

    // File path detection
    if (query.startsWith('/') || query.startsWith('~')) {
      suggestions.push({
        type: 'open_file',
        title: `Open: ${query}`,
        icon: '📁',
        action: query
      });
    }

    return suggestions;
  }
}

module.exports = WebSearchService;
