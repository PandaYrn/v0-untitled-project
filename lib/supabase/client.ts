import { createClient } from "@supabase/supabase-js"

let browserSupabaseClient = null

export function getBrowserSupabaseClient() {
  if (browserSupabaseClient) return browserSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  browserSupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return browserSupabaseClient
}

// Add the missing export
export function createClientSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}
