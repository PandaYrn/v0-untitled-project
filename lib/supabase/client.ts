import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"

// Singleton instance for browser client
let browserSupabaseClient = null

/**
 * Get a singleton instance of the Supabase client for browser use
 */
export function getBrowserSupabaseClient() {
  if (browserSupabaseClient) return browserSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  browserSupabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey)
  return browserSupabaseClient
}

/**
 * Create a new Supabase client instance for client-side use
 * This is useful when you need a fresh client instance rather than the singleton
 */
export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
