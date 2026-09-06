const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // App launching
  searchApps: (query) => ipcRenderer.invoke('search-apps', query),
  launchApp: (execCommand) => ipcRenderer.invoke('launch-app', execCommand),

  // Clipboard
  getClipboardHistory: (limit) => ipcRenderer.invoke('get-clipboard-history', limit),
  addClipboardItem: (item) => ipcRenderer.invoke('add-clipboard-item', item),
  clearClipboard: () => ipcRenderer.invoke('clear-clipboard'),
  deleteClipboardItem: (index) => ipcRenderer.invoke('delete-clipboard-item', index),
  readClipboard: () => ipcRenderer.invoke('read-clipboard'),
  writeClipboard: (text) => ipcRenderer.invoke('write-clipboard', text),

  // Notes
  getNotes: (query) => ipcRenderer.invoke('get-notes', query),
  createNote: (title, content) => ipcRenderer.invoke('create-note', title, content),
  updateNote: (id, updates) => ipcRenderer.invoke('update-note', id, updates),
  deleteNote: (id) => ipcRenderer.invoke('delete-note', id),

  // Calculator
  calculate: (expression) => ipcRenderer.invoke('calculate', expression),

  // Web Search
  webSearch: (query, engine) => ipcRenderer.invoke('web-search', query, engine),
  getSearchSuggestions: (query) => ipcRenderer.invoke('get-search-suggestions', query),

  // AI Chat
  aiChat: (prompt, history) => ipcRenderer.invoke('ai-chat', prompt, history),
  aiExecuteCommand: (command) => ipcRenderer.invoke('ai-execute-command', command),
  aiSummarize: (text) => ipcRenderer.invoke('ai-summarize', text),

  // Window Management
  getWindows: (query) => ipcRenderer.invoke('get-windows', query),
  focusWindow: (windowId) => ipcRenderer.invoke('focus-window', windowId),
  closeWindow: (windowId) => ipcRenderer.invoke('close-window', windowId),
  tileLeft: (windowId) => ipcRenderer.invoke('tile-left', windowId),
  tileRight: (windowId) => ipcRenderer.invoke('tile-right', windowId),
  tileMaximized: (windowId) => ipcRenderer.invoke('tile-maximized', windowId),

  // File Search
  searchFiles: (query, options) => ipcRenderer.invoke('search-files', query, options),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  revealFile: (filePath) => ipcRenderer.invoke('reveal-file', filePath),
  getRecentFiles: (limit) => ipcRenderer.invoke('get-recent-files', limit),

  // Emoji
  searchEmojis: (query) => ipcRenderer.invoke('search-emojis', query),
  getAllEmojis: () => ipcRenderer.invoke('get-all-emojis'),
  getEmojiCategories: () => ipcRenderer.invoke('get-emoji-categories'),

  // System Commands
  getSystemCommands: () => ipcRenderer.invoke('get-system-commands'),
  executeSystemCommand: (command, value) => ipcRenderer.invoke('execute-system-command', command, value),
  setVolume: (level) => ipcRenderer.invoke('set-volume', level),
  setBrightness: (level) => ipcRenderer.invoke('set-brightness', level),

  // Scripts
  getScripts: () => ipcRenderer.invoke('get-scripts'),
  createScript: (name, content, type) => ipcRenderer.invoke('create-script', name, content, type),
  readScript: (filename) => ipcRenderer.invoke('read-script', filename),
  updateScript: (filename, content) => ipcRenderer.invoke('update-script', filename, content),
  deleteScript: (filename) => ipcRenderer.invoke('delete-script', filename),
  executeScript: (filename, args) => ipcRenderer.invoke('execute-script', filename, args),
  runCommand: (command) => ipcRenderer.invoke('run-command', command),
  getScriptTemplates: () => ipcRenderer.invoke('get-script-templates'),

  // Snippets
  getSnippets: (query) => ipcRenderer.invoke('get-snippets', query),
  createSnippet: (shortcut, title, content, category) => ipcRenderer.invoke('create-snippet', shortcut, title, content, category),
  updateSnippet: (id, updates) => ipcRenderer.invoke('update-snippet', id, updates),
  deleteSnippet: (id) => ipcRenderer.invoke('delete-snippet', id),
  getSnippetCategories: () => ipcRenderer.invoke('get-snippet-categories'),

  // Quicklinks
  getQuicklinks: (query) => ipcRenderer.invoke('get-quicklinks', query),
  createQuicklink: (title, url, icon, category) => ipcRenderer.invoke('create-quicklink', title, url, icon, category),
  updateQuicklink: (id, updates) => ipcRenderer.invoke('update-quicklink', id, updates),
  deleteQuicklink: (id) => ipcRenderer.invoke('delete-quicklink', id),
  getQuicklinkCategories: () => ipcRenderer.invoke('get-quicklink-categories'),
  openQuicklink: (url) => ipcRenderer.invoke('open-quicklink', url),

  // History
  addHistoryItem: (type, item) => ipcRenderer.invoke('add-history-item', type, item),
  getRecentHistory: (type, limit) => ipcRenderer.invoke('get-recent-history', type, limit),
  getFrequentHistory: (type, limit) => ipcRenderer.invoke('get-frequent-history', type, limit),
  searchHistory: (type, query) => ipcRenderer.invoke('search-history', type, query),
  clearHistory: (type) => ipcRenderer.invoke('clear-history', type),
  getHistoryStats: () => ipcRenderer.invoke('get-history-stats'),

  // Window control
  hideWindow: () => ipcRenderer.invoke('hide-window'),

  // Events
  onShowWindow: (callback) => {
    ipcRenderer.on('show-window', callback);
  }
});
