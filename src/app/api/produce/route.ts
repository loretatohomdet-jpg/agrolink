import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const farmerId = searchParams.get('farmerId');
    const category = searchParams.get('category');
    const lga = searchParams.get('lga');
    const grade = searchParams.get('grade');

    let listings;

    if (farmerId) {
      // Fetch specific farmer's listings (both active and inactive)
      listings = await sql`
        SELECT pl.*, u.name as farmer_name, fl.lga as farm_lga 
        FROM produce_listings pl
        JOIN users u ON pl.farmer_id = u.id
        LEFT JOIN farm_locations fl ON u.id = fl.user_id
        WHERE pl.farmer_id = ${farmerId}
        ORDER BY pl.created_at DESC
      `;
    } else {
      // General marketplace search (only active listings by verified farmers)
      listings = await sql`
        SELECT 
          pl.*, 
          u.name as farmer_name, 
          fl.lga as farm_lga,
          fl.state as farm_state,
          COALESCE(r.avg_rating, 0) as avg_rating,
          COALESCE(t.completed_count, 0) as completed_tx
        FROM produce_listings pl
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
        WHERE pl.is_active = true 
          AND fp.verification_status = 'verified'
          ${category ? sql`AND pl.category = ${category}` : sql``}
          ${lga ? sql`AND fl.lga = ${lga}` : sql``}
          ${grade ? sql`AND pl.quality_grade = ${grade}` : sql``}
        ORDER BY pl.created_at DESC
      `;
    }

    return NextResponse.json({ success: true, listings });
  } catch (error: any) {
    console.error('Error fetching produce listings:', error);
    return NextResponse.json({ error: 'Failed to fetch produce listings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'farmer') {
      return NextResponse.json({ error: 'Unauthorized. Only farmers can create listings.' }, { status: 403 });
    }

    const body = await request.json();
    const { category, variety, quantity, unit, price_per_unit, price_type = 'fixed', quality_grade, harvest_date, available_date, description, images = [] } = body;

    if (!category || !quantity || !unit || !price_per_unit || !quality_grade || !harvest_date || !available_date) {
      return NextResponse.json({ error: 'Missing required produce information' }, { status: 400 });
    }

    const [listing] = await sql`
      INSERT INTO produce_listings (
        farmer_id, category, variety, quantity, unit, price_per_unit, price_type, quality_grade, harvest_date, available_date, description, images, is_active
      )
      VALUES (
        ${user.id}, ${category}, ${variety || null}, ${Number(quantity)}, ${unit}, ${Number(price_per_unit)}, ${price_type}, ${quality_grade}, ${harvest_date}, ${available_date}, ${description || null}, ${images}, true
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, listing });
  } catch (error: any) {
    console.error('Error creating produce listing:', error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
