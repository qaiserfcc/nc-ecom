import { Client } from 'pg'
import {
  emitToAdmins,
  emitToUser,
  emitToUsersWithProductInCart,
  emitToUsersWithProductInWishlist,
  getSocketServer,
} from './socket-server'

let listenerInitialized = false

export async function initDatabaseListener() {
  if (listenerInitialized) {
    return
  }

  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set, skipping database listener initialization')
    return
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  // Set up LISTEN for each channel
  const channels = [
    'product_price_changed',
    'discount_created',
    'discount_percentage_changed',
    'order_placed',
    'order_status_changed',
    'quote_submitted',
  ]

  try {
    // Add timeout for connection (Neon serverless may have issues)
    const connectPromise = client.connect()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Database listener connection timeout')), 5000)
    )

    await Promise.race([connectPromise, timeoutPromise])

    for (const channel of channels) {
      await client.query(`LISTEN ${channel}`)
      console.log(`📡 Listening to ${channel}`)
    }

    client.on('notification', async (msg) => {
      if (!msg.channel) return
      await handleDatabaseNotification(msg.channel, msg.payload)
    })

    client.on('error', (err) => {
      console.error('Database listener connection error:', err)
    })

    listenerInitialized = true
    console.log('✅ Database notification listener initialized')
  } catch (error) {
    console.error('⚠️ Failed to initialize database listener (this is optional):', error)
    // Don't throw - listener is optional, server should continue
  }
}

// Handle database notifications
export async function handleDatabaseNotification(channel: string, payload: any) {
  const io = getSocketServer()
  if (!io) return

  try {
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload

    switch (channel) {
      case 'product_price_changed':
        // Notify users who have this product in cart or wishlist
        await emitToUsersWithProductInCart(data.productId, 'product:price-changed', data)
        await emitToUsersWithProductInWishlist(data.productId, 'product:price-changed', data)
        // Notify all admins
        await emitToAdmins('product:price-changed', data)
        break

      case 'discount_created':
        // Notify all users about new promotion
        io.emit('promotion:new', data)
        break

      case 'discount_percentage_changed':
        // Notify all users about discount change
        io.emit('discount:percentage-changed', data)
        break

      case 'order_placed':
        // Notify all admins about new order
        await emitToAdmins('order:placed', data)
        // Notify the user who placed the order
        await emitToUser(data.userId, 'order:placed', data)
        break

      case 'order_status_changed':
        // Notify the user whose order status changed
        await emitToUser(data.userId, 'order:status-changed', data)
        // Notify admins
        await emitToAdmins('order:status-changed', data)
        break

      case 'quote_submitted':
        await emitToAdmins('quote:submitted', data)
        if (data.userId) {
          await emitToUser(data.userId, 'quote:submitted', data)
        }
        break
    }
  } catch (error) {
    console.error(`Error handling ${channel} notification:`, error)
  }
}
