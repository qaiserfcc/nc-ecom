import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { parse } from 'cookie'
import { verifyToken } from './auth-token'

let io: SocketIOServer | null = null

export interface SocketUser {
  userId: string
  role: 'admin' | 'customer'
  socketId: string
}

// Store active users with their socket connections
const activeUsers = new Map<string, SocketUser>()

export function initSocketServer(server: HTTPServer) {
  if (io) {
    return io
  }

  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || '*',
      credentials: true,
    },
    path: '/api/socket',
  })

  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id)

    // Authenticate user from cookies
    const cookies = socket.handshake.headers.cookie
    if (cookies) {
      const parsedCookies = parse(cookies)
      const token = parsedCookies['auth-token']

      if (token) {
        const payload = await verifyToken(token)
        if (payload) {
          // Get user details from database
          const { sql } = await import('./db')
          const users = await sql`SELECT id, role FROM users WHERE id = ${payload.userId}::uuid`
          
          if (users.length > 0) {
            const user = users[0]
            activeUsers.set(socket.id, {
              userId: user.id,
              role: user.role,
              socketId: socket.id,
            })
            
            // Join user-specific room
            socket.join(`user:${user.id}`)
            
            // Join role-specific room
            socket.join(`role:${user.role}`)
            
            console.log(`User authenticated: ${user.id} (${user.role})`)
          }
        }
      }
    }

    socket.on('disconnect', () => {
      activeUsers.delete(socket.id)
      console.log('Client disconnected:', socket.id)
    })
  })

  return io
}

export function getSocketServer(): SocketIOServer | null {
  return io
}

// Event emission helpers
export async function emitToAdmins(event: string, data: any) {
  if (!io) return
  io.to('role:admin').emit(event, data)
}

export async function emitToUser(userId: string, event: string, data: any) {
  if (!io) return
  io.to(`user:${userId}`).emit(event, data)
}

export async function emitToUsersWithProductInCart(productId: number, event: string, data: any) {
  if (!io) return
  
  const { sql } = await import('./db')
  const cartItems = await sql`
    SELECT DISTINCT user_id FROM cart_items WHERE product_id = ${productId}
  `
  
  cartItems.forEach((item) => {
    io?.to(`user:${item.user_id}`).emit(event, data)
  })
}

export async function emitToUsersWithProductInWishlist(productId: number, event: string, data: any) {
  if (!io) return
  
  const { sql } = await import('./db')
  const wishlistItems = await sql`
    SELECT DISTINCT user_id FROM wishlists WHERE product_id = ${productId}
  `
  
  wishlistItems.forEach((item) => {
    io?.to(`user:${item.user_id}`).emit(event, data)
  })
}

export async function emitToAll(event: string, data: any) {
  if (!io) return
  io.emit(event, data)
}
