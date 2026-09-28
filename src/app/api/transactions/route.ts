import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let txs;
    if (user.role === 'farmer') {
      txs = await sql`
        SELECT t.*, u.name as buyer_name, bp.company_name as buyer_company
        FROM transactions t
        JOIN users u ON t.buyer_id = u.id
        JOIN buyer_profiles bp ON u.id = bp.id
        WHERE t.supplier_id = ${user.id}
        ORDER BY t.created_at DESC
      `;
    } else if (user.role === 'buyer') {
      txs = await sql`
        SELECT t.*, u.name as supplier_name, fp.farm_name as supplier_farm
        FROM transactions t
        JOIN users u ON t.supplier_id = u.id
        JOIN farmer_profiles fp ON u.id = fp.id
        WHERE t.buyer_id = ${user.id}
        ORDER BY t.created_at DESC
      `;
    } else if (user.role === 'admin') {
      txs = await sql`
        SELECT t.*, 
               ub.name as buyer_name, bp.company_name as buyer_company,
               us.name as supplier_name, fp.farm_name as supplier_farm
        FROM transactions t
        JOIN users ub ON t.buyer_id = ub.id
        JOIN buyer_profiles bp ON ub.id = bp.id
        JOIN users us ON t.supplier_id = us.id
        JOIN farmer_profiles fp ON us.id = fp.id
        ORDER BY t.created_at DESC
      `;
    }

    return NextResponse.json({ success: true, transactions: txs });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'buyer') {
      return NextResponse.json({ error: 'Unauthorized. Only buyers can initiate transactions.' }, { status: 403 });
    }

    const body = await request.json();
    const { listing_id, demand_id, product, quantity, unit, price_per_unit, delivery_location, expected_delivery_date } = body;

    if (!product || !quantity || !unit || !price_per_unit || !delivery_location || !expected_delivery_date) {
      return NextResponse.json({ error: 'Missing required transaction details' }, { status: 400 });
    }

    // Get supplier ID from listing
    let supplier_id = body.supplier_id;
    if (listing_id) {
      const [listing] = await sql`
        SELECT farmer_id FROM produce_listings WHERE id = ${listing_id}
      `;
      if (listing) {
        supplier_id = listing.farmer_id;
      }
    }

    if (!supplier_id) {
      return NextResponse.json({ error: 'Could not identify supplier' }, { status: 400 });
    }

    const qty = Number(quantity);
    const price = Number(price_per_unit);
    const totalVal = qty * price;

    const [tx] = await sql`
      INSERT INTO transactions (
        buyer_id, supplier_id, listing_id, demand_id, product, quantity, unit, price_per_unit, total_value, delivery_location, expected_delivery_date, status, payment_status
      )
      VALUES (
        ${user.id}, ${supplier_id}, ${listing_id || null}, ${demand_id || null}, ${product}, ${qty}, ${unit}, ${price}, ${totalVal}, ${delivery_location}, ${expected_delivery_date}, 'inquiry', 'unpaid'
      )
      RETURNING *
    `;

    // Create system notification for the supplier
    await sql`
      INSERT INTO notifications (user_id, type, title, content, link)
      VALUES (
        ${supplier_id}, 'transaction', 'New Buy Inquiry', 
        ${`Buyer ${user.name} has sent a buy inquiry for ${qty} ${unit} of ${product}.`},
        ${`/transactions`}
      )
    `;

    return NextResponse.json({ success: true, transaction: tx });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to initiate transaction' }, { status: 500 });
  }
}
