import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import { sendAbandonedCartReminder } from '@/lib/email';

// Verify cron request is authorized
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.warn('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

// GET - Check for abandoned carts and send reminders
export async function GET(request: NextRequest) {
  try {
    // Verify request is from authorized cron job
    if (!verifyCronSecret(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let detectedCount = 0;
    let firstRemindersSent = 0;
    let secondRemindersSent = 0;
    let thirdRemindersSent = 0;
    let errors = [];

    // STEP 1: Detect new abandoned carts
    // Find pending orders created more than 1 hour ago that don't have abandoned cart records
    const detectResult = await executeQuery(`
      SELECT 
        o.id,
        o.user_id,
        u.email,
        u.name,
        o.total,
        o.created_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.status = 'pending'
        AND o.created_at < NOW() - INTERVAL '1 hour'
        AND o.id NOT IN (SELECT order_id FROM abandoned_carts WHERE order_id IS NOT NULL)
      LIMIT 100
    `);

    if (detectResult.rows.length > 0) {
      detectedCount = detectResult.rows.length;

      // Insert new abandoned cart records
      for (const cart of detectResult.rows) {
        try {
          await executeQuery(
            `
            INSERT INTO abandoned_carts (
              user_id,
              order_id,
              cart_value,
              recovery_status,
              first_reminder_sent_at,
              created_at
            ) VALUES ($1, $2, $3, $4, NOW(), NOW())
            ON CONFLICT (order_id) DO NOTHING
            `,
            [cart.user_id, cart.id, cart.total, 'reminder_1_sent']
          );

          // Send first reminder immediately
          const emailResult = await sendAbandonedCartReminder(
            cart.email,
            cart.name || 'Customer',
            cart.total,
            1,
            `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ncecom.com'}/cart`
          );

          if (emailResult.success) {
            firstRemindersSent++;
          } else {
            errors.push({
              email: cart.email,
              step: 'first_reminder',
              error: emailResult.error,
            });
          }
        } catch (error) {
          errors.push({
            orderId: cart.id,
            step: 'detect_and_first_reminder',
            error: String(error),
          });
        }
      }
    }

    // STEP 2: Send second reminders (24+ hours after first reminder)
    const secondReminderResult = await executeQuery(`
      SELECT 
        ac.id,
        ac.order_id,
        ac.user_id,
        ac.cart_value,
        u.email,
        u.name
      FROM abandoned_carts ac
      JOIN users u ON ac.user_id = u.id
      WHERE ac.recovery_status = 'reminder_1_sent'
        AND ac.first_reminder_sent_at < NOW() - INTERVAL '23 hours'
        AND ac.second_reminder_sent_at IS NULL
      LIMIT 50
    `);

    if (secondReminderResult.rows.length > 0) {
      for (const cart of secondReminderResult.rows) {
        try {
          const emailResult = await sendAbandonedCartReminder(
            cart.email,
            cart.name || 'Customer',
            cart.cart_value,
            2,
            `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ncecom.com'}/cart`
          );

          if (emailResult.success) {
            secondRemindersSent++;
            await executeQuery(
              `
              UPDATE abandoned_carts
              SET recovery_status = 'reminder_2_sent',
                  second_reminder_sent_at = NOW(),
                  updated_at = NOW()
              WHERE id = $1
              `,
              [cart.id]
            );
          } else {
            errors.push({
              email: cart.email,
              step: 'second_reminder',
              error: emailResult.error,
            });
          }
        } catch (error) {
          errors.push({
            cartId: cart.id,
            step: 'second_reminder',
            error: String(error),
          });
        }
      }
    }

    // STEP 3: Send third reminders (72+ hours after second reminder)
    const thirdReminderResult = await executeQuery(`
      SELECT 
        ac.id,
        ac.order_id,
        ac.user_id,
        ac.cart_value,
        u.email,
        u.name
      FROM abandoned_carts ac
      JOIN users u ON ac.user_id = u.id
      WHERE ac.recovery_status = 'reminder_2_sent'
        AND ac.second_reminder_sent_at < NOW() - INTERVAL '47 hours'
        AND ac.third_reminder_sent_at IS NULL
      LIMIT 50
    `);

    if (thirdReminderResult.rows.length > 0) {
      for (const cart of thirdReminderResult.rows) {
        try {
          const emailResult = await sendAbandonedCartReminder(
            cart.email,
            cart.name || 'Customer',
            cart.cart_value,
            3,
            `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ncecom.com'}/cart`
          );

          if (emailResult.success) {
            thirdRemindersSent++;
            await executeQuery(
              `
              UPDATE abandoned_carts
              SET recovery_status = 'expired',
                  third_reminder_sent_at = NOW(),
                  updated_at = NOW()
              WHERE id = $1
              `,
              [cart.id]
            );
          } else {
            errors.push({
              email: cart.email,
              step: 'third_reminder',
              error: emailResult.error,
            });
          }
        } catch (error) {
          errors.push({
            cartId: cart.id,
            step: 'third_reminder',
            error: String(error),
          });
        }
      }
    }

    // STEP 4: Mark recovered orders (completed after abandonment)
    await executeQuery(`
      UPDATE abandoned_carts ac
      SET recovery_status = 'recovered',
          updated_at = NOW()
      WHERE ac.recovery_status IN ('reminder_1_sent', 'reminder_2_sent', 'reminder_3_sent')
        AND ac.order_id IN (
          SELECT id FROM orders 
          WHERE status IN ('completed', 'paid') 
            AND updated_at > ac.created_at
        )
    `);

    // Log cron execution
    const summary = {
      detected: detectedCount,
      firstReminders: firstRemindersSent,
      secondReminders: secondRemindersSent,
      thirdReminders: thirdRemindersSent,
      errors: errors.length > 0 ? errors.slice(0, 5) : undefined,
      totalErrors: errors.length,
      timestamp: new Date().toISOString(),
    };

    console.log('Abandoned cart cron completed:', summary);

    // Track cron event
    try {
      await executeQuery(
        `
        INSERT INTO marketing_events (
          event_type, event_data, created_at
        ) VALUES ($1, $2, NOW())
        `,
        [
          'abandoned_cart_cron',
          JSON.stringify({
            detected: detectedCount,
            firstReminders: firstRemindersSent,
            secondReminders: secondRemindersSent,
            thirdReminders: thirdRemindersSent,
            totalErrors: errors.length,
          }),
        ]
      );
    } catch (error) {
      console.error('Error logging cron event:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Abandoned cart cron completed',
      detected: detectedCount,
      firstReminders: firstRemindersSent,
      secondReminders: secondRemindersSent,
      thirdReminders: thirdRemindersSent,
      totalReminders:
        firstRemindersSent + secondRemindersSent + thirdRemindersSent,
      totalErrors: errors.length,
      ...(errors.length > 0 ? { sampleErrors: errors.slice(0, 3) } : {}),
    });
  } catch (error) {
    console.error('Abandoned cart cron error:', error);
    return NextResponse.json(
      { success: false, error: 'Cron job failed' },
      { status: 500 }
    );
  }
}
