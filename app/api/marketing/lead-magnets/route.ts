import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Lead Magnets Management API
 * Create and manage lead generation offers
 */

// Get all lead magnets
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get('isActive');

    let query = 'SELECT * FROM lead_magnets WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (isActive !== null) {
      query += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      leadMagnets: result.rows
    });

  } catch (error) {
    console.error('Get lead magnets error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead magnets' },
      { status: 500 }
    );
  }
}

// Create new lead magnet
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      type,
      title,
      description,
      discountType,
      discountValue,
      fileUrl,
      contentHtml,
      requiresEmail = true,
      requiresPhone = false,
      requiresInterests = false,
      minimumPurchase = 0,
      validDays = 30,
      maxUsesPerUser = 1,
      isActive = true
    } = body;

    // Validation
    if (!name || !type || !title) {
      return NextResponse.json(
        { error: 'Name, type, and title are required' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `INSERT INTO lead_magnets (
        name,
        type,
        title,
        description,
        discount_type,
        discount_value,
        file_url,
        content_html,
        requires_email,
        requires_phone,
        requires_interests,
        minimum_purchase,
        valid_days,
        max_uses_per_user,
        is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING *`,
      [
        name,
        type,
        title,
        description || null,
        discountType || null,
        discountValue || null,
        fileUrl || null,
        contentHtml || null,
        requiresEmail,
        requiresPhone,
        requiresInterests,
        minimumPurchase,
        validDays,
        maxUsesPerUser,
        isActive
      ]
    );

    return NextResponse.json({
      success: true,
      leadMagnet: result.rows[0]
    });

  } catch (error) {
    console.error('Create lead magnet error:', error);
    return NextResponse.json(
      { error: 'Failed to create lead magnet' },
      { status: 500 }
    );
  }
}

// Update lead magnet
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Lead magnet ID is required' },
        { status: 400 }
      );
    }

    const fields = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const values = Object.keys(updates)
      .filter(key => updates[key] !== undefined)
      .map(key => updates[key]);

    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const result = await executeQuery(
      `UPDATE lead_magnets SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Lead magnet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      leadMagnet: result.rows[0]
    });

  } catch (error) {
    console.error('Update lead magnet error:', error);
    return NextResponse.json(
      { error: 'Failed to update lead magnet' },
      { status: 500 }
    );
  }
}
