import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

// GET all active devices
export async function GET() {
  try {
    const currentSession = await requireAuth();

    // Fetch all active sessions, including identifying the current one
    const result = await query(
      `SELECT id, device_name, user_agent, created_at, last_used_at, expires_at 
       FROM admin_sessions 
       WHERE revoked = FALSE AND expires_at > NOW()
       ORDER BY last_used_at DESC`
    );

    const data = result.rows.map(row => ({
      ...row,
      isCurrent: row.id === currentSession.id
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// PATCH to revoke a specific device
export async function PATCH(request) {
  try {
    const currentSession = await requireAuth();

    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing device id' }, { status: 400 });
    }

    // You cannot revoke your own active session via this endpoint (use logout instead)
    if (id === currentSession.id) {
      return NextResponse.json({ error: 'Use logout to revoke your current session' }, { status: 400 });
    }

    const result = await query(
      `UPDATE admin_sessions SET revoked = TRUE WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Device session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to revoke device:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
