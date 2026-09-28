import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { quantity, price_per_unit, is_active, description, quality_grade, harvest_date, available_date } = body;

    // Verify ownership
    const [existing] = await sql`
      SELECT id, farmer_id FROM produce_listings WHERE id = ${id}
    `;
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (existing.farmer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [updated] = await sql`
      UPDATE produce_listings
      SET 
        quantity = COALESCE(${quantity !== undefined ? Number(quantity) : null}, quantity),
        price_per_unit = COALESCE(${price_per_unit !== undefined ? Number(price_per_unit) : null}, price_per_unit),
        is_active = COALESCE(${is_active !== undefined ? Boolean(is_active) : null}, is_active),
        description = COALESCE(${description !== undefined ? description : null}, description),
        quality_grade = COALESCE(${quality_grade !== undefined ? quality_grade : null}, quality_grade),
        harvest_date = COALESCE(${harvest_date !== undefined ? new Date(harvest_date) : null}, harvest_date),
        available_date = COALESCE(${available_date !== undefined ? new Date(available_date) : null}, available_date),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    return NextResponse.json({ success: true, listing: updated });
  } catch (error) {
    console.error('Error updating produce listing:', error);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await params;

    // Verify ownership
    const [existing] = await sql`
      SELECT id, farmer_id FROM produce_listings WHERE id = ${id}
    `;
    if (!existing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (existing.farmer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await sql`
      DELETE FROM produce_listings WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting produce listing:', error);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
