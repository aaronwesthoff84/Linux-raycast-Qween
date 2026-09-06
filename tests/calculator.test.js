const assert = require('assert');
const CalculatorService = require('../electron/services/CalculatorService');

describe('CalculatorService', () => {
  describe('evaluate', () => {
    it('should evaluate simple addition', async () => {
      const result = await CalculatorService.evaluate('2 + 2');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.result, 4);
    });

    it('should evaluate subtraction', async () => {
      const result = await CalculatorService.evaluate('10 - 3');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.result, 7);
    });

    it('should evaluate multiplication', async () => {
      const result = await CalculatorService.evaluate('5 * 6');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.result, 30);
    });

    it('should evaluate division', async () => {
      const result = await CalculatorService.evaluate('20 / 4');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.result, 5);
    });

    it('should handle complex expressions', async () => {
      const result = await CalculatorService.evaluate('(2 + 3) * 4');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.result, 20);
    });

    it('should handle decimal numbers', async () => {
      const result = await CalculatorService.evaluate('2.5 + 3.5');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.result, 6);
    });

    it('should reject invalid characters', async () => {
      const result = await CalculatorService.evaluate('2 + abc');
      assert.strictEqual(result.success, false);
    });

    it('should handle empty expression', async () => {
      const result = await CalculatorService.evaluate('');
      assert.strictEqual(result.success, false);
    });

    it('should handle division by zero', async () => {
      const result = await CalculatorService.evaluate('5 / 0');
      assert.strictEqual(result.success, false);
    });
  });
});

console.log('✓ CalculatorService tests defined');
