const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * ScriptService - Custom scripts and commands
 * Allows users to create and run custom scripts from the launcher
 */
class ScriptService {
  constructor() {
    this.scriptsDir = path.join(os.homedir(), '.linuxcast', 'scripts');
    this.ensureScriptsDir();
  }

  /**
   * Ensure scripts directory exists
   */
  ensureScriptsDir() {
    if (!fs.existsSync(this.scriptsDir)) {
      fs.mkdirSync(this.scriptsDir, { recursive: true });
    }
  }

  /**
   * Get all available scripts
   */
  async getScripts() {
    try {
      const files = fs.readdirSync(this.scriptsDir);
      const scripts = [];

      for (const file of files) {
        if (file.endsWith('.sh') || file.endsWith('.js') || file.endsWith('.py')) {
          const filePath = path.join(this.scriptsDir, file);
          const stats = fs.statSync(filePath);
          
          scripts.push({
            id: file,
            name: path.basename(file, path.extname(file)),
            filename: file,
            path: filePath,
            type: path.extname(file).substring(1),
            modified: stats.mtime,
            size: stats.size
          });
        }
      }

      return scripts.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error reading scripts:', error);
      return [];
    }
  }

  /**
   * Create a new script
   */
  async createScript(name, content, type = 'sh') {
    try {
      const filename = `${name}.${type}`;
      const filePath = path.join(this.scriptsDir, filename);
      
      fs.writeFileSync(filePath, content);
      fs.chmodSync(filePath, '755'); // Make executable
      
      return {
        success: true,
        script: {
          id: filename,
          name: name,
          filename: filename,
          path: filePath,
          type: type
        }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Read a script's content
   */
  async readScript(filename) {
    try {
      const filePath = path.join(this.scriptsDir, filename);
      const content = fs.readFileSync(filePath, 'utf8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Update a script
   */
  async updateScript(filename, content) {
    try {
      const filePath = path.join(this.scriptsDir, filename);
      fs.writeFileSync(filePath, content);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete a script
   */
  async deleteScript(filename) {
    try {
      const filePath = path.join(this.scriptsDir, filename);
      fs.unlinkSync(filePath);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute a script
   */
  async executeScript(filename, args = []) {
    const { exec } = require('child_process');
    
    try {
      const filePath = path.join(this.scriptsDir, filename);
      
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Script not found' };
      }

      const argsString = args.map(arg => `'${arg}'`).join(' ');
      const command = `${filePath} ${argsString}`;

      return new Promise((resolve) => {
        exec(command, { timeout: 30000 }, (error, stdout, stderr) => {
          if (error) {
            resolve({ 
              success: false, 
              error: stderr || error.message,
              output: stdout 
            });
          } else {
            resolve({ 
              success: true, 
              output: stdout,
              error: stderr 
            });
          }
        });
      });
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Run a quick command (one-liner)
   */
  async runCommand(command) {
    const { exec } = require('child_process');
    
    // Security: basic validation
    const dangerousPatterns = ['rm -rf /', 'mkfs', 'dd if=', ':(){:|:&};:'];
    for (const pattern of dangerousPatterns) {
      if (command.includes(pattern)) {
        return { success: false, error: 'Dangerous command detected' };
      }
    }

    return new Promise((resolve) => {
      exec(command, { timeout: 10000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
        if (error) {
          resolve({ 
            success: false, 
            error: stderr || error.message,
            output: stdout 
          });
        } else {
          resolve({ 
            success: true, 
            output: stdout.substring(0, 10000), // Limit output size
            error: stderr 
          });
        }
      });
    });
  }

  /**
   * Get predefined script templates
   */
  getTemplates() {
    return [
      {
        name: 'System Update',
        type: 'sh',
        content: `#!/bin/bash\n# System Update Script\necho "Updating system packages..."\nsudo pacman -Syu\n`
      },
      {
        name: 'Clear Cache',
        type: 'sh',
        content: `#!/bin/bash\n# Clear system cache\necho "Clearing package cache..."\nsudo pacman -Sc --noconfirm\necho "Clearing thumbnail cache..."\nrm -rf ~/.cache/thumbnails/*\necho "Done!"\n`
      },
      {
        name: 'Network Restart',
        type: 'sh',
        content: `#!/bin/bash\n# Restart network services\necho "Restarting NetworkManager..."\nsudo systemctl restart NetworkManager\necho "Network restarted!"\n`
      },
      {
        name: 'Disk Usage',
        type: 'sh',
        content: `#!/bin/bash\n# Show disk usage\necho "=== Disk Usage ==="\ndf -h\necho ""\necho "=== Largest Directories ==="\ndu -ah ~ | sort -rh | head -20\n`
      },
      {
        name: 'Process Monitor',
        type: 'sh',
        content: `#!/bin/bash\n# Show top processes\necho "=== Top 10 CPU Processes ==="\nps aux --sort=-%cpu | head -11\necho ""\necho "=== Top 10 Memory Processes ==="\nps aux --sort=-%mem | head -11\n`
      },
      {
        name: 'Git Status All',
        type: 'sh',
        content: `#!/bin/bash\n# Check git status in all repos\necho "Searching for git repositories..."\nfind ~ -maxdepth 4 -name ".git" -type d 2>/dev/null | while read repo; do\n  dir=$(dirname "$repo")\n  echo "\\n=== $dir ==="\n  cd "$dir" && git status --short\ndone\n`
      }
    ];
  }
}

module.exports = ScriptService;
