import { describe, it, expect, beforeEach } from 'vitest';
import { generateToken, verifyToken } from '../../src/utils/token';

describe('Token Utilities', () => {
  const testPayload = { userId: 1, username: 'testuser' };
  const testSecret = 'testSecret123';
  let token: string;

  describe('generateToken', () => {
    it('should generate a JWT token', () => {
      token = generateToken(testPayload, testSecret);
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      // Token should consist of three parts separated by dots
      expect(token.split('.').length).toBe(3);
    });

    it('should allow custom expiration', () => {
      const tokenWithExpiration = generateToken(testPayload, testSecret, '30s');
      expect(typeof tokenWithExpiration).toBe('string');
      // We can't easily test the expiration without waiting, but we can verify it's a token
      expect(tokenWithExpiration.split('.').length).toBe(3);
    });
  });

  describe('verifyToken', () => {
    beforeEach(() => {
      token = generateToken(testPayload, testSecret);
    });

    it('should verify a valid token and return the payload', () => {
      const payload = verifyToken(token, testSecret);
      expect(payload).toMatchObject(testPayload);
    });

    it('should throw an error for an invalid token', () => {
      expect(() => {
        verifyToken('invalid.token.here', testSecret);
      }).toThrow();
    });

    it('should throw an error for a token with wrong secret', () => {
      const wrongToken = generateToken(testPayload, 'wrongSecret');
      expect(() => {
        verifyToken(wrongToken, testSecret);
      }).toThrow();
    });

    it('should throw an error for an expired token (if we set short expiration)', () => {
      // Create a token that expires immediately (or in the past)
      const expiredToken = generateToken(testPayload, testSecret, 0); // 0 milliseconds
      // Note: jwt.sign with expiresIn: 0 might produce an expired token immediately
      // However, to be safe, we can also test with a negative value? Actually, expiresIn cannot be negative.
      // We'll rely on the fact that 0 should be immediate expiration.
      // But note: the verification might still pass if the clock skew is allowed? We'll just expect it to throw.
      expect(() => {
        verifyToken(expiredToken, testSecret);
      }).toThrow();
    });
  });
});