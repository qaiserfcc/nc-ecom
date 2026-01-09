'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { toast } from 'sonner'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
})

export function useSocket() {
  return useContext(SocketContext)
}

interface NotificationData {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  productId?: number
  orderId?: number
  discountId?: number
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io({
      path: '/api/socket',
      autoConnect: true,
    })

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id)
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected')
      setIsConnected(false)
    })

    // Listen for real-time notifications
    socketInstance.on('notification', (data: NotificationData) => {
      switch (data.type) {
        case 'success':
          toast.success(data.title, { description: data.message })
          break
        case 'error':
          toast.error(data.title, { description: data.message })
          break
        case 'warning':
          toast.warning(data.title, { description: data.message })
          break
        default:
          toast.info(data.title, { description: data.message })
      }
    })

    // Product price change
    socketInstance.on('product:price-changed', (data: any) => {
      toast.info('Price Update', {
        description: `${data.productName} price changed from Rs ${data.oldPrice} to Rs ${data.newPrice}`,
        action: data.productSlug ? {
          label: 'View Product',
          onClick: () => window.location.href = `/product/${data.productSlug}`,
        } : undefined,
      })
    })

    // Discount percentage change
    socketInstance.on('discount:percentage-changed', (data: any) => {
      toast.info('Discount Updated', {
        description: `${data.discountCode} changed from ${data.oldPercentage}% to ${data.newPercentage}% off`,
      })
    })

    // New promotion added
    socketInstance.on('promotion:new', (data: any) => {
      toast.success('New Promotion!', {
        description: `${data.discountCode}: ${data.percentage}% off - ${data.description}`,
      })
    })

    // Order placed
    socketInstance.on('order:placed', (data: any) => {
      toast.success('New Order Received', {
        description: `Order #${data.orderNumber} - Rs ${data.totalAmount}`,
        action: {
          label: 'View Order',
          onClick: () => window.location.href = `/admin/orders/${data.orderId}`,
        },
      })
    })

    // Order status changed
    socketInstance.on('order:status-changed', (data: any) => {
      toast.info('Order Status Updated', {
        description: `Order #${data.orderNumber} is now ${data.status}`,
        action: {
          label: 'View Order',
          onClick: () => window.location.href = `/orders/${data.orderId}`,
        },
      })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
