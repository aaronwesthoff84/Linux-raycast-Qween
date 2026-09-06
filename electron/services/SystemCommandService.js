const { exec } = require('child_process');
const os = require('os');

/**
 * SystemCommandService - System controls for Linux
 * Handles: shutdown, restart, sleep, lock, volume, brightness, etc.
 */
class SystemCommandService {
  // Safe whitelist of allowed commands
  static allowedCommands = [
    'systemctl poweroff',
    'systemctl reboot',
    'systemctl suspend',
    'systemctl hibernate',
    'loginctl lock-session',
    'pactl set-sink-volume',
    'pactl set-sink-mute',
    'brightnessctl set',
    'nmcli radio wifi',
    'bluetoothctl power',
    'playerctl play-pause',
    'playerctl next',
    'playerctl previous',
    'playerctl stop'
  ];

  /**
   * Execute a system command safely
   */
  static async execute(command) {
    // Check if command is in whitelist
    const isAllowed = this.allowedCommands.some(allowed => 
      command.startsWith(allowed)
    );

    if (!isAllowed) {
      return { success: false, error: 'Command not allowed for security reasons' };
    }

    return new Promise((resolve) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: stderr || error.message });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });
  }

  /**
   * Power off the system
   */
  static async powerOff() {
    return this.execute('systemctl poweroff');
  }

  /**
   * Restart the system
   */
  static async restart() {
    return this.execute('systemctl reboot');
  }

  /**
   * Suspend/Sleep the system
   */
  static async suspend() {
    return this.execute('systemctl suspend');
  }

  /**
   * Hibernate the system
   */
  static async hibernate() {
    return this.execute('systemctl hibernate');
  }

  /**
   * Lock the screen
   */
  static async lockScreen() {
    return this.execute('loginctl lock-session');
  }

  /**
   * Set volume level (0-100)
   */
  static async setVolume(level) {
    const clampedLevel = Math.max(0, Math.min(100, level));
    return this.execute(`pactl set-sink-volume @DEFAULT_SINK@ ${clampedLevel}%`);
  }

  /**
   * Mute/unmute audio
   */
  static async toggleMute() {
    return this.execute('pactl set-sink-mute @DEFAULT_SINK@ toggle');
  }

  /**
   * Set brightness level
   */
  static async setBrightness(level) {
    const clampedLevel = Math.max(0, Math.min(100, level));
    return this.execute(`brightnessctl set ${clampedLevel}%`);
  }

  /**
   * Toggle WiFi
   */
  static async toggleWifi(enable) {
    const action = enable ? 'on' : 'off';
    return this.execute(`nmcli radio wifi ${action}`);
  }

  /**
   * Toggle Bluetooth
   */
  static async toggleBluetooth(enable) {
    const action = enable ? 'on' : 'off';
    return this.execute(`bluetoothctl power ${action}`);
  }

  /**
   * Media controls
   */
  static async mediaPlayPause() {
    return this.execute('playerctl play-pause');
  }

  static async mediaNext() {
    return this.execute('playerctl next');
  }

  static async mediaPrevious() {
    return this.execute('playerctl previous');
  }

  static async mediaStop() {
    return this.execute('playerctl stop');
  }

  /**
   * Get list of available system commands
   */
  static getAvailableCommands() {
    return [
      { name: 'Shutdown', command: 'poweroff', description: 'Power off the system', icon: '⏻' },
      { name: 'Restart', command: 'restart', description: 'Reboot the system', icon: '🔄' },
      { name: 'Sleep', command: 'suspend', description: 'Suspend to RAM', icon: '😴' },
      { name: 'Hibernate', command: 'hibernate', description: 'Suspend to disk', icon: '💤' },
      { name: 'Lock Screen', command: 'lock', description: 'Lock the session', icon: '🔒' },
      { name: 'Volume Up', command: 'volume-up', description: 'Increase volume', icon: '🔊' },
      { name: 'Volume Down', command: 'volume-down', description: 'Decrease volume', icon: '🔉' },
      { name: 'Mute', command: 'mute', description: 'Toggle mute', icon: '🔇' },
      { name: 'Brightness Up', command: 'brightness-up', description: 'Increase brightness', icon: '☀️' },
      { name: 'Brightness Down', command: 'brightness-down', description: 'Decrease brightness', icon: '🌙' },
      { name: 'WiFi On', command: 'wifi-on', description: 'Enable WiFi', icon: '📶' },
      { name: 'WiFi Off', command: 'wifi-off', description: 'Disable WiFi', icon: '📴' },
      { name: 'Bluetooth On', command: 'bluetooth-on', description: 'Enable Bluetooth', icon: '🦷' },
      { name: 'Bluetooth Off', command: 'bluetooth-off', description: 'Disable Bluetooth', icon: '🚫' },
      { name: 'Play/Pause', command: 'play-pause', description: 'Media play/pause', icon: '⏯️' },
      { name: 'Next Track', command: 'next', description: 'Next media track', icon: '⏭️' },
      { name: 'Previous Track', command: 'previous', description: 'Previous media track', icon: '⏮️' }
    ];
  }

  /**
   * Execute command by name
   */
  static async executeByName(name, value) {
    switch (name) {
      case 'poweroff':
        return this.powerOff();
      case 'restart':
        return this.restart();
      case 'suspend':
        return this.suspend();
      case 'hibernate':
        return this.hibernate();
      case 'lock':
        return this.lockScreen();
      case 'volume-up':
        return this.setVolume(100);
      case 'volume-down':
        return this.setVolume(0);
      case 'mute':
        return this.toggleMute();
      case 'brightness-up':
        return this.setBrightness(100);
      case 'brightness-down':
        return this.setBrightness(0);
      case 'wifi-on':
        return this.toggleWifi(true);
      case 'wifi-off':
        return this.toggleWifi(false);
      case 'bluetooth-on':
        return this.toggleBluetooth(true);
      case 'bluetooth-off':
        return this.toggleBluetooth(false);
      case 'play-pause':
        return this.mediaPlayPause();
      case 'next':
        return this.mediaNext();
      case 'previous':
        return this.mediaPrevious();
      default:
        return { success: false, error: 'Unknown command' };
    }
  }
}

module.exports = SystemCommandService;
