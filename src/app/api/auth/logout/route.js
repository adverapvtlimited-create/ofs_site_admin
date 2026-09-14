import { NextResponse } from 'next/server';
import { requireAuth, SESSION_COOKIE_NAME } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const session = await requireAuth();

    // Revoke the session in the database
    await query(
      `UPDATE admin_sessions SET revoked = TRUE WHERE id = $1`,
      [session.id]
    );

    const response = NextResponse.json({ success: true });

    // Clear the cookie
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    // Even if there's an error (e.g. session already invalid), we still clear the cookie
    const response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    response.cookies.delete(SESSION_COOKIE_NAME);
    return response;
  }
}
