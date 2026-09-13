import { cookies } from 'next/headers';
import crypto from 'crypto';
import { query } from './db';

// The cookie name for the device session
export const SESSION_COOKIE_NAME = 'device_session';

/**
 * Validates the current request's session cookie against the database.
 * @returns {Promise<Object>} The session object if valid.
 * @throws {Error} If session is missing, invalid, expired, or revoked.
 */
export async function requireAuth() {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    throw new Error('Unauthorized: No session cookie');
  }

  // Hash the token to compare against the database
  const sessionHash = crypto.createHash('sha256').update(sessionToken).digest('hex');

  // Query the database for this session
  const res = await query(
    `SELECT * FROM admin_sessions WHERE session_hash = $1`,
    [sessionHash]
  );

  const session = res.rows[0];

  if (!session) {
    throw new Error('Unauthorized: Invalid session');
  }

  if (session.revoked) {
    throw new Error('Unauthorized: Session revoked');
  }

  if (new Date(session.expires_at) < new Date()) {
    throw new Error('Unauthorized: Session expired');
  }

  // As per feedback, we can update last_used_at on every request for now 
  // since the traffic is just Glen and the Devs.
  await query(
    `UPDATE admin_sessions SET last_used_at = NOW() WHERE id = $1`,
    [session.id]
  );

  return session;
}

/**
 * Creates a new session in the database and returns the raw token to be set as a cookie.
 */
export async function createSession(deviceName, userAgent) {
  // Generate a cryptographically secure 256-bit token (32 bytes)
  const token = crypto.randomBytes(32).toString('hex');
  
  // Hash the token for storage
  const sessionHash = crypto.createHash('sha256').update(token).digest('hex');

  // Set expiration to 1 year from now
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1);

  await query(
    `INSERT INTO admin_sessions (id, session_hash, device_name, user_agent, expires_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4)`,
    [sessionHash, deviceName, userAgent, expiresAt]
  );

  return { token, expiresAt };
}
