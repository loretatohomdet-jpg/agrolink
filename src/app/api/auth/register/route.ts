import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, phone, role, preferred_language = 'en' } = body;

    if (!email || !password || !name || !phone || !role) {
      return NextResponse.json({ error: 'Missing required personal information' }, { status: 400 });
    }

    if (!['farmer', 'buyer', 'logistics'].includes(role)) {
      return NextResponse.json({ error: 'Invalid user role selected' }, { status: 400 });
    }

    // Check if email already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    if (existingUser) {
      return NextResponse.json({ error: 'Email address already registered' }, { status: 400 });
    }

    const passwordHash = hashPassword(password);

    // Perform database writes using a transaction block
    const userResult = await sql.begin(async (sqlTrans) => {
      // 1. Insert into users
      const [user] = await sqlTrans`
        INSERT INTO users (email, password_hash, name, phone, role, preferred_language)
        VALUES (${email}, ${passwordHash}, ${name}, ${phone}, ${role}, ${preferred_language})
        RETURNING id, email, name, role
      `;

      // 2. Insert into role-specific profiles
      if (role === 'farmer') {
        const { farm_name, farm_size, experience_years, cooperative_name, address, lga, community } = body;

        if (!farm_name || !lga) {
          throw new Error('Missing required farm details');
        }

        await sqlTrans`
          INSERT INTO farmer_profiles (id, farm_name, farm_size, experience_years, cooperative_name, verification_status)
          VALUES (${user.id}, ${farm_name}, ${farm_size ? Number(farm_size) : null}, ${experience_years ? Number(experience_years) : null}, ${cooperative_name || null}, 'pending')
        `;

        await sqlTrans`
          INSERT INTO farm_locations (user_id, address, state, lga, community)
          VALUES (${user.id}, ${address || farm_name + ' Compound'}, 'Plateau', ${lga}, ${community || null})
        `;
      } else if (role === 'buyer') {
        const { company_name, business_type, business_registration_number, website, address, lga, community } = body;

        if (!company_name || !business_type || !lga) {
          throw new Error('Missing required company details');
        }

        await sqlTrans`
          INSERT INTO buyer_profiles (id, company_name, business_type, business_registration_number, website, verification_status)
          VALUES (${user.id}, ${company_name}, ${business_type}, ${business_registration_number || null}, ${website || null}, 'pending')
        `;

        await sqlTrans`
          INSERT INTO farm_locations (user_id, address, state, lga, community)
          VALUES (${user.id}, ${address || company_name + ' Office'}, 'Plateau', ${lga}, ${community || null})
        `;
      }

      return user;
    });

    // Sign JWT token
    const token = signToken({
      id: userResult.id,
      email: userResult.email,
      name: userResult.name,
      role: userResult.role,
    });

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: userResult.id,
        email: userResult.email,
        name: userResult.name,
        role: userResult.role,
      }
    });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
