const { exec } = require('child_process');

class CalculatorService {
  static evaluate(expression) {
    return new Promise((resolve) => {
      // Sanitize input - only allow numbers and basic math operators
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      
      if (!sanitized.trim()) {
        resolve({ success: false, error: 'Empty expression' });
        return;
      }

      try {
        // Use Node's Function constructor with strict validation
        const result = Function('"use strict";return (' + sanitized + ')')();
        
        if (typeof result === 'number' && isFinite(result)) {
          resolve({ 
            success: true, 
            result,
            expression: sanitized 
          });
        } else {
          resolve({ success: false, error: 'Invalid result' });
        }
      } catch (e) {
        resolve({ success: false, error: e.message });
      }
    });
  }

  static async calculateInTerminal(expression) {
    return new Promise((resolve) => {
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      exec(`echo "scale=10; ${sanitized}" | bc`, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: stderr || error.message });
        } else {
          resolve({ 
            success: true, 
            result: parseFloat(stdout.trim()),
            expression: sanitized 
          });
        }
      });
    });
  }
}

module.exports = CalculatorService;
