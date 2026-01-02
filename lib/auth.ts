import { cookies } from "next/headers"
import { sql } from "./db"
import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  role: "customer" | "admin"
  created_at: Date
}

export interface Session {
  user: User
}

// Create JWT token
export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET)
}

// Verify JWT token
export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as { userId: string }
  } catch {
    return null
  }
}

// Get current session from cookies
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth-token")?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  const result = await sql`
    SELECT id, email, name, phone, address, city, postal_code, country, role, created_at
    FROM users WHERE id = ${payload.userId}::uuid
  `

  if (result.length === 0) return null

  return { user: result[0] as User }
}

// Sign up user
export async function signUp(
  email: string,
  password: string,
  name: string,
): Promise<{ user: User; token: string } | { error: string }> {
  try {
    // Check if user exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email}`
    if (existing.length > 0) {
      return { error: "Email already registered" }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const result = await sql`
      INSERT INTO users (email, password_hash, name, role)
      VALUES (${email}, ${hashedPassword}, ${name}, 'customer')
      RETURNING id, email, name, phone, address, city, postal_code, country, role, created_at
    `

    const user = result[0] as User
    const token = await createToken(user.id)

    return { user, token }
  } catch (error) {
    console.error("Sign up error:", error)
    return { error: "Failed to create account" }
  }
}

// Sign in user
export async function signIn(
  email: string,
  password: string,
): Promise<{ user: User; token: string } | { error: string }> {
  try {
    const result = await sql`
      SELECT id, email, name, phone, address, city, postal_code, country, role, created_at, password_hash
      FROM users WHERE email = ${email}
    `

    if (result.length === 0) {
      return { error: "Invalid email or password" }
    }

    const user = result[0]
    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
      return { error: "Invalid email or password" }
    }

    const token = await createToken(user.id)

    // Remove password_hash from user object
    const { password_hash, ...userWithoutPassword } = user

    return { user: userWithoutPassword as User, token }
  } catch (error) {
    console.error("Sign in error:", error)
    return { error: "Failed to sign in" }
  }
}

// Sign out - clear cookie
export async function signOut(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("auth-token")
}

// Set auth cookie
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const session = await getSession()
  return session?.user?.role === "admin"
}

// Require authentication - returns user or throws
export async function requireAuth(): Promise<User> {
  const session = await getSession()
  if (!session) {
    throw new Error("Unauthorized")
  }
  return session.user
}

// Require admin - returns user or throws
export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  if (user.role !== "admin") {
    throw new Error("Forbidden")
  }
  return user
}
