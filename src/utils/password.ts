import bcrypt from 'bcrypt';

/**
 * Hash a password using bcrypt
 * @param password - The plain text password to hash
 * @param saltRounds - The number of salt rounds (default: 12)
 * @returns Promise resolving to the hashed password
 */
export async function hashPassword(
  password: string,
  saltRounds: number = 12
): Promise<string> {
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against its hash
 * @param password - The plain text password to verify
 * @param hashedPassword - The hashed password to compare against
 * @returns Promise resolving to true if password matches, false otherwise
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
