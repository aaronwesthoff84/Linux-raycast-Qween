const { app } = require('electron');
const path = require('path');
const fs = require('fs').promises;

class ClipboardService {
  constructor() {
    this.history = [];
    this.maxHistory = 50;
    this.dbPath = path.join(app.getPath('userData'), 'clipboard.json');
    this.initPromise = this.loadHistory();
  }

  async loadHistory() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      this.history = JSON.parse(data);
    } catch (e) {
      this.history = [];
    }
    return this.history;
  }

  async saveHistory() {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(this.history, null, 2));
    } catch (e) {
      console.error('Failed to save clipboard history:', e);
    }
  }

  async addItem(item) {
    await this.initPromise;
    // Avoid duplicates
    const exists = this.history.some(h => h.content === item.content);
    if (!exists) {
      this.history.unshift({
        content: item.content,
        type: item.type || 'text',
        timestamp: Date.now()
      });
      if (this.history.length > this.maxHistory) {
        this.history.pop();
      }
      await this.saveHistory();
    }
    return this.history;
  }

  async getHistory(limit = 20) {
    await this.initPromise;
    return this.history.slice(0, limit);
  }

  async clearHistory() {
    await this.initPromise;
    this.history = [];
    await this.saveHistory();
  }

  async deleteItem(index) {
    await this.initPromise;
    this.history.splice(index, 1);
    await this.saveHistory();
    return this.history;
  }
}

module.exports = ClipboardService;
