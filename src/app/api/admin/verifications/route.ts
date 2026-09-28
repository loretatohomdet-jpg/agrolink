import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Fetch all pending farmer applications
    const pendingFarmers = await sql`
      SELECT 
        fp.*, 
        u.name, u.email, u.phone, 
        fl.address, fl.lga, fl.community
      FROM farmer_profiles fp
      JOIN users u ON fp.id = u.id
      LEFT JOIN farm_locations fl ON fp.id = fl.user_id
      WHERE fp.verification_status IN ('pending', 'under_review')
      ORDER BY fp.created_at ASC
    `;

    // Fetch all pending buyer applications
    const pendingBuyers = await sql`
      SELECT 
        bp.*, 
        u.name, u.email, u.phone,
        fl.address, fl.lga, fl.community
      FROM buyer_profiles bp
      JOIN users u ON bp.id = u.id
      LEFT JOIN farm_locations fl ON bp.id = fl.user_id
      WHERE bp.verification_status IN ('pending')
      ORDER BY bp.created_at ASC
    `;

    return NextResponse.json({
      success: true,
      pendingFarmers,
      pendingBuyers
    });

  } catch (error) {
    console.error('Error fetching verifications:', error);
    return NextResponse.json({ error: 'Failed to fetch verification list' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    const { targetUserId, role, action } = await request.json(); // action: 'verified' | 'rejected' | 'under_review'

    if (!targetUserId || !role || !action) {
      return NextResponse.json({ error: 'Missing required validation fields' }, { status: 400 });
    }

    if (role === 'farmer') {
      await sql`
        UPDATE farmer_profiles 
        SET verification_status = ${action}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${targetUserId}
      `;
    } else if (role === 'buyer') {
      await sql`
        UPDATE buyer_profiles
        SET verification_status = ${action}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${targetUserId}
      `;
    } else {
      return NextResponse.json({ error: 'Invalid profile role' }, { status: 400 });
    }

    // Create audit log notification for the user
    const title = action === 'verified' ? 'Account Verified!' : action === 'rejected' ? 'Verification Rejected' : 'Profile Under Review';
    const message = action === 'verified' 
      ? 'Congratulations! Your profile has been verified by the administrator. You now have full access to matches and marketplace listings.' 
      : action === 'rejected' 
        ? 'Your profile verification request was rejected. Please review your details and contact support.'
        : 'Your profile has been marked as under review by an administrator.';

    await sql`
      INSERT INTO notifications (user_id, type, title, content, link)
      VALUES (${targetUserId}, 'verification', ${title}, ${message}, ${role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'})
    `;

    return NextResponse.json({ success: true, message: `Profile successfully marked as ${action}.` });

  } catch (error) {
    console.error('Error updating verification:', error);
    return NextResponse.json({ error: 'Failed to process verification action' }, { status: 500 });
  }
}
