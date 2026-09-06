const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class FileSearchService {
  constructor() {
    this.index = [];
    this.isIndexing = false;
    this.commonDirectories = [
      process.env.HOME || '/home/user',
      '/home',
      '/workspace',
      '/tmp'
    ];
  }

  async searchFiles(query, limit = 50) {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      // Use find command for fast file searching
      const searchQuery = query.replace(/'/g, "'\\''");
      const { stdout } = await execAsync(
        `find ${this.commonDirectories.join(' ')} -type f -name '*${searchQuery}*' 2>/dev/null | head -${limit}`
      );
      
      const files = stdout.trim().split('\n').filter(f => f).map(filePath => ({
        path: filePath,
        name: path.basename(filePath),
        directory: path.dirname(filePath),
        type: this.getFileType(filePath)
      }));

      return files;
    } catch (error) {
      console.error('Error searching files:', error);
      return [];
    }
  }

  async searchDirectories(query, limit = 30) {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const searchQuery = query.replace(/'/g, "'\\''");
      const { stdout } = await execAsync(
        `find ${this.commonDirectories.join(' ')} -type d -name '*${searchQuery}*' 2>/dev/null | head -${limit}`
      );
      
      const directories = stdout.trim().split('\n').filter(d => d).map(dirPath => ({
        path: dirPath,
        name: path.basename(dirPath),
        parent: path.dirname(dirPath)
      }));

      return directories;
    } catch (error) {
      console.error('Error searching directories:', error);
      return [];
    }
  }

  async getRecentFiles(limit = 20) {
    try {
      // Get recently modified files
      const { stdout } = await execAsync(
        `find ${this.commonDirectories[0]} -type f -mtime -7 2>/dev/null | xargs ls -t 2>/dev/null | head -${limit}`
      );
      
      const files = stdout.trim().split('\n').filter(f => f).map(filePath => ({
        path: filePath,
        name: path.basename(filePath),
        directory: path.dirname(filePath),
        type: this.getFileType(filePath)
      }));

      return files;
    } catch (error) {
      console.error('Error getting recent files:', error);
      return [];
    }
  }

  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const typeMap = {
      '.txt': 'text',
      '.md': 'markdown',
      '.js': 'javascript',
      '.ts': 'typescript',
      '.jsx': 'react',
      '.tsx': 'react-ts',
      '.py': 'python',
      '.java': 'java',
      '.c': 'c',
      '.cpp': 'cpp',
      '.h': 'header',
      '.hpp': 'header',
      '.css': 'css',
      '.scss': 'sass',
      '.less': 'less',
      '.html': 'html',
      '.xml': 'xml',
      '.json': 'json',
      '.yaml': 'yaml',
      '.yml': 'yaml',
      '.toml': 'toml',
      '.sh': 'shell',
      '.bash': 'shell',
      '.zsh': 'shell',
      '.fish': 'shell',
      '.png': 'image',
      '.jpg': 'image',
      '.jpeg': 'image',
      '.gif': 'image',
      '.svg': 'image',
      '.webp': 'image',
      '.mp4': 'video',
      '.avi': 'video',
      '.mkv': 'video',
      '.mov': 'video',
      '.mp3': 'audio',
      '.wav': 'audio',
      '.flac': 'audio',
      '.ogg': 'audio',
      '.pdf': 'pdf',
      '.doc': 'document',
      '.docx': 'document',
      '.xls': 'spreadsheet',
      '.xlsx': 'spreadsheet',
      '.ppt': 'presentation',
      '.pptx': 'presentation',
      '.zip': 'archive',
      '.tar': 'archive',
      '.gz': 'archive',
      '.rar': 'archive',
      '.7z': 'archive'
    };
    
    return typeMap[ext] || 'file';
  }

  async openFile(filePath) {
    try {
      // Try to open with default application
      await execAsync(`xdg-open '${filePath}' 2>/dev/null || echo "failed"`);
      return true;
    } catch (error) {
      console.error('Error opening file:', error);
      return false;
    }
  }

  async revealInFileManager(filePath) {
    try {
      const directory = path.dirname(filePath);
      await execAsync(`xdg-open '${directory}' 2>/dev/null || nautilus '${directory}' 2>/dev/null || dolphin '${directory}' 2>/dev/null || echo "failed"`);
      return true;
    } catch (error) {
      console.error('Error revealing file:', error);
      return false;
    }
  }

  async readFileContent(filePath, maxLines = 100) {
    try {
      const { stdout } = await execAsync(`head -n ${maxLines} '${filePath}' 2>/dev/null`);
      return stdout;
    } catch (error) {
      console.error('Error reading file:', error);
      return null;
    }
  }

  search(query, options = {}) {
    const { type = 'all', limit = 50 } = options;
    
    if (type === 'files') {
      return this.searchFiles(query, limit);
    } else if (type === 'directories') {
      return this.searchDirectories(query, limit);
    } else {
      // Search both
      return Promise.all([
        this.searchFiles(query, limit),
        this.searchDirectories(query, Math.floor(limit / 3))
      ]).then(([files, dirs]) => [...files, ...dirs.map(d => ({ ...d, isDirectory: true }))]);
    }
  }
}

module.exports = new FileSearchService();
