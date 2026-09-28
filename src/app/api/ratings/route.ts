import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      transaction_id, rating, feedback,
      quality_rating, fulfilment_rating, accuracy_rating,
      payment_rating, professionalism_rating, communication_rating 
    } = body;

    if (!transaction_id || !rating) {
      return NextResponse.json({ error: 'Missing transaction reference or main rating value' }, { status: 400 });
    }

    // Fetch transaction to verify details
    const [tx] = await sql`
      SELECT * FROM transactions WHERE id = ${transaction_id}
    `;

    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (tx.status !== 'completed') {
      return NextResponse.json({ error: 'Ratings are only allowed for completed transactions.' }, { status: 400 });
    }

    // Verify user is part of transaction
    const isBuyer = tx.buyer_id === user.id;
    const isSupplier = tx.supplier_id === user.id;
    if (!isBuyer && !isSupplier) {
      return NextResponse.json({ error: 'Unauthorized. You were not a participant in this transaction.' }, { status: 403 });
    }

    const recipientId = isBuyer ? tx.supplier_id : tx.buyer_id;

    // Prevent rating self
    if (user.id === recipientId) {
      return NextResponse.json({ error: 'You cannot rate yourself.' }, { status: 400 });
    }

    // Prevent duplicate rating
    const [existingRating] = await sql`
      SELECT id FROM ratings 
      WHERE transaction_id = ${transaction_id} AND author_id = ${user.id}
    `;
    if (existingRating) {
      return NextResponse.json({ error: 'You have already rated this transaction.' }, { status: 400 });
    }

    const score = Number(rating);
    const comm = communication_rating ? Number(communication_rating) : score;

    let result;

    if (isBuyer) {
      // Buyer rating Farmer
      const qual = quality_rating ? Number(quality_rating) : score;
      const ful = fulfilment_rating ? Number(fulfilment_rating) : score;
      const acc = accuracy_rating ? Number(accuracy_rating) : score;

      [result] = await sql`
        INSERT INTO ratings (
          transaction_id, author_id, recipient_id, rating, feedback, 
          quality_rating, fulfilment_rating, accuracy_rating, communication_rating
        )
        VALUES (
          ${transaction_id}, ${user.id}, ${recipientId}, ${score}, ${feedback || null},
          ${qual}, ${ful}, ${acc}, ${comm}
        )
        RETURNING *
      `;
    } else {
      // Farmer rating Buyer
      const pay = payment_rating ? Number(payment_rating) : score;
      const prof = professionalism_rating ? Number(professionalism_rating) : score;

      [result] = await sql`
        INSERT INTO ratings (
          transaction_id, author_id, recipient_id, rating, feedback,
          payment_rating, professionalism_rating, communication_rating
        )
        VALUES (
          ${transaction_id}, ${user.id}, ${recipientId}, ${score}, ${feedback || null},
          ${pay}, ${prof}, ${comm}
        )
        RETURNING *
      `;
    }

    // Trigger update of user reliability/rating in future matches (processed dynamically, but let's notify the rated user)
    await sql`
      INSERT INTO notifications (user_id, type, title, content, link)
      VALUES (
        ${recipientId}, 'rating', 'New Review Received',
        ${`You received a new ${score}-star rating for your completed transaction.`},
        '/ratings'
      )
    `;

    return NextResponse.json({ success: true, rating: result });
  } catch (error: any) {
    console.error('Error submitting rating:', error);
    return NextResponse.json({ error: error.message || 'Failed to submit rating' }, { status: 500 });
  }
}
export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch ratings received by this user
    const received = await sql`
      SELECT r.*, u.name as author_name, u.role as author_role
      FROM ratings r
      JOIN users u ON r.author_id = u.id
      WHERE r.recipient_id = ${user.id}
      ORDER BY r.created_at DESC
    `;

    return NextResponse.json({ success: true, ratings: received });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
  }
}
