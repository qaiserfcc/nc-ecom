import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

// WhatsApp webhook configuration
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "your_verify_token"
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN || ""
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || ""
const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ""

// Webhook verification (GET request)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  // Verify the webhook
  if (mode === "subscribe" && token === WHATSAPP_VERIFY_TOKEN) {
    console.log("✓ WhatsApp webhook verified")
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Invalid token" }, { status: 403 })
}

// Handle incoming WhatsApp messages (POST request)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log webhook for monitoring
    console.log("📱 WhatsApp Webhook Received:", JSON.stringify(body, null, 2))

    // Handle message events
    if (
      body.entry &&
      body.entry[0]?.changes &&
      body.entry[0].changes[0]?.value?.messages
    ) {
      const messages = body.entry[0].changes[0].value.messages
      const contacts = body.entry[0].changes[0].value.contacts

      for (const message of messages) {
        await handleIncomingMessage(message, contacts)
      }

      // Log successful processing
      await logWhatsAppEvent("message_received", {
        messageCount: messages.length,
        timestamp: new Date().toISOString(),
      })
    }

    // Handle message status updates (delivery, read receipts)
    if (body.entry && body.entry[0]?.changes && body.entry[0].changes[0]?.value?.statuses) {
      const statuses = body.entry[0].changes[0].value.statuses

      for (const status of statuses) {
        await handleMessageStatus(status)
      }
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("❌ WhatsApp webhook error:", error)
    await logWhatsAppEvent("webhook_error", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    })
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// Handle incoming messages from customers
async function handleIncomingMessage(message: any, contacts: any) {
  const customerId = message.from
  const messageId = message.id
  const timestamp = message.timestamp
  const messageBody = message.text?.body || ""
  const contactName = contacts?.[0]?.profile?.name || "Unknown"

  console.log(`📨 Message from ${contactName} (${customerId}): ${messageBody}`)

  // Check if this is an order confirmation message
  if (isOrderConfirmation(messageBody)) {
    await processOrderFromWhatsApp(customerId, contactName, messageBody, messageId)
  }

  // Store message log for monitoring
  await logWhatsAppMessage({
    messageId,
    fromNumber: customerId,
    contactName,
    messageBody,
    direction: "inbound",
    status: "received",
    timestamp: new Date(parseInt(timestamp) * 1000),
  })

  // Send acknowledgment message
  await sendWhatsAppMessage(
    customerId,
    "👍 Thanks for your message! Our team will review your order shortly."
  )
}

// Process order creation from WhatsApp message
async function processOrderFromWhatsApp(
  customerId: string,
  contactName: string,
  messageBody: string,
  messageId: string
) {
  try {
    // Extract order details from message (enhanced parsing)
    const orderData = parseOrderMessage(messageBody)

    if (!orderData) {
      console.log("⚠️ Could not parse order data from message")
      return
    }

    // Create order in database with WhatsApp source
    const order = await db.query(
      `INSERT INTO orders (
        user_id, payment_method, shipping_address, created_at, 
        status, whatsapp_message_id, whatsapp_customer_number
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        null, // WhatsApp orders may not have registered users initially
        "whatsapp",
        `Phone: ${customerId}, Name: ${contactName}\n${orderData.address}`,
        new Date(),
        "pending_confirmation", // Requires manual verification
        messageId,
        customerId,
      ]
    )

    console.log(`✅ Order #${order.rows[0].order_number} created from WhatsApp`)

    // Log event
    await logWhatsAppEvent("order_created", {
      orderId: order.rows[0].id,
      orderNumber: order.rows[0].order_number,
      customerNumber: customerId,
      timestamp: new Date().toISOString(),
    })

    // Send confirmation message
    await sendWhatsAppMessage(
      customerId,
      `✅ Thanks ${contactName}! We've received your order and will confirm shortly.\n\n📍 Order Reference: #${order.rows[0].order_number}`
    )
  } catch (error) {
    console.error("❌ Error processing WhatsApp order:", error)
    await sendWhatsAppMessage(
      customerId,
      "❌ There was an error processing your order. Please contact our support team."
    )
  }
}

// Handle delivery and read status updates
async function handleMessageStatus(status: any) {
  const messageId = status.id
  const statusValue = status.status // "sent", "delivered", "read"
  const timestamp = status.timestamp

  console.log(`📊 Message ${messageId} status: ${statusValue}`)

  // Update message log
  await db.query(
    `UPDATE whatsapp_logs 
     SET status = $1, updated_at = $2 
     WHERE message_id = $3`,
    [statusValue, new Date(parseInt(timestamp) * 1000), messageId]
  )
}

// Send WhatsApp message to customer
export async function sendWhatsAppMessage(recipientNumber: string, message: string) {
  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn("⚠️ WhatsApp API credentials not configured")
    return
  }

  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${WHATSAPP_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: recipientNumber,
          type: "text",
          text: { body: message },
        }),
      }
    )

    const data = await response.json()

    if (data.messages?.[0]?.id) {
      console.log(`✉️ Message sent to ${recipientNumber}, ID: ${data.messages[0].id}`)

      // Log outbound message
      await logWhatsAppMessage({
        messageId: data.messages[0].id,
        fromNumber: "business",
        toNumber: recipientNumber,
        messageBody: message,
        direction: "outbound",
        status: "sent",
        timestamp: new Date(),
      })

      return data.messages[0].id
    } else {
      console.error("❌ Failed to send WhatsApp message:", data)
      return null
    }
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error)
    return null
  }
}

// Detect if message is order confirmation
function isOrderConfirmation(messageBody: string): boolean {
  const confirmationKeywords = [
    "confirm",
    "order",
    "yes",
    "ok",
    "agree",
    "proceed",
    "final",
    "amount",
  ]
  const lowerMessage = messageBody.toLowerCase()
  return confirmationKeywords.some((keyword) => lowerMessage.includes(keyword))
}

// Parse order details from message
function parseOrderMessage(messageBody: string) {
  // Enhanced parsing to extract order information
  const amountMatch = messageBody.match(/Rs\.?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/)
  const addressMatch = messageBody.match(/Address:?\s*(.+?)(?:\n|$)/i)

  if (!amountMatch) {
    return null
  }

  return {
    amount: parseFloat(amountMatch[1].replace(/,/g, "")),
    address: addressMatch?.[1]?.trim() || "Not specified",
  }
}

// Log WhatsApp events for monitoring
async function logWhatsAppEvent(
  eventType: string,
  eventData: Record<string, any>
) {
  try {
    await db.query(
      `INSERT INTO whatsapp_logs (
        event_type, event_data, created_at
      ) VALUES ($1, $2, $3)`,
      [eventType, JSON.stringify(eventData), new Date()]
    )
  } catch (error) {
    console.error("❌ Error logging WhatsApp event:", error)
  }
}

// Log WhatsApp messages for monitoring
async function logWhatsAppMessage(logData: Record<string, any>) {
  try {
    await db.query(
      `INSERT INTO whatsapp_logs (
        message_id, from_number, to_number, message_body, direction, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        logData.messageId,
        logData.fromNumber,
        logData.toNumber || null,
        logData.messageBody,
        logData.direction,
        logData.status,
        logData.timestamp,
      ]
    )
  } catch (error) {
    console.error("❌ Error logging WhatsApp message:", error)
  }
}
