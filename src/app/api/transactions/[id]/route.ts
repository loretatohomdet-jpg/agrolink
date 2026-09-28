import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, payment_status, payment_reference } = body;

    // Fetch existing transaction
    const [tx] = await sql`
      SELECT * FROM transactions WHERE id = ${id}
    `;
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    // Authorization: User must be buyer, supplier, or admin
    const isBuyer = tx.buyer_id === user.id;
    const isSupplier = tx.supplier_id === user.id;
    const isAdmin = user.role === 'admin';

    if (!isBuyer && !isSupplier && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determine update params
    const updatedStatus = status || tx.status;
    const updatedPaymentStatus = payment_status || tx.payment_status;
    const updatedPayRef = payment_reference || tx.payment_reference;

    const [updatedTx] = await sql`
      UPDATE transactions
      SET 
        status = ${updatedStatus},
        payment_status = ${updatedPaymentStatus},
        payment_reference = ${updatedPayRef},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;

    // Notify the other party about the status change
    const recipientId = isBuyer ? tx.supplier_id : tx.buyer_id;
    const otherPartyName = user.name;

    await sql`
      INSERT INTO notifications (user_id, type, title, content, link)
      VALUES (
        ${recipientId}, 'transaction', 'Transaction Status Updated',
        ${`Transaction status for ${tx.quantity} ${tx.unit} of ${tx.product} was updated to "${updatedStatus}" by ${otherPartyName}.`},
        '/transactions'
      )
    `;

    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}
