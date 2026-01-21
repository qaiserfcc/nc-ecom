import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

// GET - List abandoned carts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    let query = `
      SELECT 
        ac.*,
        u.email,
        u.name as user_name,
        o.total as cart_value
      FROM abandoned_carts ac
      LEFT JOIN users u ON ac.user_id = u.id
      LEFT JOIN orders o ON ac.order_id = o.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND ac.recovery_status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += `
      ORDER BY ac.created_at DESC
      LIMIT $${paramIndex}
    `;
    params.push(limit);

    const result = await executeQuery(query, params);

    return NextResponse.json({
      success: true,
      abandonedCarts: result.rows,
    });
  } catch (error) {
    console.error('Error fetching abandoned carts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch abandoned carts' },
      { status: 500 }
    );
  }
}

// POST - Process abandoned cart recovery
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { checkForAbandoned = true } = body;

    if (!checkForAbandoned) {
      return NextResponse.json(
        { success: false, error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Find abandoned orders (created > 1 hour ago, status pending/abandoned, no payment)
    const abandonedQuery = `
      SELECT DISTINCT
        o.id as order_id,
        o.user_id,
        o.total,
        o.items,
        o.created_at,
        u.email,
        u.name
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.status IN ('pending', 'abandoned')
        AND o.created_at < NOW() - INTERVAL '1 hour'
        AND o.created_at > NOW() - INTERVAL '7 days'
        AND NOT EXISTS (
          SELECT 1 FROM abandoned_carts ac
          WHERE ac.order_id = o.id
        )
    `;

    const abandonedResult = await executeQuery(abandonedQuery, []);
    const abandonedOrders = abandonedResult.rows;

    // Insert new abandoned carts
    const insertPromises = abandonedOrders.map((order) => {
      return executeQuery(
        `
        INSERT INTO abandoned_carts (
          user_id, order_id, cart_value, cart_items,
          recovery_status, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, 'pending', NOW(), NOW())
        `,
        [
          order.user_id,
          order.order_id,
          order.total,
          order.items,
        ]
      );
    });

    await Promise.all(insertPromises);

    // Now process reminders
    const processed = await processReminders();

    return NextResponse.json({
      success: true,
      message: 'Abandoned cart recovery processed',
      newAbandoned: abandonedOrders.length,
      remindersProcessed: processed,
    });
  } catch (error) {
    console.error('Error processing abandoned carts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process abandoned carts' },
      { status: 500 }
    );
  }
}

async function processReminders() {
  let remindersSent = 0;

  // First reminder: 1 hour after abandonment (if not sent)
  const firstReminderQuery = `
    SELECT ac.*, u.email, u.name, o.total, o.items
    FROM abandoned_carts ac
    JOIN users u ON ac.user_id = u.id
    JOIN orders o ON ac.order_id = o.id
    WHERE ac.recovery_status = 'pending'
      AND ac.first_reminder_sent_at IS NULL
      AND ac.created_at < NOW() - INTERVAL '1 hour'
  `;

  const firstReminders = await executeQuery(firstReminderQuery, []);

  for (const cart of firstReminders.rows) {
    // Send first reminder email (5% discount)
    await sendReminderEmail(cart, 1, 5);
    
    await executeQuery(
      `
      UPDATE abandoned_carts
      SET first_reminder_sent_at = NOW(), updated_at = NOW()
      WHERE id = $1
      `,
      [cart.id]
    );

    remindersSent++;
  }

  // Second reminder: 24 hours (if first sent > 23 hours ago)
  const secondReminderQuery = `
    SELECT ac.*, u.email, u.name, o.total, o.items
    FROM abandoned_carts ac
    JOIN users u ON ac.user_id = u.id
    JOIN orders o ON ac.order_id = o.id
    WHERE ac.recovery_status = 'pending'
      AND ac.first_reminder_sent_at IS NOT NULL
      AND ac.second_reminder_sent_at IS NULL
      AND ac.first_reminder_sent_at < NOW() - INTERVAL '23 hours'
  `;

  const secondReminders = await executeQuery(secondReminderQuery, []);

  for (const cart of secondReminders.rows) {
    // Send second reminder email (10% discount)
    await sendReminderEmail(cart, 2, 10);
    
    await executeQuery(
      `
      UPDATE abandoned_carts
      SET second_reminder_sent_at = NOW(), updated_at = NOW()
      WHERE id = $1
      `,
      [cart.id]
    );

    remindersSent++;
  }

  // Third reminder: 72 hours (if second sent > 47 hours ago)
  const thirdReminderQuery = `
    SELECT ac.*, u.email, u.name, o.total, o.items
    FROM abandoned_carts ac
    JOIN users u ON ac.user_id = u.id
    JOIN orders o ON ac.order_id = o.id
    WHERE ac.recovery_status = 'pending'
      AND ac.second_reminder_sent_at IS NOT NULL
      AND ac.third_reminder_sent_at IS NULL
      AND ac.second_reminder_sent_at < NOW() - INTERVAL '47 hours'
  `;

  const thirdReminders = await executeQuery(thirdReminderQuery, []);

  for (const cart of thirdReminders.rows) {
    // Send third reminder email (15% discount - final offer)
    await sendReminderEmail(cart, 3, 15);
    
    await executeQuery(
      `
      UPDATE abandoned_carts
      SET third_reminder_sent_at = NOW(), updated_at = NOW()
      WHERE id = $1
      `,
      [cart.id]
    );

    remindersSent++;
  }

  return remindersSent;
}

async function sendReminderEmail(cart: any, reminderNumber: number, discountPercent: number) {
  // Generate discount code
  const discountCode = `CART${discountPercent}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // In production, send email via email service
  // For now, just log and track event
  console.log(`Sending reminder ${reminderNumber} to ${cart.email} with code ${discountCode}`);

  // Track event
  await executeQuery(
    `
    INSERT INTO marketing_events (
      event_type, user_id, event_data, created_at
    ) VALUES ($1, $2, $3, NOW())
    `,
    [
      'abandoned_cart_reminder',
      cart.user_id,
      JSON.stringify({
        cartId: cart.id,
        orderId: cart.order_id,
        reminderNumber,
        discountCode,
        discountPercent,
        cartValue: cart.total,
      }),
    ]
  );

  return discountCode;
}

// PUT - Update cart recovery status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cartId, status, recoveredOrderId, recoveryValue } = body;

    if (!cartId || !status) {
      return NextResponse.json(
        { success: false, error: 'Cart ID and status required' },
        { status: 400 }
      );
    }

    const updates = ['recovery_status = $1', 'updated_at = NOW()'];
    const params = [status];
    let paramIndex = 2;

    if (recoveredOrderId) {
      updates.push(`recovered_order_id = $${paramIndex}`);
      params.push(recoveredOrderId);
      paramIndex++;
    }

    if (recoveryValue !== undefined) {
      updates.push(`recovery_value = $${paramIndex}`);
      params.push(recoveryValue);
      paramIndex++;
    }

    params.push(cartId);

    const query = `
      UPDATE abandoned_carts
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await executeQuery(query, params);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Cart not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cart status updated',
      cart: result.rows[0],
    });
  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}
