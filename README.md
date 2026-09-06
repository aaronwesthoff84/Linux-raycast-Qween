# LinuxCast - Raycast Alternative for Linux

A powerful, keyboard-driven launcher for Linux that brings Raycast-like functionality to your desktop.

## Features

- 🚀 **Application Launcher**: Quickly find and launch any installed application
- ⌨️ **Global Hotkey**: Press `Ctrl+Space` (or `Cmd+Space`) to open from anywhere
- 🔍 **Fuzzy Search**: Fast, intelligent search powered by Fuse.js
- 💻 **Command Execution**: Run terminal commands directly
- 📋 **Clipboard History**: Access your clipboard history (coming soon)
- 🎨 **Beautiful UI**: Modern, translucent design with smooth animations
- ⚡ **Keyboard First**: Navigate entirely with keyboard shortcuts

## Architecture

This is a full-stack Electron application with:

### Backend (Electron Main Process)
- **electron/main.js**: Main Electron process handling window management, global shortcuts, and IPC
- **electron/preload.js**: Secure bridge between renderer and main process

### Frontend (React)
- **src/App.jsx**: Main React component with search and results display
- **src/index.js**: React entry point
- **public/index.html**: HTML template with embedded styles

### Key Technologies
- **Electron**: Cross-platform desktop app framework
- **React**: UI component library
- **Fuse.js**: Lightweight fuzzy search
- **Node.js**: Backend runtime

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Linux desktop environment (GNOME, KDE, XFCE, etc.)

### Setup

```bash
# Install dependencies
npm install

# Start in development mode
npm run dev

# Build for production
npm run build
```

## Usage

1. **Launch the app**: `npm start`
2. **Open launcher**: Press `Ctrl+Space` (configurable)
3. **Search applications**: Type to filter installed apps
4. **Launch**: Press `Enter` or click on an app
5. **Navigate**: Use `↑` `↓` arrow keys
6. **Close**: Press `Esc` or click outside

## Configuration

### Global Shortcut
Edit `electron/main.js` to change the hotkey:
```javascript
globalShortcut.register('CommandOrControl+Space', () => { ... });
```

### Window Appearance
Modify the BrowserWindow options in `electron/main.js`:
```javascript
new BrowserWindow({
  width: 800,
  height: 600,
  // ... other options
});
```

## Building Distribution Packages

```bash
# Build AppImage and .deb packages
npm run build
```

Output will be in the `dist/` folder.

## Extending Functionality

### Adding New Commands
Add custom commands in `src/App.jsx`:
```javascript
const executeQuickCommand = async (command) => {
  const result = await window.electronAPI.executeCommand(command);
  // Handle result
};
```

### Adding Clipboard Support
Implement clipboard history using Electron's clipboard API in `electron/main.js`.

### Adding File Search
Use Node.js `fs` module to search files and expose via IPC.

## Project Structure

```
linux-cast/
├── electron/
│   ├── main.js          # Electron main process
│   └── preload.js       # Preload script for IPC
├── src/
│   ├── App.jsx          # Main React component
│   ├── index.js         # React entry point
│   ├── components/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   └── utils/           # Utility functions
├── public/
│   └── index.html       # HTML template
├── package.json         # Dependencies and scripts
└── README.md           # This file
```

## Roadmap

- [ ] Clipboard history management
- [ ] Snippet expansion
- [ ] Calculator mode
- [ ] Web search integration
- [ ] Extension system
- [ ] Settings UI
- [ ] System controls (volume, brightness)
- [ ] Window management commands
- [ ] Custom themes
- [ ] Plugin API

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

Inspired by [Raycast](https://www.raycast.com/) for macOS.
