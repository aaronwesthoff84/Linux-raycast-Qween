const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * HistoryService - Track user actions and frequently used items
 * Provides smart suggestions based on usage patterns
 */
class HistoryService {
  constructor() {
    this.historyFile = path.join(os.homedir(), '.linuxcast', 'history.json');
    this.maxHistory = 500;
    this.ensureDataFile();
  }

  /**
   * Ensure data file exists
   */
  ensureDataFile() {
    const dir = path.dirname(this.historyFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.historyFile)) {
      this.saveHistory({ apps: [], commands: [], files: [], searches: [] });
    }
  }

  /**
   * Load history
   */
  loadHistory() {
    try {
      const data = fs.readFileSync(this.historyFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading history:', error);
      return { apps: [], commands: [], files: [], searches: [] };
    }
  }

  /**
   * Save history
   */
  saveHistory(history) {
    try {
      fs.writeFileSync(this.historyFile, JSON.stringify(history, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Add item to history
   */
  async addItem(type, item) {
    const history = this.loadHistory();
    
    if (!history[type]) {
      history[type] = [];
    }

    // Remove existing entry if present
    const existingIndex = history[type].findIndex(i => i.id === item.id || i.value === item.value);
    if (existingIndex !== -1) {
      history[type].splice(existingIndex, 1);
    }

    // Add new entry with timestamp
    const newItem = {
      ...item,
      timestamp: Date.now(),
      count: (history[type].find(i => i.id === item.id || i.value === item.value)?.count || 0) + 1
    };

    history[type].unshift(newItem);

    // Trim to max size
    if (history[type].length > this.maxHistory) {
      history[type] = history[type].slice(0, this.maxHistory);
    }

    return this.saveHistory(history);
  }

  /**
   * Get recent items
   */
  async getRecent(type, limit = 10) {
    const history = this.loadHistory();
    return (history[type] || []).slice(0, limit);
  }

  /**
   * Get frequent items (sorted by usage count)
   */
  async getFrequent(type, limit = 10) {
    const history = this.loadHistory();
    const items = history[type] || [];
    
    return items
      .sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, limit);
  }

  /**
   * Search history
   */
  async search(type, query) {
    const history = this.loadHistory();
    const items = history[type] || [];
    
    if (!query.trim()) {
      return items;
    }

    const q = query.toLowerCase();
    return items.filter(item => {
      const searchable = Object.values(item).join(' ').toLowerCase();
      return searchable.includes(q);
    });
  }

  /**
   * Clear history for a type
   */
  async clear(type) {
    const history = this.loadHistory();
    
    if (type) {
      history[type] = [];
    } else {
      history.apps = [];
      history.commands = [];
      history.files = [];
      history.searches = [];
    }

    return this.saveHistory(history);
  }

  /**
   * Remove specific item
   */
  async removeItem(type, id) {
    const history = this.loadHistory();
    
    if (history[type]) {
      history[type] = history[type].filter(i => i.id !== id && i.value !== id);
      return this.saveHistory(history);
    }

    return { success: false, error: 'Type not found' };
  }

  /**
   * Get statistics
   */
  async getStats() {
    const history = this.loadHistory();
    
    return {
      totalApps: history.apps?.length || 0,
      totalCommands: history.commands?.length || 0,
      totalFiles: history.files?.length || 0,
      totalSearches: history.searches?.length || 0,
      mostUsedApp: history.apps?.sort((a, b) => (b.count || 0) - (a.count || 0))[0]?.name || null,
      lastActivity: Math.max(
        ...(history.apps || []).map(i => i.timestamp || 0),
        ...(history.commands || []).map(i => i.timestamp || 0),
        ...(history.files || []).map(i => i.timestamp || 0),
        ...(history.searches || []).map(i => i.timestamp || 0),
        0
      )
    };
  }
}

module.exports = HistoryService;
