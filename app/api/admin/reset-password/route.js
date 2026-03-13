
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function normalizeRole(role) {
  return (role || "").toString().trim().toLowerCase().replace(/[\s-]+/g, "_")
}

function isFallbackAdmin(user) {
  const email = (user?.email || "").trim().toLowerCase()
  return email === "ram@alfaguides.com" || email === "ramsismagdyramsis@yahoo.com"
}

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json({ error: "Missing Supabase environment variables." }, { status: 500 })
    }

    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : ""

    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const { data: { user: requester }, error: requesterError } = await authClient.auth.getUser(token)

    if (requesterError || !requester) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { data: requesterProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", requester.id)
      .maybeSingle()

    const requesterRole =
      normalizeRole(requesterProfile?.role) ||
      normalizeRole(requester?.user_metadata?.role) ||
      (isFallbackAdmin(requester) ? "admin" : "")

    if (requesterRole !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 })
    }

    const body = await request.json()
    const email = String(body?.email || "").trim().toLowerCase()

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 })
    }

    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/update-password`
      : undefined

    const { error } = await authClient.auth.resetPasswordForEmail(email, { redirectTo })

    if (error) {
      return NextResponse.json({ error: error.message || "Failed to send reset email." }, { status: 400 })
    }

    return NextResponse.json({ success: true, email })
  } catch (error) {
    console.error("Reset password route error:", error)
    return NextResponse.json({ error: error?.message || "Unexpected server error." }, { status: 500 })
  }
}
