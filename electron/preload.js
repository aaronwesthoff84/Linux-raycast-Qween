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
  
  // Window control
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  
  // Events
  onShowWindow: (callback) => {
    ipcRenderer.on('show-window', callback);
  }
});
