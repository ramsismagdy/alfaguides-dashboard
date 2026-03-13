import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

function normalizeRole(roleValue) {
  const role = String(roleValue || "").trim().toLowerCase().replace(/[\s-]+/g, "_")

  if (role === "admin" || role === "designer" || role === "dentist" || role === "external_lab") {
    return role
  }

  return ""
}

export async function POST(request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY." },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get("authorization") || ""
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "").trim()
    if (!token) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    })

    const {
      data: { user: requester },
      error: requesterError
    } = await authClient.auth.getUser(token)

    if (requesterError || !requester) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
    }

    const { data: requesterProfile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", requester.id)
      .maybeSingle()

    const requesterRole = normalizeRole(requesterProfile?.role || requester.user_metadata?.role)

    if (profileError || requesterRole !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 })
    }

    let body = null

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
    }

    const fullName = String(body?.full_name || "").trim()
    const email = String(body?.email || "").trim().toLowerCase()
    const password = String(body?.password || "")
    const role = normalizeRole(body?.role)
    const phone = String(body?.phone || "").trim()
    const companyName = String(body?.company_name || "").trim()

    if (!fullName || !email || !password || !role) {
      return NextResponse.json(
        { error: "Full name, email, password, and role are required." },
        { status: 400 }
      )
    }

    if (!["admin", "designer", "external_lab"].includes(role)) {
      return NextResponse.json({ error: "Invalid role." }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      )
    }

    const { data: existingUsers, error: existingUserError } = await adminClient.auth.admin.listUsers()
    if (existingUserError) {
      return NextResponse.json(
        { error: existingUserError.message || "Unable to verify existing users." },
        { status: 500 }
      )
    }

    const duplicate = (existingUsers?.users || []).find(
      (user) => String(user.email || "").trim().toLowerCase() === email
    )

    if (duplicate) {
      return NextResponse.json({ error: "A user with this email already exists." }, { status: 400 })
    }

    const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role,
        phone,
        company_name: companyName
      }
    })

    if (createError) {
      return NextResponse.json(
        { error: createError.message || "Failed to create auth user." },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      email,
      role,
      user_id: createdUser?.user?.id || null
    })
  } catch (error) {
    console.error("Admin create user route error:", error)
    return NextResponse.json(
      { error: error?.message || "Unexpected server error." },
      { status: 500 }
    )
  }
}
