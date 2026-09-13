import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

// GET all career applications
export async function GET() {
  try {
    await requireAuth();

    const result = await query(
      `SELECT * FROM career_applications ORDER BY created_at DESC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Failed to fetch applications:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// PATCH to update status
export async function PATCH(request) {
  try {
    await requireAuth();

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'Missing id or status' }, { status: 400 });
    }

    const result = await query(
      `UPDATE career_applications SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// DELETE an application
export async function DELETE(request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const result = await query(
      `DELETE FROM career_applications WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete application:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
