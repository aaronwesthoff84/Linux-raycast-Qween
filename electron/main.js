const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, shell } = require('electron');
const path = require('path');
const ClipboardService = require('./services/ClipboardService');
const NotesService = require('./services/NotesService');
const CalculatorService = require('./services/CalculatorService');
const WebSearchService = require('./services/WebSearchService');
const AIService = require('./services/AIService');
const WindowManagerService = require('./services/WindowManagerService');
const FileSearchService = require('./services/FileSearchService');
const EmojiService = require('./services/EmojiService');
const SystemCommandService = require('./services/SystemCommandService');
const ScriptService = require('./services/ScriptService');
const SnippetsService = require('./services/SnippetsService');
const QuicklinksService = require('./services/QuicklinksService');
const HistoryService = require('./services/HistoryService');

let mainWindow;
let clipboardService;
let notesService;
let scriptService;
let snippetsService;
let quicklinksService;
let historyService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../public/index.html'));

  // Hide window on blur
  mainWindow.on('blur', () => {
    mainWindow.hide();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  
  // Initialize services
  clipboardService = new ClipboardService();
  notesService = new NotesService();
  scriptService = new ScriptService();
  snippetsService = new SnippetsService();
  quicklinksService = new QuicklinksService();
  historyService = new HistoryService();

  // Register global shortcut (Ctrl+Space or Cmd+Space)
  const ret = globalShortcut.register('CommandOrControl+Space', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.webContents.send('show-window');
    }
  });

  if (!ret) {
    console.log('Failed to register global shortcut');
  }
});

// IPC handlers for app functionality
ipcMain.handle('search-apps', async (event, query) => {
  const { execSync } = require('child_process');
  try {
    // Search for .desktop files in common locations
    const desktopFiles = execSync('find /usr/share/applications ~/.local/share/applications -name "*.desktop" 2>/dev/null').toString().split('\n').filter(f => f);
    
    const apps = desktopFiles.map(file => {
      try {
        const content = execSync(`cat "${file}"`).toString();
        const nameMatch = content.match(/Name=(.+)/);
        const execMatch = content.match(/Exec=(.+)/);
        const iconMatch = content.match(/Icon=(.+)/);
        
        if (nameMatch && execMatch) {
          return {
            name: nameMatch[1].split('\n')[0],
            exec: execMatch[1].split('\n')[0],
            icon: iconMatch ? iconMatch[1] : 'application',
            file: file
          };
        }
      } catch (e) {
        return null;
      }
    }).filter(app => app !== null);

    return apps;
  } catch (error) {
    console.error('Error searching apps:', error);
    return [];
  }
});

ipcMain.handle('launch-app', async (event, execCommand) => {
  const { exec } = require('child_process');
  return new Promise((resolve) => {
    exec(`${execCommand} &`, (error) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true });
      }
    });
  });
});

// Clipboard handlers
ipcMain.handle('get-clipboard-history', async (event, limit) => {
  return clipboardService.getHistory(limit);
});

ipcMain.handle('add-clipboard-item', async (event, item) => {
  return await clipboardService.addItem(item);
});

ipcMain.handle('clear-clipboard', async () => {
  await clipboardService.clearHistory();
  return { success: true };
});

ipcMain.handle('delete-clipboard-item', async (event, index) => {
  return await clipboardService.deleteItem(index);
});

ipcMain.handle('read-clipboard', () => {
  return clipboard.readText();
});

ipcMain.handle('write-clipboard', (event, text) => {
  clipboard.writeText(text);
  return { success: true };
});

// Notes handlers
ipcMain.handle('get-notes', async (event, query) => {
  return notesService.getNotes(query);
});

ipcMain.handle('create-note', async (event, title, content) => {
  return await notesService.createNote(title, content);
});

ipcMain.handle('update-note', async (event, id, updates) => {
  return await notesService.updateNote(id, updates);
});

ipcMain.handle('delete-note', async (event, id) => {
  return await notesService.deleteNote(id);
});

// Calculator handlers
ipcMain.handle('calculate', async (event, expression) => {
  return await CalculatorService.evaluate(expression);
});

// Web search handlers
ipcMain.handle('web-search', async (event, query, engine) => {
  return await WebSearchService.search(query, engine);
});

ipcMain.handle('get-search-suggestions', async (event, query) => {
  return WebSearchService.getSuggestions(query);
});

// AI Chat handlers
ipcMain.handle('ai-chat', async (event, prompt, history) => {
  return await AIService.chat(prompt, history);
});

ipcMain.handle('ai-execute-command', async (event, command) => {
  return await AIService.executeSystemCommand(command);
});

ipcMain.handle('ai-summarize', async (event, text) => {
  return await AIService.summarize(text);
});

// Window Management handlers
ipcMain.handle('get-windows', async (event, query) => {
  const windows = await WindowManagerService.getAllWindows();
  if (query) {
    return WindowManagerService.searchWindows(query);
  }
  return windows;
});

ipcMain.handle('focus-window', async (event, windowId) => {
  return await WindowManagerService.focusWindow(windowId);
});

ipcMain.handle('close-window', async (event, windowId) => {
  return await WindowManagerService.closeWindow(windowId);
});

ipcMain.handle('tile-left', async (event, windowId) => {
  return await WindowManagerService.tileLeft(windowId);
});

ipcMain.handle('tile-right', async (event, windowId) => {
  return await WindowManagerService.tileRight(windowId);
});

ipcMain.handle('tile-maximized', async (event, windowId) => {
  return await WindowManagerService.tileMaximized(windowId);
});

// File Search handlers
ipcMain.handle('search-files', async (event, query, options) => {
  return await FileSearchService.search(query, options);
});

ipcMain.handle('open-file', async (event, filePath) => {
  return await FileSearchService.openFile(filePath);
});

ipcMain.handle('reveal-file', async (event, filePath) => {
  return await FileSearchService.revealInFileManager(filePath);
});

ipcMain.handle('get-recent-files', async (event, limit) => {
  return await FileSearchService.getRecentFiles(limit);
});

// Emoji handlers
ipcMain.handle('search-emojis', async (event, query) => {
  return EmojiService.search(query);
});

ipcMain.handle('get-all-emojis', () => {
  return EmojiService.getAll();
});

ipcMain.handle('get-emoji-categories', () => {
  return EmojiService.getCategories();
});

// System Command handlers
ipcMain.handle('get-system-commands', async () => {
  return SystemCommandService.getAvailableCommands();
});

ipcMain.handle('execute-system-command', async (event, command, value) => {
  return await SystemCommandService.executeByName(command, value);
});

ipcMain.handle('set-volume', async (event, level) => {
  return await SystemCommandService.setVolume(level);
});

ipcMain.handle('set-brightness', async (event, level) => {
  return await SystemCommandService.setBrightness(level);
});

// Script handlers
ipcMain.handle('get-scripts', async () => {
  return await scriptService.getScripts();
});

ipcMain.handle('create-script', async (event, name, content, type) => {
  return await scriptService.createScript(name, content, type);
});

ipcMain.handle('read-script', async (event, filename) => {
  return await scriptService.readScript(filename);
});

ipcMain.handle('update-script', async (event, filename, content) => {
  return await scriptService.updateScript(filename, content);
});

ipcMain.handle('delete-script', async (event, filename) => {
  return await scriptService.deleteScript(filename);
});

ipcMain.handle('execute-script', async (event, filename, args) => {
  return await scriptService.executeScript(filename, args);
});

ipcMain.handle('run-command', async (event, command) => {
  return await scriptService.runCommand(command);
});

ipcMain.handle('get-script-templates', () => {
  return scriptService.getTemplates();
});

// Snippets handlers
ipcMain.handle('get-snippets', async (event, query) => {
  return await snippetsService.getSnippets(query);
});

ipcMain.handle('create-snippet', async (event, shortcut, title, content, category) => {
  return await snippetsService.createSnippet(shortcut, title, content, category);
});

ipcMain.handle('update-snippet', async (event, id, updates) => {
  return await snippetsService.updateSnippet(id, updates);
});

ipcMain.handle('delete-snippet', async (event, id) => {
  return await snippetsService.deleteSnippet(id);
});

ipcMain.handle('get-snippet-categories', async () => {
  return await snippetsService.getCategories();
});

// Quicklinks handlers
ipcMain.handle('get-quicklinks', async (event, query) => {
  return await quicklinksService.getQuicklinks(query);
});

ipcMain.handle('create-quicklink', async (event, title, url, icon, category) => {
  return await quicklinksService.createQuicklink(title, url, icon, category);
});

ipcMain.handle('update-quicklink', async (event, id, updates) => {
  return await quicklinksService.updateQuicklink(id, updates);
});

ipcMain.handle('delete-quicklink', async (event, id) => {
  return await quicklinksService.deleteQuicklink(id);
});

ipcMain.handle('get-quicklink-categories', async () => {
  return await quicklinksService.getCategories();
});

ipcMain.handle('open-quicklink', async (event, url) => {
  shell.openExternal(url);
  return { success: true };
});

// History handlers
ipcMain.handle('add-history-item', async (event, type, item) => {
  return await historyService.addItem(type, item);
});

ipcMain.handle('get-recent-history', async (event, type, limit) => {
  return await historyService.getRecent(type, limit);
});

ipcMain.handle('get-frequent-history', async (event, type, limit) => {
  return await historyService.getFrequent(type, limit);
});

ipcMain.handle('search-history', async (event, type, query) => {
  return await historyService.search(type, query);
});

ipcMain.handle('clear-history', async (event, type) => {
  return await historyService.clear(type);
});

ipcMain.handle('get-history-stats', async () => {
  return await historyService.getStats();
});

// Window control
ipcMain.handle('hide-window', () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
