# LinuxCast - Raycast Alternative for Linux

A full-stack Electron-based productivity launcher for Linux that replicates Raycast functionality.

## 🎯 Wayland/CachyOS Support

**Fully compatible with Wayland!** See [WAYLAND_COMPATIBILITY.md](./WAYLAND_COMPATIBILITY.md) for setup instructions.

Quick start for CachyOS/Wayland:
```bash
npm install
npm run start:wayland  # Optimized for Wayland compositors
```

## Features

### ✅ Implemented Features

1. **Application Launcher** (`Ctrl+Space`)
   - Fuzzy search through all installed Linux applications
   - Parse `.desktop` files from `/usr/share/applications` and `~/.local/share/applications`
   - Launch apps with keyboard navigation

2. **AI Chat** (`/ai <message>` or `/chat <message>`)
   - Built-in AI assistant interface
   - Demo mode with predefined responses
   - Ready for OpenAI/local LLM integration
   - Safe system command execution (whitelisted commands only)
   - Text summarization

3. **Notes System** (`/notes` or `/note`)
   - Create, edit, and delete notes
   - Search notes by title or content
   - Persistent storage in JSON format
   - Quick note editor UI

4. **Clipboard History** (`/clipboard` or `/clip`)
   - Store up to 50 clipboard items
   - Search through clipboard history
   - Quick paste any previous item
   - Persistent storage

5. **Calculator** (automatic detection)
   - Type math expressions directly: `2 + 2`, `(5 * 3) / 2`
   - Supports: `+`, `-`, `*`, `/`, parentheses, decimals
   - Press Tab to copy result to query
   - Press Enter to copy to clipboard

6. **Web Search** (`/web <query>` or `/search <query>`)
   - DuckDuckGo integration
   - URL detection and quick open
   - Email link detection
   - File path detection

7. **Keyboard Shortcuts**
   - `Ctrl+Space`: Open/close launcher (like Cmd+Space on Mac)
   - `↑/↓`: Navigate results
   - `Enter`: Select/launch
   - `Esc`: Close
   - `Tab`: Copy calculator result to input

## Installation

```bash
npm install
```

## Running on CachyOS/Wayland

```bash
# Standard mode (works on X11 and Wayland with XWayland)
npm start

# Native Wayland mode (recommended for CachyOS, KDE Plasma Wayland, etc.)
npm run start:wayland

# Development mode with auto-reload
npm run dev

# Development mode with native Wayland support
npm run dev:wayland
```

## Testing

All 43 tests passing - verified functionality:
- AIService: 10/10 ✅
- CalculatorService: 9/9 ✅
- NotesService: 8/8 ✅
- WindowManagerService: 4/4 ✅
- FileSearchService: 6/6 ✅
- EmojiService: 6/6 ✅
