# WhatsApp Integration Documentation

## Overview
WhatsApp integration has been added to enable customers to place orders and inquire via WhatsApp. The implementation includes:

1. **Header WhatsApp Button** - Quick access to WhatsApp messaging
2. **Checkout WhatsApp Payment Method** - Alternative order placement method
3. **Automated Message Generation** - Order details automatically formatted for WhatsApp

## Implementation Details

### 1. Header WhatsApp Button (`/components/header.tsx`)

**Location:** Header Actions section, left of Wishlist icon

**Features:**
- MessageCircle icon with WhatsApp green color (#25D366)
- Opens WhatsApp web with pre-filled message
- Current phone number: `923110484849` (Business WhatsApp number)

**Code:**
```tsx
<a 
  href="https://wa.me/923110484849?text=Hi%20Namecheap%2C%20I%20would%20like%20to%20place%20an%20order."
  target="_blank"
  rel="noopener noreferrer"
  className="rounded-full hover:bg-gray-100 p-2 transition-colors"
  title="Order on WhatsApp"
>
  <MessageCircle className="w-5 h-5 text-[#25D366]" />
</a>
```

### 2. Checkout WhatsApp Method (`/app/checkout/page.tsx`)

**Location:** Payment Method selection card

**Features:**
- Radio button option with value `whatsapp`
- Green branding (#25D366) with custom styling
- MessageCircle icon
- User-friendly description: "Chat with us to confirm your order"

**Code:**
```tsx
<div className="flex items-center space-x-3 p-4 border-2 border-[#25D366] bg-[#25D366]/5 rounded-2xl cursor-pointer hover:shadow-md hover:border-[#25D366]/80 transition-all duration-200 group">
  <RadioGroupItem value="whatsapp" id="whatsapp" />
  <Label htmlFor="whatsapp" className="flex items-center gap-4 cursor-pointer flex-1">
    <div className="p-2 bg-[#25D366]/20 rounded-xl group-hover:shadow-sm transition-all">
      <MessageCircle className="w-5 h-5 text-[#25D366]" />
    </div>
    <div className="flex-1">
      <p className="font-semibold text-foreground">Order via WhatsApp</p>
      <p className="text-sm text-muted-foreground">Chat with us to confirm your order</p>
    </div>
  </Label>
</div>
```

### 3. WhatsApp Message Generation (`/app/checkout/page.tsx`)

**Function:** `generateWhatsAppMessage()`

**Message Format:**
```
🛒 *Order Summary*

*Items:*
• Item Name
  Qty: X × Rs. Price
  (Official: Rs. X → Selling: Rs. Y)

*Pricing Breakdown:*
Official Total: Rs. X
Official Discount: -X% (Rs. Y)
After Official Discount: Rs. Z
Our Active Discount: -X% (Rs. Y)
Cumulative Discount: -X% (Rs. Y)

*Final Amount: Rs. X*

*Shipping Details:*
Address: ...
Phone: ...
Notes: ...

Please confirm this order. We'll get back to you soon!
```

**Key Features:**
- Automatic calculation of per-item prices (proportional discount distribution)
- Includes all pricing tiers (Official → Selling → Discounted)
- Shows discount percentages
- Displays shipping address and phone number
- Professional formatting with emojis and bold text for emphasis

### 4. Order Placement Logic (`/app/checkout/page.tsx`)

**Function:** `handlePlaceOrder()`

**Workflow:**
1. Validates shipping address
2. Checks payment method:
   - **WhatsApp Path:**
     - Generates formatted order message
     - Encodes message for URL transmission
     - Opens `https://wa.me/{PHONE}?text={ENCODED_MESSAGE}` in new window
     - Shows success notification
     - Does NOT create order in database (manual confirmation by customer)
   
   - **Cash on Delivery Path:**
     - Creates order via `/api/orders` API
     - Stores order in database
     - Shows order confirmation page

**Code:**
```tsx
const handlePlaceOrder = async () => {
  if (!address.trim()) {
    notify.error("Missing information", "Please enter your shipping address")
    return
  }

  setLoading(true)
  setError("")
  
  // Handle WhatsApp payment method
  if (paymentMethod === "whatsapp") {
    const message = generateWhatsAppMessage()
    const whatsappNumber = "923110484849"
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`
    
    notify.success("Preparing WhatsApp message", "Opening WhatsApp...")
    window.open(whatsappUrl, "_blank")
    setLoading(false)
    return
  }

  // Handle Cash on Delivery (existing logic)
  // ...
}
```

## Configuration

### Business WhatsApp Number
- Current: `923110484849`
- Format: International format without `+` prefix (e.g., `923110484849` for +92-300-1234567)
- Location: 
  - `/components/header.tsx` - Line with wa.me URL
  - `/app/checkout/page.tsx` - Line in `handlePlaceOrder()` function

### To Update Phone Number:
1. Replace `923110484849` in `/components/header.tsx` (WhatsApp header button)
2. Replace `923110484849` in `/app/checkout/page.tsx` (handlePlaceOrder function)
3. Rebuild with `npm run build`

## User Experience Flow

### Via Header Button:
1. User clicks WhatsApp icon in header
2. WhatsApp opens with pre-filled greeting message
3. User can send message to start conversation
4. No order is created until manual confirmation

### Via Checkout:
1. User selects "Order via WhatsApp" as payment method
2. User fills in shipping details
3. User clicks "Place Order"
4. App generates detailed order message with all pricing and items
5. WhatsApp opens with formatted message
6. User reviews and sends message
7. Support team reviews and confirms order manually

## Pricing Transparency in WhatsApp Message

The WhatsApp message includes complete pricing information:
- **Official Price:** Original product price from supplier
- **Official Discount:** Price reduction before our promotion
- **Selling Price:** Price after official discount
- **Our Active Discount:** Our promotional discount applied
- **Cumulative Discount:** Total savings percentage and amount
- **Final Amount:** Total payable

This ensures customers understand the exact pricing at every stage.

## Testing

### Manual Testing Checklist:
- [ ] Header WhatsApp button opens WhatsApp with correct phone number
- [ ] Checkout WhatsApp option displays correctly
- [ ] Message formatting is clear and readable
- [ ] Pricing calculations are accurate (match cart page)
- [ ] Shipping details are included in message
- [ ] Message encodes properly (no broken characters)
- [ ] WhatsApp opens in new window (not current window)
- [ ] Cash on Delivery flow still works normally

### Build Verification:
✅ Build successful with all 60+ routes compiled (verified after WhatsApp integration)

## Advanced Features (Newly Implemented)

### 1. Webhook Integration (`/api/whatsapp/webhook`)

**Purpose:** Receive and process incoming WhatsApp messages automatically

**Features:**
- Webhook verification (GET request)
- Message reception and processing (POST request)
- Message status updates (delivery, read receipts)
- Automatic order creation from customer confirmations
- Event logging for monitoring

**Environment Variables Required:**
```
WHATSAPP_API_TOKEN=<your_token>
WHATSAPP_PHONE_NUMBER_ID=<your_id>
WHATSAPP_VERIFY_TOKEN=<random_string>
```

**Setup Instructions:**
1. Get credentials from [Facebook Developers](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)
2. Set environment variables in `.env.local`
3. Add webhook URL to WhatsApp Cloud API settings: `https://yourdomain.com/api/whatsapp/webhook`
4. Run database migration: `psql < scripts/04-whatsapp-setup.sql`

### 2. Order Status Notifications (`/api/whatsapp/notify`)

**Purpose:** Send automated order status updates via WhatsApp

**Supported Statuses:**
- `pending_confirmation` - Order awaiting confirmation
- `confirmed` - Order confirmed by support
- `processing` - Items being prepared
- `shipped` - Order dispatched with tracking
- `delivered` - Order received by customer
- `cancelled` - Order cancelled
- `on_hold` - Order on hold, needs verification

**Usage Example:**
```bash
curl -X POST https://yourdomain.com/api/whatsapp/notify \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 123,
    "status": "shipped",
    "message": "Your order is on its way!"
  }'
```

**Automatic Status Messages:**
- Each status has a pre-defined message template
- Includes emojis and formatting for better UX
- Customizable message via optional `message` parameter

### 3. Monitoring & Analytics (`/api/whatsapp/logs`)

**Purpose:** Track WhatsApp activity and performance metrics

**GET Endpoint - Retrieve Logs:**
```bash
# Get recent logs with pagination
GET /api/whatsapp/logs?limit=50&offset=0

# Filter by event type
GET /api/whatsapp/logs?eventType=message_received

# Date range filter
GET /api/whatsapp/logs?startDate=2026-01-01&endDate=2026-01-31
```

**Response Structure:**
```json
{
  "logs": [
    {
      "id": 1,
      "message_id": "wamid.xxx",
      "from_number": "923110484849",
      "message_body": "Confirm order",
      "event_type": "message_received",
      "status": "received",
      "created_at": "2026-01-08T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 1500,
    "limit": 50,
    "offset": 0,
    "pages": 30
  },
  "metrics": [
    {
      "event_type": "message_received",
      "count": 450,
      "last_occurrence": "2026-01-08T10:30:00Z"
    }
  ],
  "todayActivity": {
    "date": "2026-01-08",
    "total_events": 125,
    "messages_received": 45,
    "notifications_sent": 50,
    "orders_created": 8,
    "errors": 2
  }
}
```

**POST Endpoint - Get Statistics:**
```bash
# Get comprehensive statistics
curl -X POST https://yourdomain.com/api/whatsapp/logs \
  -H "Content-Type: application/json" \
  -d '{
    "action": "stats",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  }'

# Export logs as JSON
curl -X POST https://yourdomain.com/api/whatsapp/logs \
  -H "Content-Type: application/json" \
  -d '{
    "action": "export",
    "startDate": "2026-01-01",
    "endDate": "2026-01-31"
  }'
```

### 4. Database Tables Created

**whatsapp_logs**
- Stores all WhatsApp messages, events, and status updates
- Enables comprehensive audit trail and analytics
- Indexed for fast queries (event_type, from_number, created_at, status)

**whatsapp_daily_metrics** (View)
- Pre-calculated daily statistics
- Shows: total events, messages, notifications, orders, errors
- Helps identify trends and anomalies

**whatsapp_customer_interactions** (View)
- Customer interaction summary
- Tracks engagement and purchase history
- Useful for customer service analytics

**Extended orders Table**
- `whatsapp_message_id` - Links to WhatsApp message
- `whatsapp_customer_number` - Customer's WhatsApp number
- `last_whatsapp_notification` - Timestamp of last update

## Monitoring Dashboard Metrics

### Real-time Monitoring
- Messages received (inbound)
- Notifications sent (outbound)
- Orders created via WhatsApp
- Error rates and failures
- Message delivery rates
- Read receipt tracking

### Customer Analytics
- Unique customers count
- Average messages per customer
- Order conversion rate
- Customer engagement trends
- Peak activity times

### System Health
- Webhook errors
- API failures
- Message parsing issues
- Database connection health
- Response time metrics

## Automatic Order Creation Workflow

1. **Customer Sends Message** → WhatsApp Cloud API receives it
2. **Webhook Triggered** → `/api/whatsapp/webhook` processes message
3. **Message Analysis** → Detects if it contains order confirmation
4. **Order Creation** → Creates pending order in database
5. **Acknowledgment Sent** → Sends thank you message to customer
6. **Event Logged** → Records interaction for monitoring

### Order Confirmation Detection
The system looks for keywords: "confirm", "order", "yes", "ok", "agree", "proceed", "final", "amount"

### Order Parsing
Extracts:
- Total amount (e.g., "Rs. 5,500")
- Shipping address
- Customer name from WhatsApp profile

## Security & Best Practices

1. **API Token Storage**
   - Never commit `.env.local` to git
   - Use GitHub Secrets for CI/CD
   - Rotate tokens regularly

2. **Webhook Verification**
   - Token validation on every request
   - HTTPS only (enforce on WhatsApp settings)
   - Rate limiting recommended

3. **Data Privacy**
   - Customer phone numbers encrypted in transit
   - GDPR compliant data retention
   - Audit logs for compliance

4. **Error Handling**
   - Automatic retry on failed messages
   - Graceful fallback if webhook fails
   - Error notifications to admin

## Troubleshooting

### Webhook Not Receiving Messages
1. Verify WHATSAPP_VERIFY_TOKEN is set correctly
2. Check webhook URL is publicly accessible
3. Ensure HTTPS is working
4. Test with: `curl -X GET "https://yourdomain.com/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=TOKEN&hub.challenge=test"`

### Messages Not Sending
1. Verify WHATSAPP_API_TOKEN is valid
2. Check WHATSAPP_PHONE_NUMBER_ID is correct
3. Ensure customer number is valid WhatsApp user
4. Check API quota hasn't been exceeded

### Orders Not Creating Automatically
1. Verify database migration was run
2. Check order parsing logic for message format
3. Review logs in whatsapp_logs table
4. Ensure payment_method is set to "whatsapp"

## Monitoring Commands

```bash
# View today's activity
SELECT * FROM whatsapp_daily_metrics WHERE date = CURRENT_DATE;

# Get error logs
SELECT * FROM whatsapp_logs 
WHERE event_type = 'webhook_error' 
ORDER BY created_at DESC LIMIT 20;

# Check customer interactions
SELECT * FROM whatsapp_customer_interactions 
ORDER BY total_interactions DESC;

# Get notification send rate
SELECT 
  COUNT(*) as total_notifications,
  COUNT(*) FILTER (WHERE status = 'delivered') as delivered,
  ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'delivered') / COUNT(*), 2) as delivery_rate
FROM whatsapp_logs 
WHERE event_type = 'status_notification_sent';
```

## Future Enhancements

1. **AI-Powered Responses:** Use LLM to handle complex customer queries
2. **Multi-language Support:** Auto-translate messages
3. **Media Handling:** Support images and documents in orders
4. **CRM Integration:** Sync with external CRM systems
5. **Advanced Analytics:** Dashboards and reports
6. **A/B Testing:** Test different message templates

## Dependencies

- `next.js` - Framework
- `PostgreSQL` - Database
- Facebook WhatsApp Cloud API - Message delivery
- `lucide-react` - Icons
- Existing notification system - User feedback

## Browser Compatibility

- Desktop: WhatsApp Web (https://web.whatsapp.com)
- Mobile: WhatsApp mobile app (if installed)
- Works on all modern browsers (Chrome, Safari, Firefox, Edge)

## Phone Number Update

**Current Business WhatsApp Number:** `923110484849`

**To update phone number:**
1. Replace in `/components/header.tsx` (WhatsApp button wa.me URL)
2. Replace in `/app/checkout/page.tsx` (handlePlaceOrder function)
3. Update `WHATSAPP_BUSINESS_NUMBER` in `.env.local`
4. Run build: `npm run build`

## Support & Resources

- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Webhook Setup Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/setup)
- [Message API Reference](https://developers.facebook.com/docs/whatsapp/cloud-api/reference/messages)
- [Status Updates Guide](https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/message-statuses)
