const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  searchApps: (query) => ipcRenderer.invoke('search-apps', query),
  launchApp: (execCommand) => ipcRenderer.invoke('launch-app', execCommand),
  executeCommand: (command) => ipcRenderer.invoke('execute-command', command),
  onShowWindow: (callback) => {
    ipcRenderer.on('show-window', callback);
  }
});
