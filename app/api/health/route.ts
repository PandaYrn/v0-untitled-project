import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { testConnection as testNeonConnection } from "@/lib/neon/client"

export async function GET() {
  const healthStatus = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      supabase: {
        status: "unknown",
        message: "",
      },
      neon: {
        status: "unknown",
        message: "",
      },
    },
  }

  // Check Supabase connection
  try {
    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      healthStatus.services.supabase.status = "error"
      healthStatus.services.supabase.message = error.message
      healthStatus.status = "degraded"
    } else {
      healthStatus.services.supabase.status = "ok"
      healthStatus.services.supabase.message = "Connected successfully"
    }
  } catch (error) {
    healthStatus.services.supabase.status = "error"
    healthStatus.services.supabase.message = error.message
    healthStatus.status = "degraded"
  }

  // Check Neon connection
  try {
    const neonConnected = await testNeonConnection()

    if (neonConnected) {
      healthStatus.services.neon.status = "ok"
      healthStatus.services.neon.message = "Connected successfully"
    } else {
      healthStatus.services.neon.status = "error"
      healthStatus.services.neon.message = "Failed to connect"
      healthStatus.status = "degraded"
    }
  } catch (error) {
    healthStatus.services.neon.status = "error"
    healthStatus.services.neon.message = error.message
    healthStatus.status = "degraded"
  }

  return NextResponse.json(healthStatus)
}
