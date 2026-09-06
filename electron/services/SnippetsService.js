const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * SnippetsService - Text snippets for quick insertion
 * Like Raycast snippets: store and quickly insert frequently used text
 */
class SnippetsService {
  constructor() {
    this.snippetsFile = path.join(os.homedir(), '.linuxcast', 'snippets.json');
    this.ensureDataFile();
  }

  /**
   * Ensure data file exists
   */
  ensureDataFile() {
    const dir = path.dirname(this.snippetsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.snippetsFile)) {
      this.saveSnippets(this.getDefaultSnippets());
    }
  }

  /**
   * Get default snippets
   */
  getDefaultSnippets() {
    return [
      {
        id: 'email',
        shortcut: ';email',
        title: 'Email Address',
        content: 'your.email@example.com',
        category: 'contact'
      },
      {
        id: 'phone',
        shortcut: ';phone',
        title: 'Phone Number',
        content: '+1 (555) 123-4567',
        category: 'contact'
      },
      {
        id: 'address',
        shortcut: ';address',
        title: 'Address',
        content: '123 Main St, City, State 12345',
        category: 'contact'
      },
      {
        id: 'signature',
        shortcut: ';sig',
        title: 'Email Signature',
        content: 'Best regards,\nYour Name\nYour Title',
        category: 'email'
      },
      {
        id: 'todo',
        shortcut: ';todo',
        title: 'TODO Comment',
        content: '// TODO: Implement this feature',
        category: 'code'
      },
      {
        id: 'fixme',
        shortcut: ';fixme',
        title: 'FIXME Comment',
        content: '// FIXME: This needs attention',
        category: 'code'
      },
      {
        id: 'date',
        shortcut: ';date',
        title: 'Current Date',
        content: new Date().toISOString().split('T')[0],
        category: 'utility'
      },
      {
        id: 'datetime',
        shortcut: ';datetime',
        title: 'Current DateTime',
        content: new Date().toISOString(),
        category: 'utility'
      },
      {
        id: 'lorem',
        shortcut: ';lorem',
        title: 'Lorem Ipsum',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        category: 'text'
      },
      {
        id: 'checkmark',
        shortcut: ';check',
        title: 'Checkmark',
        content: '✓',
        category: 'symbols'
      },
      {
        id: 'cross',
        shortcut: ';cross',
        title: 'Cross Mark',
        content: '✗',
        category: 'symbols'
      },
      {
        id: 'arrow-right',
        shortcut: ';arr-r',
        title: 'Right Arrow',
        content: '→',
        category: 'symbols'
      },
      {
        id: 'arrow-left',
        shortcut: ';arr-l',
        title: 'Left Arrow',
        content: '←',
        category: 'symbols'
      },
      {
        id: 'copyright',
        shortcut: ';copy',
        title: 'Copyright Symbol',
        content: '©',
        category: 'symbols'
      },
      {
        id: 'registered',
        shortcut: ';reg',
        title: 'Registered Symbol',
        content: '®',
        category: 'symbols'
      }
    ];
  }

  /**
   * Load all snippets
   */
  async getSnippets(query = '') {
    try {
      const data = fs.readFileSync(this.snippetsFile, 'utf8');
      let snippets = JSON.parse(data);

      if (query.trim()) {
        const q = query.toLowerCase();
        snippets = snippets.filter(s => 
          s.title.toLowerCase().includes(q) ||
          s.shortcut.toLowerCase().includes(q) ||
          s.content.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        );
      }

      return snippets.sort((a, b) => a.title.localeCompare(b.title));
    } catch (error) {
      console.error('Error loading snippets:', error);
      return this.getDefaultSnippets();
    }
  }

  /**
   * Save snippets
   */
  saveSnippets(snippets) {
    try {
      fs.writeFileSync(this.snippetsFile, JSON.stringify(snippets, null, 2));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Create a new snippet
   */
  async createSnippet(shortcut, title, content, category = 'custom') {
    try {
      const snippets = await this.getSnippets();
      
      // Check if shortcut already exists
      if (snippets.some(s => s.shortcut === shortcut)) {
        return { success: false, error: 'Shortcut already exists' };
      }

      const newSnippet = {
        id: `snippet-${Date.now()}`,
        shortcut,
        title,
        content,
        category,
        created: new Date().toISOString()
      };

      snippets.push(newSnippet);
      this.saveSnippets(snippets);

      return { success: true, snippet: newSnippet };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a snippet
   */
  async updateSnippet(id, updates) {
    try {
      const snippets = await this.getSnippets();
      const index = snippets.findIndex(s => s.id === id);

      if (index === -1) {
        return { success: false, error: 'Snippet not found' };
      }

      snippets[index] = { ...snippets[index], ...updates };
      this.saveSnippets(snippets);

      return { success: true, snippet: snippets[index] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a snippet
   */
  async deleteSnippet(id) {
    try {
      const snippets = await this.getSnippets();
      const filtered = snippets.filter(s => s.id !== id);

      if (filtered.length === snippets.length) {
        return { success: false, error: 'Snippet not found' };
      }

      this.saveSnippets(filtered);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get snippet by shortcut
   */
  async getByShortcut(shortcut) {
    const snippets = await this.getSnippets();
    return snippets.find(s => s.shortcut === shortcut) || null;
  }

  /**
   * Get categories
   */
  async getCategories() {
    const snippets = await this.getSnippets();
    const categories = [...new Set(snippets.map(s => s.category))];
    return categories.sort();
  }

  /**
   * Get snippets by category
   */
  async getByCategory(category) {
    const snippets = await this.getSnippets();
    return snippets.filter(s => s.category === category);
  }
}

module.exports = SnippetsService;
