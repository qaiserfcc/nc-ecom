import {
  emitToAdmins,
  emitToUser,
  emitToUsersWithProductInCart,
  emitToUsersWithProductInWishlist,
} from './socket-server'

export const SocketEvents = {
  // Product events
  async notifyProductPriceChange(productId: number, productName: string, productSlug: string, oldPrice: number, newPrice: number) {
    const data = { productId, productName, productSlug, oldPrice, newPrice, timestamp: new Date().toISOString() }
    await Promise.all([
      emitToUsersWithProductInCart(productId, 'product:price-changed', data),
      emitToUsersWithProductInWishlist(productId, 'product:price-changed', data),
      emitToAdmins('product:price-changed', data),
    ])
  },

  // Discount events
  async notifyNewPromotion(discountCode: string, percentage: number, description: string) {
    const data = { discountCode, percentage, description, timestamp: new Date().toISOString() }
    const io = await import('./socket-server').then(m => m.getSocketServer())
    io?.emit('promotion:new', data)
  },

  async notifyDiscountPercentageChange(discountCode: string, oldPercentage: number, newPercentage: number) {
    const data = { discountCode, oldPercentage, newPercentage, timestamp: new Date().toISOString() }
    const io = await import('./socket-server').then(m => m.getSocketServer())
    io?.emit('discount:percentage-changed', data)
  },

  // Order events
  async notifyOrderPlaced(orderId: number, orderNumber: string, userId: string, totalAmount: number) {
    const data = { orderId, orderNumber, userId, totalAmount, timestamp: new Date().toISOString() }
    await Promise.all([
      emitToAdmins('order:placed', data),
      emitToUser(userId, 'order:placed', data),
    ])
  },

  async notifyOrderStatusChange(orderId: number, orderNumber: string, userId: string, status: string) {
    const data = { orderId, orderNumber, userId, status, timestamp: new Date().toISOString() }
    await Promise.all([
      emitToUser(userId, 'order:status-changed', data),
      emitToAdmins('order:status-changed', data),
    ])
  },
}
