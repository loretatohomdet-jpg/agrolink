import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch matches with details
    const matches = await sql`
      SELECT 
        m.*,
        pl.category,
        pl.variety,
        pl.quantity as available_quantity,
        pl.unit as listing_unit,
        pl.price_per_unit,
        pl.price_type,
        pl.quality_grade as listing_grade,
        pl.harvest_date,
        pl.available_date,
        pl.description as listing_description,
        u.name as farmer_name,
        fp.farm_name,
        fp.verification_status as farmer_verification,
        fl.lga as farm_lga,
        fl.state as farm_state,
        COALESCE(r.avg_rating, 0) as avg_rating,
        COALESCE(t.completed_count, 0) as completed_tx
      FROM matches m
      JOIN produce_listings pl ON m.listing_id = pl.id
      JOIN users u ON pl.farmer_id = u.id
      JOIN farmer_profiles fp ON u.id = fp.id
      LEFT JOIN farm_locations fl ON u.id = fl.user_id
      LEFT JOIN (
        SELECT recipient_id, AVG(rating) as avg_rating
        FROM ratings
        GROUP BY recipient_id
      ) r ON u.id = r.recipient_id
      LEFT JOIN (
        SELECT supplier_id, COUNT(*) as completed_count
        FROM transactions
        WHERE status = 'completed'
        GROUP BY supplier_id
      ) t ON u.id = t.supplier_id
      WHERE m.demand_id = ${id}
      ORDER BY m.score DESC
    `;

    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}
