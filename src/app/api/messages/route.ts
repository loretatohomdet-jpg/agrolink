import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all messages involving the current user
    const messages = await sql`
      SELECT 
        m.*,
        us.name as sender_name, us.role as sender_role,
        ur.name as recipient_name, ur.role as recipient_role
      FROM messages m
      JOIN users us ON m.sender_id = us.id
      JOIN users ur ON m.recipient_id = ur.id
      WHERE m.sender_id = ${user.id} OR m.recipient_id = ${user.id}
      ORDER BY m.created_at ASC
    `;

    return NextResponse.json({ success: true, messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipient_id, content, transaction_id } = await request.json();

    if (!recipient_id || !content) {
      return NextResponse.json({ error: 'Missing recipient ID or message text' }, { status: 400 });
    }

    const [msg] = await sql`
      INSERT INTO messages (sender_id, recipient_id, content, transaction_id, is_read)
      VALUES (${user.id}, ${recipient_id}, ${content}, ${transaction_id || null}, false)
      RETURNING *
    `;

    // Also trigger in-app notification
    await sql`
      INSERT INTO notifications (user_id, type, title, content, link)
      VALUES (
        ${recipient_id}, 'message', 'New Message',
        ${`You received a new message from ${user.name}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`},
        '/messages'
      )
    `;

    return NextResponse.json({ success: true, message: msg });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
