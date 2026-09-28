import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { preferred_language } = await request.json();
    if (preferred_language !== 'en' && preferred_language !== 'ha') {
      return NextResponse.json({ error: 'Invalid language preference' }, { status: 400 });
    }

    await sql`
      UPDATE users SET preferred_language = ${preferred_language} WHERE id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating language preference:', error);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }
}
