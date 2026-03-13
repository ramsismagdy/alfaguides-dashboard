import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

function normalizeRole(role) {
  return (role || "").toString().trim().toLowerCase().replace(/[\s-]+/g, "_")
}

function isFallbackAdmin(user) {
  const email = (user?.email || "").trim().toLowerCase()
  return email === "ram@alfaguides.com"
}

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_URL in .env.local" },
        { status: 500 }
      )
    }

    if (!supabaseAnonKey) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local" },
        { status: 500 }
      )
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing SUPABASE_SERVICE_ROLE_KEY in .env.local" },
        { status: 500 }
      )
    }

    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : ""

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

    const { data: requesterProfile } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", requester.id)
      .maybeSingle()

    const profileRole = normalizeRole(requesterProfile?.role)
    const metadataRole = normalizeRole(requester?.user_metadata?.role)

    const isAdmin =
      profileRole === "admin" ||
      metadataRole === "admin" ||
      isFallbackAdmin(requester)

    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 })
    }

    const body = await request.json()

    const fullName = (body?.full_name || "").trim()
    const email = (body?.email || "").trim().toLowerCase()
    const password = body?.password || ""
    const role = normalizeRole(body?.role)
    const phone = (body?.phone || "").trim()

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

    const { data: createdUser, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          role,
          phone
        }
      })

    if (createError) {
      return NextResponse.json(
        { error: createError.message || "Failed to create user." },
        { status: 400 }
      )
    }

    const userId = createdUser?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: "User was created but no user ID was returned." },
        { status: 500 }
      )
    }

    const { error: profileError } = await adminClient
      .from("profiles")
      .upsert(
        {
          id: userId,
          email,
          full_name: fullName,
          role,
          phone: phone || null
        },
        { onConflict: "id" }
      )

    if (profileError) {
      return NextResponse.json(
        {
          error: "User was created, but profile creation failed.",
          details: profileError.message,
          user_id: userId
        },
        { status: 500 }
      )
    }

    if (role === "designer") {
      const { data: existingDesigner, error: existingDesignerError } = await adminClient
        .from("designers")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (existingDesignerError) {
        return NextResponse.json(
          {
            error: "User and profile were created, but designer lookup failed.",
            details: existingDesignerError.message,
            user_id: userId
          },
          { status: 500 }
        )
      }

      if (!existingDesigner) {
        const { error: designerInsertError } = await adminClient
          .from("designers")
          .insert({
            user_id: userId,
            full_name: fullName,
            is_active: true
          })

        if (designerInsertError) {
          return NextResponse.json(
            {
              error: "User and profile were created, but designer profile creation failed.",
              details: designerInsertError.message,
              user_id: userId
            },
            { status: 500 }
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      email,
      role,
      user_id: userId,
      profile_created: true,
      designer_profile_created: role === "designer"
    })
  } catch (error) {
    console.error("Create user route error:", error)
    return NextResponse.json(
      { error: error?.message || "Unexpected server error." },
      { status: 500 }
    )
  }
}
