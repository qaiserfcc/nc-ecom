import { neon } from "@neondatabase/serverless"
import ws from "ws"

// Configure WebSocket for Node.js environment (required for @neondatabase/serverless)
if (typeof WebSocket === 'undefined') {
  (global as any).WebSocket = ws
}

// Create a singleton database connection
const sql = neon(process.env.DATABASE_URL!)

export { sql }

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
