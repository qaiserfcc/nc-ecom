import { neon } from "@neondatabase/serverless"
import ws from "ws"

// Configure WebSocket for Node.js environment (required for @neondatabase/serverless)
if (typeof WebSocket === 'undefined') {
  (global as any).WebSocket = ws
}

let _sql: any | null = null

function getSql() {
  if (_sql) return _sql
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Ensure .env.local contains DATABASE_URL and you start the server via `npm run dev` or `npm start` (which load env)."
    )
  }
  _sql = neon(connectionString)
  return _sql
}

// Export a callable proxy so existing `sql\`...\`` usage keeps working.
const sql: any = new Proxy(
  () => {
    throw new Error('sql proxy should not be called directly')
  },
  {
    apply(_target, thisArg, argArray) {
      return getSql().apply(thisArg, argArray as any)
    },
    get(_target, prop) {
      return (getSql() as any)[prop]
    },
  }
)

// Export both the sql function and a db object for convenience
export { sql }
export const db = sql

export async function query(text: string, params: any[] = []) {
  // Convert $1, $2, etc. to the actual values for the neon client
  // The neon client expects a tagged template, so we need to handle dynamic queries differently
  const result = await sql.transaction([sql(text, params)])
  return result[0]
}

export async function executeQuery<T = any>(queryText: string, params: any[] = []): Promise<T[]> {
  try {
    // For neon serverless, we need to use fetch-based approach for dynamic queries
    const response = await fetch(`${process.env.DATABASE_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Neon-Connection-String": process.env.DATABASE_URL!,
      },
      body: JSON.stringify({
        query: queryText,
        params: params,
      }),
    })

    if (!response.ok) {
      throw new Error("Query failed")
    }

    return await response.json()
  } catch {
    // Fallback: use sql directly with string interpolation (less safe but works)
    // This is a workaround for dynamic queries
    throw new Error("Dynamic query not supported")
  }
}
