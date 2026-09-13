import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { query } from '@/lib/db';

// GET all enquiries
export async function GET() {
  try {
    await requireAuth();

    const result = await query(
      `SELECT * FROM enquiries ORDER BY created_at DESC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Failed to fetch enquiries:', error);
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
      `UPDATE enquiries SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Failed to update enquiry:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}

// DELETE an enquiry
export async function DELETE(request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const result = await query(
      `DELETE FROM enquiries WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Enquiry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete enquiry:', error);
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}
