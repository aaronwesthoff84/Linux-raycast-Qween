const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

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
      nodeIntegration: true,
      contextIsolation: false,
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

  // Register global shortcut (Cmd+Space or Alt+Space)
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

ipcMain.handle('execute-command', async (event, command) => {
  const { exec } = require('child_process');
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({
        success: !error,
        output: stdout,
        error: stderr
      });
    });
  });
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
