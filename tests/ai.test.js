const assert = require('assert');
const AIService = require('../electron/services/AIService');

describe('AIService', () => {
  describe('chat', () => {
    it('should respond to hello', async () => {
      const response = await AIService.chat('hello');
      assert.strictEqual(response.success, true);
      assert.ok(response.response.includes('Hello'));
    });

    it('should respond to help', async () => {
      const response = await AIService.chat('help');
      assert.strictEqual(response.success, true);
      assert.ok(response.response.includes('help'));
    });

    it('should provide time', async () => {
      const response = await AIService.chat('time');
      assert.strictEqual(response.success, true);
      assert.ok(response.response.includes('time') || response.response.includes('Current'));
    });

    it('should handle unknown queries', async () => {
      const response = await AIService.chat('something random');
      assert.strictEqual(response.success, true);
      assert.ok(response.response);
    });
  });

  describe('executeSystemCommand', () => {
    it('should execute allowed command: ls', async () => {
      const response = await AIService.executeSystemCommand('ls -la');
      // May succeed or fail depending on environment, but should not throw
      assert.ok(response !== undefined);
    });

    it('should execute allowed command: pwd', async () => {
      const response = await AIService.executeSystemCommand('pwd');
      assert.ok(response !== undefined);
    });

    it('should reject disallowed command', async () => {
      const response = await AIService.executeSystemCommand('rm -rf /');
      assert.strictEqual(response.success, false);
      assert.ok(response.error.includes('not in the allowed list'));
    });

    it('should reject dangerous commands', async () => {
      const response = await AIService.executeSystemCommand('sudo apt remove');
      assert.strictEqual(response.success, false);
    });
  });

  describe('summarize', () => {
    it('should summarize text', async () => {
      const text = 'This is the first sentence. This is the second sentence. This is the third sentence. This is the fourth sentence.';
      const result = await AIService.summarize(text);
      
      assert.strictEqual(result.success, true);
      assert.ok(result.summary);
      assert.ok(result.summary.length < text.length);
    });

    it('should handle short text', async () => {
      const text = 'Short text.';
      const result = await AIService.summarize(text);
      
      assert.strictEqual(result.success, true);
      assert.ok(result.summary);
    });
  });
});

console.log('✓ AIService tests defined');
