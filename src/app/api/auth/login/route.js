import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { createSession, SESSION_COOKIE_NAME } from '@/lib/auth';

// Simple in-memory rate limiter for this specific endpoint
// Maps IP address -> { attempts: number, lockUntil: number }
const rateLimitCache = new Map();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const now = Date.now();
    
    const rateLimitInfo = rateLimitCache.get(ip) || { attempts: 0, lockUntil: 0 };
    
    // Check if currently locked out
    if (rateLimitInfo.lockUntil > now) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const { password, deviceName } = await request.json();

    if (!password || !deviceName) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const masterHash = process.env.ADMIN_MASTER_PASSWORD_HASH;
    
    if (!masterHash) {
      console.error('SERVER ERROR: ADMIN_MASTER_PASSWORD_HASH is not configured in .env');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify password using bcrypt
    const isValid = await bcrypt.compare(password, masterHash);

    if (!isValid) {
      // Increment failures
      rateLimitInfo.attempts += 1;
      if (rateLimitInfo.attempts >= MAX_ATTEMPTS) {
        rateLimitInfo.lockUntil = now + LOCKOUT_MS;
      }
      rateLimitCache.set(ip, rateLimitInfo);
      
      // Generic error message
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Success! Reset rate limiter
    rateLimitCache.delete(ip);

    // Create session in database
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const { token, expiresAt } = await createSession(deviceName, userAgent);

    // Create response
    const response = NextResponse.json({ success: true });

    // Set HttpOnly, Secure cookie
    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
