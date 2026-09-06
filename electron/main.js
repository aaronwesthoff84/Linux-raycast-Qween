const { app, BrowserWindow, globalShortcut, ipcMain, clipboard } = require('electron');
const path = require('path');
const ClipboardService = require('./services/ClipboardService');
const NotesService = require('./services/NotesService');
const CalculatorService = require('./services/CalculatorService');
const WebSearchService = require('./services/WebSearchService');
const AIService = require('./services/AIService');
const WindowManagerService = require('./services/WindowManagerService');
const FileSearchService = require('./services/FileSearchService');
const EmojiService = require('./services/EmojiService');

let mainWindow;
let clipboardService;
let notesService;

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
