import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { sendWhatsAppMessage } from "../webhook/route"

// Order status update notifications
export async function POST(request: NextRequest) {
  try {
    const { orderId, status, message } = await request.json()

    // Validate input
    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Missing orderId or status" },
        { status: 400 }
      )
    }

    // Get order details from database
    const orderResult = await db.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    )

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orderResult.rows[0]
    const customerId = order.whatsapp_customer_number

    if (!customerId) {
      console.log(`⚠️ Order #${order.order_number} has no WhatsApp customer number`)
      return NextResponse.json(
        { message: "Order not from WhatsApp" },
        { status: 200 }
      )
    }

    // Generate status message based on order status
    const statusMessage = generateStatusMessage(
      order.order_number,
      status,
      message
    )

    // Send WhatsApp notification
    const messageId = await sendWhatsAppMessage(customerId, statusMessage)

    if (messageId) {
      // Update order with last notification timestamp
      await db.query(
        `UPDATE orders SET last_whatsapp_notification = $1 WHERE id = $2`,
        [new Date(), orderId]
      )

      // Log notification
      await db.query(
        `INSERT INTO whatsapp_logs (
          event_type, event_data, created_at
        ) VALUES ($1, $2, $3)`,
        [
          "status_notification_sent",
          JSON.stringify({
            orderId,
            orderNumber: order.order_number,
            customerNumber: customerId,
            status,
            messageId,
          }),
          new Date(),
        ]
      )

      return NextResponse.json({
        success: true,
        message: "Status notification sent",
        messageId,
      })
    } else {
      return NextResponse.json(
        { error: "Failed to send notification" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("❌ Error sending order status notification:", error)
    return NextResponse.json(
      { error: "Failed to process notification" },
      { status: 500 }
    )
  }
}

// Generate contextual status message
function generateStatusMessage(
  orderNumber: string,
  status: string,
  customMessage?: string
): string {
  const messages: Record<string, string> = {
    pending_confirmation:
      `📦 Order #${orderNumber} is pending confirmation.\n\nPlease wait for our team to verify your order details. We'll send you a confirmation shortly.`,

    confirmed:
      `✅ Order #${orderNumber} has been confirmed!\n\n📍 Your order has been processed and is being prepared for shipment.`,

    processing:
      `⚙️ Order #${orderNumber} is being processed.\n\n🚀 We're preparing your items for shipment. You'll receive tracking info soon!`,

    shipped:
      `📦 Order #${orderNumber} has been shipped!\n\n🚚 Tracking Number: Shipment is on its way. Track your package for real-time updates.`,

    delivered:
      `🎉 Order #${orderNumber} has been delivered!\n\n✅ Thank you for your purchase! Please confirm receipt when ready.`,

    cancelled:
      `❌ Order #${orderNumber} has been cancelled.\n\n💔 If you have any questions, please contact our support team.`,

    on_hold:
      `⏸️ Order #${orderNumber} is on hold.\n\n📞 We need to verify some details. Please reply with your confirmation.`,
  }

  return customMessage || messages[status] || `📦 Order #${orderNumber} status updated to: ${status}`
}
