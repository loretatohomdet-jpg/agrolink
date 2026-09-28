import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  try {
    // Fetch detailed user profile and location
    const [dbUser] = await sql`
      SELECT id, email, name, phone, role, preferred_language FROM users WHERE id = ${user.id}
    `;

    if (!dbUser) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let profile = {};
    if (dbUser.role === 'farmer') {
      const [farmer] = await sql`
        SELECT farm_name, farm_size, experience_years, cooperative_name, verification_status 
        FROM farmer_profiles WHERE id = ${dbUser.id}
      `;
      profile = farmer || {};
    } else if (dbUser.role === 'buyer') {
      const [buyer] = await sql`
        SELECT company_name, business_type, business_registration_number, website, verification_status 
        FROM buyer_profiles WHERE id = ${dbUser.id}
      `;
      profile = buyer || {};
    }

    const [location] = await sql`
      SELECT address, state, lga, community, latitude, longitude 
      FROM farm_locations WHERE user_id = ${dbUser.id}
      LIMIT 1
    `;

    return NextResponse.json({
      authenticated: true,
      user: {
        ...dbUser,
        profile,
        location: location || null
      }
    });

  } catch (error) {
    console.error('Error fetching current user:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
