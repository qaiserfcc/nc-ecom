import { sendWhatsAppMessage } from "../webhook/route"
import { db } from "@/lib/db"

// Order status notification templates
const STATUS_MESSAGES = {
  pending: (orderNumber: string) =>
    `📦 *Order Update*\n\nYour order #${orderNumber} has been received and is pending confirmation.\n\nWe'll notify you once it's confirmed!`,

  confirmed: (orderNumber: string) =>
    `✅ *Order Confirmed*\n\nGreat news! Your order #${orderNumber} has been confirmed.\n\nWe're preparing your items for shipment.`,

  processing: (orderNumber: string) =>
    `⚙️ *Order Processing*\n\nYour order #${orderNumber} is being processed.\n\nYour items are being prepared for shipment.`,

  shipped: (orderNumber: string, trackingNumber?: string) =>
    `🚚 *Order Shipped*\n\nYour order #${orderNumber} has been shipped!\n\n${trackingNumber ? `📍 Tracking: ${trackingNumber}` : "You'll receive tracking details soon."}\n\nExpected delivery: 3-5 business days`,

  out_for_delivery: (orderNumber: string) =>
    `🏃 *Out for Delivery*\n\nYour order #${orderNumber} is out for delivery!\n\nExpect delivery today. Please be available to receive your package.`,

  delivered: (orderNumber: string) =>
    `🎉 *Order Delivered*\n\nYour order #${orderNumber} has been delivered!\n\nThank you for shopping with Namecheap. We hope you love your purchase!\n\n⭐ Rate your experience: [Link]`,

  cancelled: (orderNumber: string, reason?: string) =>
    `❌ *Order Cancelled*\n\nYour order #${orderNumber} has been cancelled.\n\n${reason ? `Reason: ${reason}` : ""}\n\nIf you have questions, please contact us.`,

  refunded: (orderNumber: string, amount: number) =>
    `💰 *Refund Processed*\n\nYour refund for order #${orderNumber} has been processed.\n\nAmount: Rs. ${amount.toLocaleString()}\n\nPlease allow 5-7 business days for the refund to reflect in your account.`,
}

// Send order status notification via WhatsApp
export async function sendOrderStatusNotification(
  orderId: number,
  newStatus: string,
  additionalData?: {
    trackingNumber?: string
    reason?: string
    amount?: number
  }
) {
  try {
    // Get order details
    const orders = await db`
      SELECT 
        o.id,
        o.order_number,
        o.status,
        o.total_amount,
        o.metadata,
        u.phone,
        u.name,
        u.email
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
    `

    if (orders.length === 0) {
      console.error(`Order ${orderId} not found`)
      return false
    }

    const order = orders[0]
    let customerPhone: string | null = order.phone

    // Check if order has WhatsApp metadata
    const metadata = order.metadata ? JSON.parse(order.metadata) : {}
    if (metadata.customerPhone) {
      customerPhone = metadata.customerPhone
    }

    if (!customerPhone) {
      console.log(`No phone number for order ${orderId}, skipping WhatsApp notification`)
      return false
    }

    // Clean phone number (remove + and spaces)
    customerPhone = customerPhone.replace(/[\s+]/g, "")

    // Get appropriate message template
    const messageTemplate = STATUS_MESSAGES[newStatus as keyof typeof STATUS_MESSAGES]
    if (!messageTemplate) {
      console.error(`No message template for status: ${newStatus}`)
      return false
    }

    // Generate message
    let message: string
    if (newStatus === "shipped" && additionalData?.trackingNumber) {
      message = messageTemplate(order.order_number, additionalData.trackingNumber)
    } else if (newStatus === "cancelled" && additionalData?.reason) {
      message = messageTemplate(order.order_number, additionalData.reason)
    } else if (newStatus === "refunded" && additionalData?.amount) {
      message = messageTemplate(order.order_number, additionalData.amount)
    } else {
      message = messageTemplate(order.order_number)
    }

    // Send WhatsApp message
    const messageId = await sendWhatsAppMessage(customerPhone, message)

    if (messageId) {
      // Log notification
      await db`
        INSERT INTO whatsapp_logs (
          event_type,
          event_data,
          created_at
        )
        VALUES (
          'order_status_notification',
          ${JSON.stringify({
            orderId: order.id,
            orderNumber: order.order_number,
            status: newStatus,
            customerPhone,
            messageId,
            timestamp: new Date().toISOString(),
          })},
          NOW()
        )
      `

      console.log(`✅ Status notification sent for order #${order.order_number}: ${newStatus}`)
      return true
    }

    return false
  } catch (error) {
    console.error("Error sending order status notification:", error)
    return false
  }
}

// Bulk send notifications for multiple orders
export async function sendBulkOrderNotifications(
  orderIds: number[],
  status: string,
  additionalData?: Record<number, any>
) {
  const results = await Promise.allSettled(
    orderIds.map((orderId) =>
      sendOrderStatusNotification(orderId, status, additionalData?.[orderId])
    )
  )

  const successful = results.filter((r) => r.status === "fulfilled" && r.value === true).length
  const failed = results.length - successful

  console.log(`📊 Bulk notifications: ${successful} sent, ${failed} failed`)

  return { successful, failed, total: results.length }
}

// Send custom message to customer
export async function sendCustomerMessage(orderId: number, message: string) {
  try {
    const orders = await db`
      SELECT 
        o.id,
        o.order_number,
        o.metadata,
        u.phone
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE o.id = ${orderId}
    `

    if (orders.length === 0) {
      return false
    }

    const order = orders[0]
    let customerPhone: string | null = order.phone

    const metadata = order.metadata ? JSON.parse(order.metadata) : {}
    if (metadata.customerPhone) {
      customerPhone = metadata.customerPhone
    }

    if (!customerPhone) {
      return false
    }

    customerPhone = customerPhone.replace(/[\s+]/g, "")

    const messageId = await sendWhatsAppMessage(customerPhone, message)

    if (messageId) {
      await db`
        INSERT INTO whatsapp_logs (
          event_type,
          event_data,
          created_at
        )
        VALUES (
          'custom_message',
          ${JSON.stringify({
            orderId: order.id,
            orderNumber: order.order_number,
            customerPhone,
            messageId,
            message,
            timestamp: new Date().toISOString(),
          })},
          NOW()
        )
      `
      return true
    }

    return false
  } catch (error) {
    console.error("Error sending custom message:", error)
    return false
  }
}
