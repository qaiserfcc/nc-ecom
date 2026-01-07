# WhatsApp Integration - Quick Reference

## 🔢 Business Number
**923110484849**

## 📍 Key Endpoints

### Webhook
- **GET** `/api/whatsapp/webhook` - Verify
- **POST** `/api/whatsapp/webhook` - Receive messages

### Notifications
- Send notification: `sendOrderStatusNotification(orderId, status, data)`
- Custom message: `sendCustomerMessage(orderId, message)`

### Metrics
- **GET** `/api/whatsapp/metrics?type=summary` - Dashboard
- **GET** `/api/whatsapp/metrics?type=logs` - Message logs
- **POST** `/api/whatsapp/metrics` - Export CSV

### Orders (Auto-notify)
- **PUT** `/api/orders/[id]` - Update status + notify

## 🎯 Status Values

| Status | Icon | Description |
|--------|------|-------------|
| `pending` | 📦 | Order received |
| `confirmed` | ✅ | Confirmed |
| `processing` | ⚙️ | Being prepared |
| `shipped` | 🚚 | Shipped |
| `out_for_delivery` | 🏃 | Out for delivery |
| `delivered` | 🎉 | Delivered |
| `cancelled` | ❌ | Cancelled |
| `refunded` | 💰 | Refunded |

## 🔐 Environment Variables

```env
WHATSAPP_API_TOKEN=xxx
WHATSAPP_PHONE_NUMBER_ID=xxx
WHATSAPP_BUSINESS_ACCOUNT_ID=xxx
WHATSAPP_VERIFY_TOKEN=xxx
WHATSAPP_BUSINESS_NUMBER=923110484849
```

## 💻 Quick Commands

### Database Setup
```bash
psql $DATABASE_URL < scripts/04-whatsapp-tables.sql
```

### Update Order + Notify
```typescript
await fetch(`/api/orders/${id}`, {
  method: "PUT",
  body: JSON.stringify({
    status: "shipped",
    trackingNumber: "TRACK123"
  })
})
```

### Get Metrics
```typescript
const res = await fetch("/api/whatsapp/metrics?type=summary")
const metrics = await res.json()
```

## 📊 Admin Dashboard
**URL:** `/admin/whatsapp`

## 📁 Files

| File | Purpose |
|------|---------|
| `app/api/whatsapp/webhook/route.ts` | Webhook handler |
| `app/api/whatsapp/notifications/route.ts` | Notifications |
| `app/api/whatsapp/metrics/route.ts` | Metrics API |
| `app/admin/whatsapp/page.tsx` | Dashboard |
| `scripts/04-whatsapp-tables.sql` | Database |

## 🧪 Test

Send to 923110484849:
```
🛒 *Order Summary*
*Items:* Test Product
*Final Amount: Rs. 1,000*
*Shipping Details:*
Address: Test St
Phone: 923110484849
```

## ✅ Setup Checklist

- [ ] Run database migration
- [ ] Set environment variables
- [ ] Configure webhook on Facebook
- [ ] Test message reception
- [ ] Test status notification
- [ ] Check metrics dashboard
