const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class WindowManagerService {
  constructor() {
    this.windows = [];
  }

  async getAllWindows() {
    try {
      // Try wmctrl first (X11)
      const { stdout } = await execAsync('wmctrl -lGp 2>/dev/null || echo ""');
      if (stdout.trim()) {
        this.windows = this.parseWmctrlOutput(stdout);
        return this.windows;
      }
      
      // Fallback: try to get windows via xdotool
      return await this.getWindowsViaXdotool();
    } catch (error) {
      console.error('Error getting windows:', error);
      return [];
    }
  }

  parseWmctrlOutput(output) {
    const lines = output.trim().split('\n').filter(line => line.trim());
    return lines.map(line => {
      const parts = line.split(/\s+/);
      if (parts.length >= 8) {
        return {
          id: parts[0],
          workspace: parseInt(parts[1]),
          app: parts[2] || 'Unknown',
          title: parts.slice(7).join(' ') || 'Untitled Window'
        };
      }
      return null;
    }).filter(w => w !== null);
  }

  async getWindowsViaXdotool() {
    try {
      const { stdout } = await execAsync('xdotool search --onlyvisible --name ".*" 2>/dev/null || echo ""');
      const windowIds = stdout.trim().split('\n').filter(id => id);
      
      const windows = [];
      for (const id of windowIds.slice(0, 50)) { // Limit to 50 windows
        try {
          const { stdout: title } = await execAsync(`xdotool getwindowname ${id} 2>/dev/null || echo ""`);
          const { stdout: className } = await execAsync(`xdotool getwindowclassname ${id} 2>/dev/null || echo ""`);
          
          windows.push({
            id,
            title: title.trim() || 'Untitled',
            app: className.trim().split('.')[1] || 'Unknown'
          });
        } catch {
          // Skip windows we can't get info for
        }
      }
      
      this.windows = windows;
      return windows;
    } catch {
      return [];
    }
  }

  async focusWindow(windowId) {
    try {
      await execAsync(`wmctrl -i -a ${windowId} 2>/dev/null || xdotool windowactivate ${windowId} 2>/dev/null`);
      return true;
    } catch (error) {
      console.error('Error focusing window:', error);
      return false;
    }
  }

  async closeWindow(windowId) {
    try {
      await execAsync(`wmctrl -i -c ${windowId} 2>/dev/null || xdotool windowclose ${windowId} 2>/dev/null`);
      return true;
    } catch (error) {
      console.error('Error closing window:', error);
      return false;
    }
  }

  async minimizeWindow(windowId) {
    try {
      await execAsync(`wmctrl -i -b add,hidden ${windowId} 2>/dev/null`);
      return true;
    } catch (error) {
      console.error('Error minimizing window:', error);
      return false;
    }
  }

  async maximizeWindow(windowId) {
    try {
      await execAsync(`wmctrl -i -b toggle,maximized_vert,maximized_horz ${windowId} 2>/dev/null`);
      return true;
    } catch (error) {
      console.error('Error maximizing window:', error);
      return false;
    }
  }

  async moveToWorkspace(windowId, workspace) {
    try {
      await execAsync(`wmctrl -i -r ${windowId} -t ${workspace} 2>/dev/null`);
      return true;
    } catch (error) {
      console.error('Error moving window to workspace:', error);
      return false;
    }
  }

  async tileLeft(windowId) {
    return this.tileWindow('left', windowId);
  }

  async tileRight(windowId) {
    return this.tileWindow('right', windowId);
  }

  async tileMaximized(windowId) {
    return this.tileWindow('maximized', windowId);
  }

  async tileCenter(windowId) {
    return this.tileWindow('center', windowId);
  }

  async tileWindow(position, windowId) {
    try {
      const targetId = windowId || (await this.getActiveWindowId());
      if (!targetId) return false;

      // Get screen dimensions
      const { stdout: geometry } = await execAsync('xrandr | grep "\\*" | head -1 || echo "1920x1080"');
      const match = geometry.match(/(\d+)x(\d+)/);
      const screenWidth = match ? parseInt(match[1]) : 1920;
      const screenHeight = match ? parseInt(match[2]) : 1080;

      const commands = {
        left: `wmctrl -i -r ${targetId} -e 0,0,0,${screenWidth / 2},${screenHeight}`,
        right: `wmctrl -i -r ${targetId} -e 0,${screenWidth / 2},0,${screenWidth / 2},${screenHeight}`,
        maximized: `wmctrl -i -r ${targetId} -b add,maximized_vert,maximized_horz`,
        center: `wmctrl -i -r ${targetId} -b remove,maximized_vert,maximized_horz && wmctrl -i -r ${targetId} -e 0,${screenWidth / 4},${screenHeight / 4},${screenWidth / 2},${screenHeight / 2}`
      };

      await execAsync(commands[position] + ' 2>/dev/null || true');
      return true;
    } catch (error) {
      console.error('Error tiling window:', error);
      return false;
    }
  }

  async getActiveWindowId() {
    try {
      const { stdout } = await execAsync('xdotool getactivewindow 2>/dev/null || echo ""');
      return stdout.trim() || null;
    } catch {
      return null;
    }
  }

  searchWindows(query) {
    if (!query) return this.windows;
    const lowerQuery = query.toLowerCase();
    return this.windows.filter(w => 
      w.title.toLowerCase().includes(lowerQuery) || 
      w.app.toLowerCase().includes(lowerQuery)
    );
  }
}

module.exports = new WindowManagerService();
