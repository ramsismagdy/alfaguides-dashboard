import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

export async function POST(request) {
  try {
    const body = await request.json()
    const userId = body?.userId

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    await supabase.from("login_audit").insert([
      {
        user_id: userId,
        event_type: "logout",
        ip_address: request.headers.get("x-forwarded-for") || null,
        country: request.headers.get("x-vercel-ip-country") || null,
        state_region: request.headers.get("x-vercel-ip-country-region") || null,
        city: request.headers.get("x-vercel-ip-city") || null,
        user_agent: request.headers.get("user-agent") || null
      }
    ])

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}