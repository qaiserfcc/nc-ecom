# WhatsApp Integration - Setup & Usage Guide

## Overview

This e-commerce platform has a complete WhatsApp Business API integration for order management, customer notifications, and support metrics.

**Business WhatsApp Number:** `923110484849`

## Features Implemented

### 1. ✅ Webhook for Automatic Order Creation
- **Endpoint:** `/api/whatsapp/webhook`
- Automatically creates orders from WhatsApp messages
- Verifies webhook with WhatsApp Business API
- Parses order details from customer messages
- Confirms orders via WhatsApp
- Logs all events for monitoring

### 2. 📱 Order Status Notifications
- **Endpoint:** `/api/whatsapp/notifications`
- Automatic notifications for order status changes:
  - ✅ **Confirmed** - Order confirmed
  - ⚙️ **Processing** - Order being prepared
  - 🚚 **Shipped** - Order shipped with tracking
  - 🏃 **Out for Delivery** - Delivery in progress
  - 🎉 **Delivered** - Order delivered
  - ❌ **Cancelled** - Order cancelled
  - 💰 **Refunded** - Refund processed

### 3. 📊 Customer Service Metrics & Monitoring
- **Endpoint:** `/api/whatsapp/metrics`
- Real-time metrics dashboard:
  - Total messages (inbound/outbound)
  - Average response time
  - Orders created via WhatsApp
  - Delivery success rate
  - Peak hours analysis
  - Customer engagement stats
  - Conversion rate tracking
- CSV export for reporting
- Database logging for all WhatsApp events

### 4. 🔧 Phone Number Updated
All instances of the phone number have been updated to: **923110484849**

## Setup Instructions

### Step 1: Database Setup

Run the database migration script:

```bash
psql $DATABASE_URL < scripts/04-whatsapp-tables.sql
```

This creates:
- `whatsapp_logs` table for message logging
- Indexes for performance
- Views for metrics
- Triggers for auto-generated order numbers

### Step 2: Environment Variables

Copy the WhatsApp configuration to your `.env.local`:

```bash
cp .env.whatsapp.example .env.local
```

Then fill in the values:

```env
# WhatsApp Business API Credentials
WHATSAPP_API_TOKEN=your_whatsapp_api_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here

# Webhook Verification Token (any random string)
WHATSAPP_VERIFY_TOKEN=your_secure_random_token_here

# Business WhatsApp Number
WHATSAPP_BUSINESS_NUMBER=923110484849
```

### Step 3: WhatsApp Business API Setup

1. **Create a Facebook Developer Account**
   - Go to https://developers.facebook.com/
   - Create an app with WhatsApp product

2. **Get API Credentials**
   - Navigate to WhatsApp → API Setup
   - Copy your Phone Number ID
   - Copy your Access Token
   - Copy your Business Account ID

3. **Configure Webhook**
   - URL: `https://yourdomain.com/api/whatsapp/webhook`
   - Verify Token: (same as `WHATSAPP_VERIFY_TOKEN` in .env)
   - Subscribe to: `messages`, `message_status`

4. **Test Webhook**
   ```bash
   curl "https://yourdomain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=YOUR_TOKEN&hub.challenge=CHALLENGE"
   ```

### Step 4: Deploy & Verify

1. **Deploy your application**
   ```bash
   npm run build
   npm run start
   ```

2. **Test the webhook** from WhatsApp Business API dashboard

3. **Send a test message** to your business number

## API Endpoints

### Webhook Endpoint
```
GET  /api/whatsapp/webhook  - Webhook verification
POST /api/whatsapp/webhook  - Receive WhatsApp messages
```

### Notifications Endpoint
```typescript
// Send order status notification
import { sendOrderStatusNotification } from "@/app/api/whatsapp/notifications/route"

await sendOrderStatusNotification(orderId, "shipped", {
  trackingNumber: "TRACK123456"
})
```

### Metrics Endpoint
```
GET /api/whatsapp/metrics?type=summary    - Get metrics summary
GET /api/whatsapp/metrics?type=logs       - Get message logs
GET /api/whatsapp/metrics?type=metrics    - Get detailed metrics
POST /api/whatsapp/metrics                - Export as CSV
```

### Update Order Status (with auto-notification)
```
PUT /api/orders/[id]
{
  "status": "shipped",
  "trackingNumber": "TRACK123456"
}
```

## Usage Examples

### 1. Update Order Status (Triggers WhatsApp Notification)

```typescript
// Update order status - automatically sends WhatsApp notification
const response = await fetch(`/api/orders/${orderId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: "shipped",
    trackingNumber: "TRACK123456"
  })
})
```

### 2. Send Custom Message to Customer

```typescript
import { sendCustomerMessage } from "@/app/api/whatsapp/notifications/route"

await sendCustomerMessage(orderId, "Your order will arrive tomorrow!")
```

### 3. Get WhatsApp Metrics

```typescript
// Get summary metrics
const response = await fetch("/api/whatsapp/metrics?type=summary")
const metrics = await response.json()

console.log(metrics.summary.totalMessages)
console.log(metrics.summary.averageResponseTime)
console.log(metrics.summary.orderCreated)
```

### 4. Export Logs as CSV

```typescript
const response = await fetch("/api/whatsapp/metrics", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    startDate: "2026-01-01",
    endDate: "2026-01-31"
  })
})

const blob = await response.blob()
// Download CSV file
```

## Message Templates

### Order Status Messages

**Confirmed:**
```
✅ *Order Confirmed*

Great news! Your order #ORD-000123 has been confirmed.

We're preparing your items for shipment.
```

**Shipped:**
```
🚚 *Order Shipped*

Your order #ORD-000123 has been shipped!

📍 Tracking: TRACK123456

Expected delivery: 3-5 business days
```

**Delivered:**
```
🎉 *Order Delivered*

Your order #ORD-000123 has been delivered!

Thank you for shopping with Namecheap. We hope you love your purchase!

⭐ Rate your experience: [Link]
```

## Monitoring & Metrics

### Available Metrics

1. **Message Volume**
   - Total messages
   - Inbound vs Outbound
   - Daily/Weekly trends

2. **Performance**
   - Average response time
   - Delivery success rate
   - Failed message count

3. **Business Metrics**
   - Orders created via WhatsApp
   - Conversion rate
   - Customer engagement

4. **Customer Service**
   - Peak hours
   - Top customers
   - General inquiries

### View Metrics in Dashboard

Access the admin panel and navigate to:
```
/admin/analytics?tab=whatsapp
```

## Troubleshooting

### Webhook Not Receiving Messages

1. **Check webhook URL is publicly accessible**
   ```bash
   curl https://yourdomain.com/api/whatsapp/webhook
   ```

2. **Verify webhook subscription** in Facebook Dashboard

3. **Check environment variables**
   ```bash
   echo $WHATSAPP_VERIFY_TOKEN
   ```

### Messages Not Sending

1. **Verify API token** is valid
2. **Check phone number format** (no + prefix)
3. **Review API logs**:
   ```bash
   # Check server logs
   npm run dev
   ```

### Order Not Created from WhatsApp

1. **Check message format** matches expected pattern
2. **Review webhook logs**:
   ```sql
   SELECT * FROM whatsapp_logs 
   WHERE event_type = 'message_received' 
   ORDER BY created_at DESC LIMIT 10;
   ```

## Security Best Practices

1. **Protect Webhook Endpoint**
   - Always verify the webhook token
   - Validate incoming message format
   - Rate limit requests

2. **Secure API Tokens**
   - Never commit tokens to git
   - Use environment variables
   - Rotate tokens regularly

3. **Validate Phone Numbers**
   - Sanitize input
   - Verify format
   - Block spam numbers

## Database Schema

### whatsapp_logs Table

```sql
CREATE TABLE whatsapp_logs (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100),
    message_id VARCHAR(255),
    from_number VARCHAR(20),
    to_number VARCHAR(20),
    message_body TEXT,
    direction VARCHAR(20),  -- 'inbound' or 'outbound'
    status VARCHAR(50),     -- 'sent', 'delivered', 'read', 'failed'
    event_data JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Orders Metadata

Orders now include WhatsApp metadata:

```typescript
{
  source: "whatsapp",
  customerPhone: "923110484849",
  receivedAt: "2026-01-08T10:30:00Z",
  whatsappMessageId: "wamid.ABC123..."
}
```

## Testing

### Test Order Creation

Send this message to your WhatsApp Business number:

```
🛒 *Order Summary*

*Items:*
• Product Name
  Qty: 2 × Rs. 1,500

*Final Amount: Rs. 3,000*

*Shipping Details:*
Address: 123 Main St, Karachi
Phone: 923110484849
```

### Test Status Notification

```bash
curl -X PUT http://localhost:3000/api/orders/123 \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped", "trackingNumber": "TRACK123"}'
```

## Support

For issues or questions:
- **Phone:** +92-311-0484849
- **WhatsApp:** https://wa.me/923110484849
- **Email:** support@namecheap.com

## License

Proprietary - Namecheap E-commerce Platform
