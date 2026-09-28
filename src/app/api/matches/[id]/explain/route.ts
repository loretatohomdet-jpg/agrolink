import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';
import { generateMatchExplanation } from '@/lib/ai-explain';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { language = 'en' } = await request.json();

    if (language !== 'en' && language !== 'ha') {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }

    // 1. Fetch match and associated demand, listing, farmer profile, and locations
    const [match] = await sql`
      SELECT 
        m.*,
        dr.product as demand_product,
        dr.quantity as demand_qty,
        dr.unit as demand_unit,
        dr.quality_grade as demand_grade,
        dr.delivery_location_lga as demand_lga,
        dr.delivery_location_state as demand_state,
        dr.required_date as demand_date,
        pl.category as listing_category,
        pl.quantity as listing_qty,
        pl.unit as listing_unit,
        pl.quality_grade as listing_grade,
        pl.harvest_date as listing_harvest,
        u.name as farmer_name,
        fp.farm_name,
        fl.lga as farm_lga,
        fl.state as farm_state,
        COALESCE(r.avg_rating, 0) as avg_rating,
        COALESCE(t.completed_count, 0) as completed_tx
      FROM matches m
      JOIN demand_requests dr ON m.demand_id = dr.id
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
      WHERE m.id = ${id}
    `;

    if (!match) {
      return NextResponse.json({ error: 'Match record not found' }, { status: 404 });
    }

    // Check if the explanation is already cached in the database
    const cachedExplanation = language === 'ha' ? match.explanation_ha : match.explanation;
    if (cachedExplanation) {
      return NextResponse.json({ success: true, explanation: cachedExplanation });
    }

    // 2. Format inputs for AI
    const input = {
      buyer: {
        name: user.name,
        product: match.demand_product,
        quantity: Number(match.demand_qty),
        unit: match.demand_unit,
        grade: match.demand_grade,
        lga: match.demand_lga,
        state: match.demand_state,
        requiredDate: new Date(match.demand_date).toLocaleDateString(),
      },
      farmer: {
        name: match.farmer_name,
        farmName: match.farm_name,
        quantity: Number(match.listing_qty),
        unit: match.listing_unit,
        grade: match.listing_grade,
        lga: match.farm_lga,
        state: match.farm_state,
        harvestDate: new Date(match.listing_harvest).toLocaleDateString(),
        avgRating: Number(match.avg_rating),
        completedTx: Number(match.completed_tx),
      },
      scores: {
        quantity: Number(match.quantity_score),
        quality: Number(match.quality_score),
        timing: Number(match.timing_score),
        location: Number(match.location_score),
        reliability: Number(match.reliability_score),
        final: Number(match.score),
      },
      language: language as 'en' | 'ha',
    };

    // 3. Generate explanation
    const explanation = await generateMatchExplanation(input);

    // 4. Cache in database
    if (language === 'ha') {
      await sql`
        UPDATE matches SET explanation_ha = ${explanation} WHERE id = ${id}
      `;
    } else {
      await sql`
        UPDATE matches SET explanation = ${explanation} WHERE id = ${id}
      `;
    }

    return NextResponse.json({ success: true, explanation });
  } catch (error) {
    console.error('Error in explanation route:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}
