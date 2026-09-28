import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { matchDemandWithSuppliers } from '@/lib/matching';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let demands;
    if (user.role === 'buyer') {
      // Fetch buyer's own demands
      demands = await sql`
        SELECT * FROM demand_requests 
        WHERE buyer_id = ${user.id} 
        ORDER BY created_at DESC
      `;
    } else if (user.role === 'admin') {
      // Admin sees all demands
      demands = await sql`
        SELECT dr.*, u.name as buyer_name, bp.company_name
        FROM demand_requests dr
        JOIN users u ON dr.buyer_id = u.id
        JOIN buyer_profiles bp ON u.id = bp.id
        ORDER BY dr.created_at DESC
      `;
    } else {
      // Farmers see active demands that match their main crops
      demands = await sql`
        SELECT dr.*, u.name as buyer_name, bp.company_name, bp.verification_status as buyer_verification
        FROM demand_requests dr
        JOIN users u ON dr.buyer_id = u.id
        JOIN buyer_profiles bp ON u.id = bp.id
        WHERE dr.status = 'active'
        ORDER BY dr.created_at DESC
      `;
    }

    return NextResponse.json({ success: true, demands });
  } catch (error) {
    console.error('Error fetching demand requests:', error);
    return NextResponse.json({ error: 'Failed to fetch demands' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized. Only buyers can post demands.' }, { status: 403 });
    }

    // Check buyer verification status
    const [buyerProfile] = await sql`
      SELECT verification_status FROM buyer_profiles WHERE id = ${user.id}
    `;
    const isVerified = buyerProfile?.verification_status === 'verified';

    const body = await request.json();
    const { product, quantity, unit, quality_grade, delivery_location_lga, delivery_location_state = 'Plateau', required_date, price_min, price_max, additional_requirements } = body;

    if (!product || !quantity || !unit || !quality_grade || !delivery_location_lga || !required_date) {
      return NextResponse.json({ error: 'Missing required demand specifications' }, { status: 400 });
    }

    const qty = Number(quantity);

    // Rule: High-value demand requests (e.g. quantity > 20 tonnes or total value > 5 million NGN) require verified status
    const isHighValue = (unit.toLowerCase() === 'tonnes' && qty > 20) || (qty > 1000); // 1000 bags or 20 tonnes is high value
    if (isHighValue && !isVerified) {
      return NextResponse.json({ 
        error: 'High-value demand requests require a Verified Buyer profile. Please complete verification or lower quantity.' 
      }, { status: 403 });
    }

    // Insert demand
    const [demand] = await sql`
      INSERT INTO demand_requests (
        buyer_id, product, quantity, unit, quality_grade, delivery_location_lga, delivery_location_state, required_date, price_min, price_max, additional_requirements, status
      )
      VALUES (
        ${user.id}, ${product}, ${qty}, ${unit}, ${quality_grade}, ${delivery_location_lga}, ${delivery_location_state}, ${required_date}, 
        ${price_min ? Number(price_min) : null}, ${price_max ? Number(price_max) : null}, ${additional_requirements || null}, 'active'
      )
      RETURNING *
    `;

    // Trigger matching engine
    let matchCount = 0;
    try {
      const matches = await matchDemandWithSuppliers(demand.id);
      matchCount = matches.length;
    } catch (matchErr) {
      console.error('Error running matching engine for new demand:', matchErr);
    }

    return NextResponse.json({ success: true, demand, matchCount });
  } catch (error: any) {
    console.error('Error creating demand request:', error);
    return NextResponse.json({ error: error.message || 'Failed to post demand' }, { status: 500 });
  }
}
