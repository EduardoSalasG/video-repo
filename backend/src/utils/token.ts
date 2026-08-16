import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token
 * @param payload - The payload to encode in the token
 * @param secret - The secret key used to sign the token
 * @param expiresIn - Expiration time of the token (default: 1 hour)
 * @returns The signed JWT token
 */
export function generateToken(
  payload: object,
  secret: string,
  expiresIn: string | number = '1h'
): string {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] });
}

/**
 * Verify a JWT token
 * @param token - The JWT token to verify
 * @param secret - The secret key used to verify the token
 * @returns The decoded payload if valid
 * @throws If the token is invalid or expired
 */
export function verifyToken(token: string, secret: string): string | jwt.JwtPayload {
  return jwt.verify(token, secret);
}