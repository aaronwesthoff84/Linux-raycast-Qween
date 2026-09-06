const assert = require('assert');
const SystemCommandService = require('../electron/services/SystemCommandService');
const ScriptService = require('../electron/services/ScriptService');
const SnippetsService = require('../electron/services/SnippetsService');
const QuicklinksService = require('../electron/services/QuicklinksService');
const HistoryService = require('../electron/services/HistoryService');

describe('SystemCommandService', () => {
  describe('getAvailableCommands', () => {
    it('should return a list of available commands', () => {
      const commands = SystemCommandService.getAvailableCommands();
      assert.ok(Array.isArray(commands));
      assert.ok(commands.length > 0);
      assert.ok(commands[0].name);
      assert.ok(commands[0].command);
      assert.ok(commands[0].icon);
    });

    it('should include power commands', () => {
      const commands = SystemCommandService.getAvailableCommands();
      const commandNames = commands.map(c => c.command);
      assert.ok(commandNames.includes('poweroff'));
      assert.ok(commandNames.includes('restart'));
      assert.ok(commandNames.includes('suspend'));
      assert.ok(commandNames.includes('lock'));
    });
  });

  describe('execute', () => {
    it('should reject dangerous commands', async () => {
      const result = await SystemCommandService.execute('rm -rf /');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('not allowed'));
    });
  });
});

describe('ScriptService', () => {
  let service;

  beforeEach(() => {
    service = new ScriptService();
  });

  describe('getTemplates', () => {
    it('should return script templates', () => {
      const templates = service.getTemplates();
      assert.ok(Array.isArray(templates));
      assert.ok(templates.length > 0);
      assert.ok(templates[0].name);
      assert.ok(templates[0].content);
      assert.ok(templates[0].type);
    });

    it('should include common system scripts', () => {
      const templates = service.getTemplates();
      const names = templates.map(t => t.name);
      assert.ok(names.some(n => n.includes('Update')));
      assert.ok(names.some(n => n.includes('Cache')));
    });
  });

  describe('runCommand', () => {
    it('should reject dangerous commands', async () => {
      const result = await service.runCommand('rm -rf /');
      assert.strictEqual(result.success, false);
      assert.ok(result.error.includes('Dangerous'));
    });

    it('should execute safe commands', async () => {
      const result = await service.runCommand('echo "test"');
      assert.strictEqual(result.success, true);
      assert.ok(result.output.includes('test'));
    });
  });
});

describe('SnippetsService', () => {
  let service;

  beforeEach(() => {
    service = new SnippetsService();
  });

  describe('getDefaultSnippets', () => {
    it('should return default snippets', () => {
      const snippets = service.getDefaultSnippets();
      assert.ok(Array.isArray(snippets));
      assert.ok(snippets.length > 0);
      assert.ok(snippets[0].shortcut);
      assert.ok(snippets[0].content);
    });

    it('should include contact snippets', () => {
      const snippets = service.getDefaultSnippets();
      const hasContact = snippets.some(s => s.category === 'contact');
      assert.ok(hasContact);
    });

    it('should include code snippets', () => {
      const snippets = service.getDefaultSnippets();
      const hasCode = snippets.some(s => s.category === 'code');
      assert.ok(hasCode);
    });

    it('should include symbol snippets', () => {
      const snippets = service.getDefaultSnippets();
      const hasSymbols = snippets.some(s => s.category === 'symbols');
      assert.ok(hasSymbols);
    });
  });

  describe('getSnippets', () => {
    it('should return all snippets when no query', async () => {
      const snippets = await service.getSnippets();
      assert.ok(Array.isArray(snippets));
      assert.ok(snippets.length > 0);
    });

    it('should filter by query', async () => {
      const snippets = await service.getSnippets('email');
      assert.ok(Array.isArray(snippets));
      snippets.forEach(s => {
        const searchable = `${s.title} ${s.shortcut} ${s.content}`.toLowerCase();
        assert.ok(searchable.includes('email'));
      });
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const categories = await service.getCategories();
      assert.ok(Array.isArray(categories));
      assert.ok(categories.length > 0);
      // Check uniqueness
      const unique = [...new Set(categories)];
      assert.strictEqual(unique.length, categories.length);
    });
  });
});

describe('QuicklinksService', () => {
  let service;

  beforeEach(() => {
    service = new QuicklinksService();
  });

  describe('getDefaultQuicklinks', () => {
    it('should return default quicklinks', () => {
      const links = service.getDefaultQuicklinks();
      assert.ok(Array.isArray(links));
      assert.ok(links.length > 0);
      assert.ok(links[0].title);
      assert.ok(links[0].url);
      assert.ok(links[0].icon);
    });

    it('should include development links', () => {
      const links = service.getDefaultQuicklinks();
      const hasDev = links.some(l => l.category === 'development');
      assert.ok(hasDev);
    });

    it('should include Linux-specific links', () => {
      const links = service.getDefaultQuicklinks();
      const hasLinux = links.some(l => l.category === 'linux');
      assert.ok(hasLinux);
    });
  });

  describe('getQuicklinks', () => {
    it('should return all quicklinks when no query', async () => {
      const links = await service.getQuicklinks();
      assert.ok(Array.isArray(links));
      assert.ok(links.length > 0);
    });

    it('should filter by query', async () => {
      const links = await service.getQuicklinks('github');
      assert.ok(Array.isArray(links));
      links.forEach(l => {
        const searchable = `${l.title} ${l.url} ${l.category}`.toLowerCase();
        assert.ok(searchable.includes('github'));
      });
    });
  });

  describe('getCategories', () => {
    it('should return unique categories', async () => {
      const categories = await service.getCategories();
      assert.ok(Array.isArray(categories));
      assert.ok(categories.length > 0);
      const unique = [...new Set(categories)];
      assert.strictEqual(unique.length, categories.length);
    });
  });
});

describe('HistoryService', () => {
  let service;

  beforeEach(() => {
    service = new HistoryService();
  });

  describe('addItem', () => {
    it('should add item to history', async () => {
      const result = await service.addItem('apps', { id: 'test-1', name: 'Test App' });
      assert.strictEqual(result.success, true);
    });

    it('should track count for repeated items', async () => {
      await service.addItem('apps', { id: 'test-2', name: 'Test App 2' });
      await service.addItem('apps', { id: 'test-2', name: 'Test App 2' });
      const recent = await service.getRecent('apps', 5);
      const item = recent.find(i => i.id === 'test-2');
      assert.ok(item);
      assert.ok(item.count >= 1);
    });
  });

  describe('getRecent', () => {
    it('should return recent items', async () => {
      const recent = await service.getRecent('apps', 10);
      assert.ok(Array.isArray(recent));
    });

    it('should respect limit', async () => {
      const recent = await service.getRecent('apps', 3);
      assert.ok(recent.length <= 3);
    });
  });

  describe('getStats', () => {
    it('should return statistics', async () => {
      const stats = await service.getStats();
      assert.ok(typeof stats.totalApps === 'number');
      assert.ok(typeof stats.totalCommands === 'number');
      assert.ok(typeof stats.totalFiles === 'number');
      assert.ok(typeof stats.totalSearches === 'number');
    });
  });

  describe('clear', () => {
    it('should clear history for specific type', async () => {
      await service.addItem('commands', { value: 'test-cmd' });
      const result = await service.clear('commands');
      assert.strictEqual(result.success, true);
      const recent = await service.getRecent('commands', 10);
      assert.strictEqual(recent.length, 0);
    });
  });
});
