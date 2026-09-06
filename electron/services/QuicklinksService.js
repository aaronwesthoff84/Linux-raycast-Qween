const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * QuicklinksService - Quick access to frequently used URLs and file paths
 * Like Raycast Quick Links feature
 */
class QuicklinksService {
  constructor() {
    this.quicklinksFile = path.join(os.homedir(), '.linuxcast', 'quicklinks.json');
    this.ensureDataFile();
  }

  /**
   * Ensure data file exists
   */
  ensureDataFile() {
    const dir = path.dirname(this.quicklinksFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.quicklinksFile)) {
      this.saveQuicklinks(this.getDefaultQuicklinks());
    }
  }

  /**
   * Get default quicklinks
   */
  getDefaultQuicklinks() {
    return [
      {
        id: 'github',
        title: 'GitHub',
        url: 'https://github.com',
        icon: '🐙',
        category: 'development'
      },
      {
        id: 'stackoverflow',
        title: 'Stack Overflow',
        url: 'https://stackoverflow.com',
        icon: '📚',
        category: 'development'
      },
      {
        id: 'npm',
        title: 'npm',
        url: 'https://www.npmjs.com',
        icon: '📦',
        category: 'development'
      },
      {
        id: 'devdocs',
        title: 'DevDocs',
        url: 'https://devdocs.io',
        icon: '📖',
        category: 'development'
      },
      {
        id: 'gmail',
        title: 'Gmail',
        url: 'https://mail.google.com',
        icon: '📧',
        category: 'communication'
      },
      {
        id: 'calendar',
        title: 'Google Calendar',
        url: 'https://calendar.google.com',
        icon: '📅',
        category: 'productivity'
      },
      {
        id: 'drive',
        title: 'Google Drive',
        url: 'https://drive.google.com',
        icon: '☁️',
        category: 'productivity'
      },
      {
        id: 'notion',
        title: 'Notion',
        url: 'https://www.notion.so',
        icon: '📝',
        category: 'productivity'
      },
      {
        id: 'youtube',
        title: 'YouTube',
        url: 'https://www.youtube.com',
        icon: '📺',
        category: 'entertainment'
      },
      {
        id: 'reddit',
        title: 'Reddit',
        url: 'https://www.reddit.com',
        icon: '🤖',
        category: 'social'
      },
      {
        id: 'twitter',
        title: 'Twitter/X',
        url: 'https://twitter.com',
        icon: '🐦',
        category: 'social'
      },
      {
        id: 'linkedin',
        title: 'LinkedIn',
        url: 'https://www.linkedin.com',
        icon: '💼',
        category: 'professional'
      },
      {
        id: 'arch-wiki',
        title: 'Arch Wiki',
        url: 'https://wiki.archlinux.org',
        icon: '📜',
        category: 'linux'
      },
      {
        id: 'cachyos-forum',
        title: 'CachyOS Forum',
        url: 'https://forum.cachyos.org',
        icon: '💬',
        category: 'linux'
      }
    ];
  }

  /**
   * Load all quicklinks
   */
  async getQuicklinks(query = '') {
    try {
      const data = fs.readFileSync(this.quicklinksFile, 'utf8');
      let quicklinks = JSON.parse(data);

      if (query.trim()) {
        const q = query.toLowerCase();
        quicklinks = quicklinks.filter(l => 
          l.title.toLowerCase().includes(q) ||
          l.url.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q)
        );
      }

      return quicklinks.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error('Error loading quicklinks:', error);
      return this.getDefaultQuicklinks();
    }
  }

  /**
   * Save quicklinks
   */
  saveQuicklinks(quicklinks) {
    try {
      fs.writeFileSync(this.quicklinksFile, JSON.stringify(quicklinks, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new quicklink
   */
  async createQuicklink(title, url, icon = '🔗', category = 'custom') {
    try {
      const quicklinks = await this.getQuicklinks();
      
      // Validate URL
      if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('file://')) {
        return { success: false, error: 'Invalid URL format' };
      }

      const newLink = {
        id: `link-${Date.now()}`,
        title,
        url,
        icon,
        category,
        created: new Date().toISOString()
      };

      quicklinks.push(newLink);
      this.saveQuicklinks(quicklinks);

      return { success: true, link: newLink };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a quicklink
   */
  async updateQuicklink(id, updates) {
    try {
      const quicklinks = await this.getQuicklinks();
      const index = quicklinks.findIndex(l => l.id === id);

      if (index === -1) {
        return { success: false, error: 'Quicklink not found' };
      }

      quicklinks[index] = { ...quicklinks[index], ...updates };
      this.saveQuicklinks(quicklinks);

      return { success: true, link: quicklinks[index] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a quicklink
   */
  async deleteQuicklink(id) {
    try {
      const quicklinks = await this.getQuicklinks();
      const filtered = quicklinks.filter(l => l.id !== id);

      if (filtered.length === quicklinks.length) {
        return { success: false, error: 'Quicklink not found' };
      }

      this.saveQuicklinks(filtered);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get categories
   */
  async getCategories() {
    const quicklinks = await this.getQuicklinks();
    const categories = [...new Set(quicklinks.map(l => l.category))];
    return categories.sort();
  }

  /**
   * Get quicklinks by category
   */
  async getByCategory(category) {
    const quicklinks = await this.getQuicklinks();
    return quicklinks.filter(l => l.category === category);
  }
}

module.exports = QuicklinksService;
