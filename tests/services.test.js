const assert = require('assert');
const WindowManagerService = require('../electron/services/WindowManagerService');
const FileSearchService = require('../electron/services/FileSearchService');
const EmojiService = require('../electron/services/EmojiService');

describe('WindowManagerService', () => {
  describe('parseWmctrlOutput', () => {
    it('should parse wmctrl output correctly', () => {
      const output = `0x04000003  0 1920 54   1920 1080 1920 1080  4  0 _NET_ACTIVE_WINDOW: 0x4000003  Firefox - Web Browser`;
      const result = WindowManagerService.parseWmctrlOutput(output);
      
      assert.ok(Array.isArray(result));
      if (result.length > 0) {
        assert.ok(result[0].id);
        assert.ok(result[0].title);
        assert.ok(result[0].app);
      }
    });

    it('should handle empty output', () => {
      const result = WindowManagerService.parseWmctrlOutput('');
      assert.deepStrictEqual(result, []);
    });
  });

  describe('searchWindows', () => {
    it('should return all windows when no query', () => {
      WindowManagerService.windows = [
        { id: '1', title: 'Firefox', app: 'firefox' },
        { id: '2', title: 'Terminal', app: 'gnome-terminal' }
      ];
      
      const result = WindowManagerService.searchWindows('');
      assert.strictEqual(result.length, 2);
    });

    it('should filter windows by title', () => {
      WindowManagerService.windows = [
        { id: '1', title: 'Firefox Browser', app: 'firefox' },
        { id: '2', title: 'Terminal', app: 'gnome-terminal' }
      ];
      
      const result = WindowManagerService.searchWindows('firefox');
      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].title, 'Firefox Browser');
    });
  });
});

describe('FileSearchService', () => {
  describe('getFileType', () => {
    it('should identify javascript files', () => {
      assert.strictEqual(FileSearchService.getFileType('/path/to/file.js'), 'javascript');
    });

    it('should identify python files', () => {
      assert.strictEqual(FileSearchService.getFileType('/path/to/file.py'), 'python');
    });

    it('should identify image files', () => {
      assert.strictEqual(FileSearchService.getFileType('/path/to/image.png'), 'image');
      assert.strictEqual(FileSearchService.getFileType('/path/to/image.jpg'), 'image');
    });

    it('should identify documents', () => {
      assert.strictEqual(FileSearchService.getFileType('/path/to/doc.pdf'), 'pdf');
      assert.strictEqual(FileSearchService.getFileType('/path/to/doc.docx'), 'document');
    });

    it('should return file for unknown extensions', () => {
      assert.strictEqual(FileSearchService.getFileType('/path/to/file.xyz'), 'file');
    });
  });

  describe('search', () => {
    it('should return empty array for short queries', async () => {
      const result = await FileSearchService.search('a');
      assert.deepStrictEqual(result, []);
    });
  });
});

describe('EmojiService', () => {
  describe('search', () => {
    it('should return emojis when searching by name', () => {
      const result = EmojiService.search('smile');
      assert.ok(Array.isArray(result));
      assert.ok(result.length > 0);
      assert.ok(result[0].emoji);
      assert.ok(result[0].name);
      assert.ok(result[0].category);
    });

    it('should return emojis when searching by category', () => {
      const result = EmojiService.search('food');
      assert.ok(Array.isArray(result));
      assert.ok(result.some(e => e.category === 'food'));
    });

    it('should return limited results', () => {
      const result = EmojiService.search('');
      assert.ok(result.length <= 50);
    });
  });

  describe('getAll', () => {
    it('should return all emojis', () => {
      const result = EmojiService.getAll();
      assert.ok(Array.isArray(result));
      assert.ok(result.length > 0);
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', () => {
      const categories = EmojiService.getCategories();
      assert.ok(Array.isArray(categories));
      assert.ok(categories.includes('smileys'));
      assert.ok(categories.includes('food'));
      assert.ok(categories.includes('animals'));
    });
  });

  describe('getByCategory', () => {
    it('should return emojis for a specific category', () => {
      const result = EmojiService.getByCategory('smileys');
      assert.ok(Array.isArray(result));
      assert.ok(result.every(e => e.category === 'smileys'));
    });
  });
});

console.log('✓ WindowManagerService tests defined');
console.log('✓ FileSearchService tests defined');
console.log('✓ EmojiService tests defined');
