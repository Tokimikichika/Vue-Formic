import { describe, it, expect } from 'vitest';
import { builtinValidators } from '../validators/builtin';

describe('Built-in Validators', () => {
  describe('required validator', () => {
    const validator = builtinValidators.required();

    it('should pass for non-empty string', async () => {
      const result = await validator.validate('hello', {}, 'test');
      expect(result).toBe(true);
    });

    it('should fail for empty string', async () => {
      const result = await validator.validate('', {}, 'test');
      expect(result).toBe(false);
    });

    it('should fail for null', async () => {
      const result = await validator.validate(null, {}, 'test');
      expect(result).toBe(false);
    });

    it('should fail for undefined', async () => {
      const result = await validator.validate(undefined, {}, 'test');
      expect(result).toBe(false);
    });
  });

  describe('email validator', () => {
    const validator = builtinValidators.email();

    it('should pass for valid email', async () => {
      const result = await validator.validate('test@example.com', {}, 'email');
      expect(result).toBe(true);
    });

    it('should fail for invalid email', async () => {
      const result = await validator.validate('invalid-email', {}, 'email');
      expect(result).toBe(false);
    });

    it('should pass for empty value (not required)', async () => {
      const result = await validator.validate('', {}, 'email');
      expect(result).toBe(true);
    });
  });

  describe('minLength validator', () => {
    const validator = builtinValidators.minLength(5);

    it('should pass for string with sufficient length', async () => {
      const result = await validator.validate('hello world', {}, 'text');
      expect(result).toBe(true);
    });

    it('should fail for string with insufficient length', async () => {
      const result = await validator.validate('hi', {}, 'text');
      expect(result).toBe(false);
    });

    it('should pass for empty value (not required)', async () => {
      const result = await validator.validate('', {}, 'text');
      expect(result).toBe(true);
    });
  });

  describe('number validator', () => {
    const validator = builtinValidators.number();

    it('should pass for valid number', async () => {
      const result = await validator.validate('42', {}, 'number');
      expect(result).toBe(true);
    });

    it('should fail for non-numeric string', async () => {
      const result = await validator.validate('not a number', {}, 'number');
      expect(result).toBe(false);
    });

    it('should pass for empty value (not required)', async () => {
      const result = await validator.validate('', {}, 'number');
      expect(result).toBe(true);
    });
  });
});