import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // 1. Compute counts from database
    const [totalFarmers] = await sql`SELECT COUNT(*)::int as count FROM users WHERE role = 'farmer'`;
    const [verifiedFarmers] = await sql`SELECT COUNT(*)::int as count FROM farmer_profiles WHERE verification_status = 'verified'`;
    const [totalBuyers] = await sql`SELECT COUNT(*)::int as count FROM users WHERE role = 'buyer'`;
    const [verifiedBuyers] = await sql`SELECT COUNT(*)::int as count FROM buyer_profiles WHERE verification_status = 'verified'`;

    const [listingsCount] = await sql`SELECT COUNT(*)::int as count FROM produce_listings`;
    const [demandCount] = await sql`SELECT COUNT(*)::int as count FROM demand_requests`;
    const [matchesCount] = await sql`SELECT COUNT(*)::int as count FROM matches`;

    const [completedTxs] = await sql`SELECT COUNT(*)::int as count FROM transactions WHERE status = 'completed'`;
    const [gmvSum] = await sql`SELECT COALESCE(SUM(total_value), 0)::numeric as sum FROM transactions WHERE status = 'completed'`;
    const [avgTxValue] = await sql`SELECT COALESCE(AVG(total_value), 0)::numeric as avg FROM transactions WHERE status = 'completed'`;
    const [disputesCount] = await sql`SELECT COUNT(*)::int as count FROM disputes`;

    // 2. Fetch monthly/daily transaction values for charts
    const chartData = await sql`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM-DD') as date,
        COUNT(*)::int as transactions,
        SUM(total_value)::numeric as value
      FROM transactions
      WHERE status = 'completed'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
      ORDER BY date ASC
      LIMIT 15
    `;

    // 3. Fetch listing categories distribution for charts
    const categoryDistribution = await sql`
      SELECT category, COUNT(*)::int as count
      FROM produce_listings
      GROUP BY category
      ORDER BY count DESC
    `;

    return NextResponse.json({
      success: true,
      stats: {
        totalFarmers: totalFarmers.count,
        verifiedFarmers: verifiedFarmers.count,
        totalBuyers: totalBuyers.count,
        verifiedBuyers: verifiedBuyers.count,
        listingsCount: listingsCount.count,
        demandCount: demandCount.count,
        matchesCount: matchesCount.count,
        completedTransactions: completedTxs.count,
        gmv: Number(gmvSum.sum),
        averageTransactionValue: Number(avgTxValue.avg),
        disputes: disputesCount.count
      },
      chartData,
      categoryDistribution
    });

  } catch (error) {
    console.error('Error generating admin analytics:', error);
    return NextResponse.json({ error: 'Failed to generate analytics metrics' }, { status: 500 });
  }
}
