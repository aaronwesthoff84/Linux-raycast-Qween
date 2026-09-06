const { exec } = require('child_process');

class AIService {
  static async chat(prompt, history = []) {
    // Since we can't call external AI APIs without an API key,
    // we'll provide a mock response that demonstrates the functionality
    // In production, this would connect to OpenAI, Anthropic, or local LLM
    
    return new Promise((resolve) => {
      // Mock AI responses for demonstration
      const responses = {
        'hello': 'Hello! I\'m LinuxCast AI assistant. How can I help you today?',
        'help': 'I can help you with:\n• Searching and launching applications\n• Managing clipboard history\n• Taking quick notes\n• Performing calculations\n• Web searches\n• System commands',
        'time': `Current time is ${new Date().toLocaleString()}`,
        'date': `Today is ${new Date().toLocaleDateString()}`,
        'weather': 'Weather integration requires an API key. Configure in settings.',
        'default': `You asked: "${prompt}"\n\nThis is a demo response. To enable real AI chat:\n1. Add your OpenAI API key in settings\n2. Or configure a local LLM endpoint\n3. The AI feature will then provide intelligent responses`
      };

      const key = prompt.toLowerCase().split(' ')[0];
      const response = responses[key] || responses['default'];

      setTimeout(() => {
        resolve({
          success: true,
          response,
          timestamp: Date.now(),
          model: 'demo'
        });
      }, 500); // Simulate network delay
    });
  }

  static async executeSystemCommand(command) {
    // Safe command execution with whitelist
    const allowedCommands = ['ls', 'pwd', 'whoami', 'date', 'uptime', 'df', 'free'];
    const baseCommand = command.split(' ')[0];
    
    if (!allowedCommands.includes(baseCommand)) {
      return { 
        success: false, 
        error: `Command "${baseCommand}" is not in the allowed list` 
      };
    }

    return new Promise((resolve) => {
      exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: stderr || error.message });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });
  }

  static async summarize(text) {
    // Mock summarization
    const sentences = text.split('.').filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.';
    
    return {
      success: true,
      summary,
      originalLength: text.length,
      summaryLength: summary.length
    };
  }
}

module.exports = AIService;
