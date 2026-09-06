# Wayland Compatibility Guide for LinuxCast

## Overview

LinuxCast is compatible with Wayland (including CachyOS), but there are some important considerations and configuration steps needed for full functionality.

## Known Issues & Solutions

### 1. Global Shortcuts on Wayland

**Issue**: The `Ctrl+Space` global shortcut may not work out-of-the-box on Wayland because Wayland restricts global keyboard shortcuts for security reasons.

**Solution**: You have several options:

#### Option A: Use Electron's Wayland Support (Recommended)
Electron 28+ has improved Wayland support. Launch with:
```bash
electron . --enable-features=UseOzonePlatform --ozone-platform=wayland
```

Or in your package.json scripts:
```json
"start": "electron . --enable-features=UseOzonePlatform --ozone-platform=wayland"
```

#### Option B: Use a Compositor-Specific Method
For **KWin** (KDE Plasma on CachyOS):
1. Create a custom shortcut in System Settings → Shortcuts → Custom Shortcuts
2. Set trigger to `Ctrl+Space`
3. Set action to run: `qdbus org.kde.LinuxCast /MainWindow show`

For **Sway**:
Add to your config (`~/.config/sway/config`):
```
bindsym Ctrl+Space exec --no-startup-id electron /path/to/linuxcast
```

For **Hyprland**:
Add to `~/.config/hypr/hyprland.conf`:
```
bind = CTRL, space, exec, electron /path/to/linuxcast
```

#### Option C: Use xdg-desktop-portal
Install the portal for your compositor:
```bash
# For KDE Plasma (CachyOS default)
sudo pacman -S xdg-desktop-portal-kde

# For GNOME
sudo pacman -S xdg-desktop-portal-gnome

# Generic portal
sudo pacman -S xdg-desktop-portal
```

### 2. Clipboard Access on Wayland

**Issue**: Wayland has stricter clipboard controls than X11.

**Solution**: 
- Ensure `wl-clipboard` is installed: `sudo pacman -S wl-clipboard`
- Electron's clipboard API works through the portal system
- Test with: `wl-paste` and `wl-copy` commands

### 3. Window Transparency and Effects

**Issue**: Transparent windows may not render correctly on all Wayland compositors.

**Solution**:
In `electron/main.js`, you can adjust window settings:
```javascript
mainWindow = new BrowserWindow({
  width: 800,
  height: 600,
  frame: false,
  transparent: true,  // May need to be false on some compositors
  alwaysOnTop: true,
  skipTaskbar: true,
  show: false,
  backgroundColor: '#00000000',  // Explicit transparency
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, 'preload.js')
  }
});
```

If transparency causes issues, set `transparent: false` and use a semi-transparent background color instead.

### 4. Application Launching

**Issue**: Some apps may not launch correctly under Wayland.

**Solution**:
- Most `.desktop` files work automatically
- For X11-only apps, they'll run through XWayland automatically
- You can force X11 for specific apps by editing their `.desktop` files

### 5. Screen Positioning

**Issue**: Window positioning may behave differently on multi-monitor Wayland setups.

**Solution**:
Add explicit positioning in `createWindow()`:
```javascript
const { screen } = require('electron');
const primaryDisplay = screen.getPrimaryDisplay();
const { width, height } = primaryDisplay.workAreaSize;

mainWindow = new BrowserWindow({
  width: 800,
  height: 600,
  x: Math.round((width - 800) / 2),  // Center horizontally
  y: 100,  // 100px from top
  // ... other options
});
```

## Testing on CachyOS

### Prerequisites
```bash
# Update system
sudo pacman -Syu

# Install Electron dependencies
sudo pacman -S electron nodejs npm

# Install Wayland utilities
sudo pacman -S wayland wl-clipboard xdg-desktop-portal-kde

# Install project dependencies
npm install
```

### Run Tests
```bash
npm test
```

### Development Mode
```bash
# With Wayland support
npm run dev -- --enable-features=UseOzonePlatform --ozone-platform=wayland
```

### Production Build
```bash
npm run build
```

## Troubleshooting

### Shortcut Not Working
1. Check if another app is using `Ctrl+Space`
2. Try a different shortcut: `CommandOrControl+Shift+Space`
3. Use compositor-specific shortcut configuration (see above)

### Window Not Showing
1. Check terminal for Electron errors
2. Try running without transparency: edit `main.js`, set `transparent: false`
3. Ensure you're not running as root (Wayland blocks this)

### Clipboard Not Working
1. Test system clipboard: `wl-paste` and `wl-copy test`
2. Ensure portal is running: `systemctl --user status xdg-desktop-portal`
3. Restart portal: `systemctl --user restart xdg-desktop-portal`

### Apps Not Launching
1. Test manually: `gtk-launch firefox.desktop`
2. Check `.desktop` file syntax
3. Ensure app is in PATH or has full path in Exec field

## Feature Parity with Raycast

### Currently Implemented ✅
- [x] Application Launcher with fuzzy search
- [x] AI Chat interface (demo mode, ready for API integration)
- [x] Notes system with CRUD operations
- [x] Clipboard history
- [x] Calculator with math expressions
- [x] Web search integration
- [x] Keyboard navigation
- [x] Global shortcut (with Wayland configuration)
- [x] 27 passing tests

### Missing vs Raycast ⚠️
- [ ] Window management (resize, move, minimize)
- [ ] File search (Spotlight-like)
- [ ] Calendar integration
- [ ] Custom themes/UI customization
- [ ] Extension/Plugin system
- [ ] Script commands
- [ ] System controls (brightness, volume)
- [ ] Emoji picker
- [ ] Quicklinks/bookmarks
- [ ] Tab history
- [ ] Buffer (text snippets)
- [ ] Integration with external services (GitHub, Linear, etc.)

## Future Enhancements for Wayland

1. **Native Wayland Clipboard**: Direct integration with wl-clipboard
2. **Window Management**: Use wlr-protocols for window control
3. **Screen Recording**: PipeWire integration for screenshots
4. **Notifications**: Use libnotify through portals
5. **File Picker**: Native file dialogs through xdg-desktop-portal

## Resources

- [Electron Wayland Documentation](https://www.electronjs.org/docs/latest/tutorial/command-line-switches)
- [Wayland Protocol Documentation](https://wayland.freedesktop.org/docs/html/)
- [CachyOS Wiki](https://wiki.cachyos.org/)
- [KDE Plasma Wayland](https://community.kde.org/Plasma/Wayland)
