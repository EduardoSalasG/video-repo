import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { hashPassword, verifyPassword } from '../../src/utils/password';

describe('Password Utilities', () => {
  const testPassword = 'testPassword123';
  let hashedPassword: string;

  beforeEach(async () => {
    hashedPassword = await hashPassword(testPassword);
  });

  afterEach(async () => {
    // Clean up if needed
  });

  describe('hashPassword', () => {
    it('should hash a password correctly', async () => {
      expect(typeof hashedPassword).toBe('string');
      expect(hashedPassword.length).toBeGreaterThan(0);
      expect(hashedPassword).not.toBe(testPassword);
    });

    it('should produce different hashes for the same password', async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const isValid = await verifyPassword(testPassword, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const isValid = await verifyPassword('wrongPassword', hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should reject an empty password', async () => {
      const isValid = await verifyPassword('', hashedPassword);
      expect(isValid).toBe(false);
    });
  });
});
