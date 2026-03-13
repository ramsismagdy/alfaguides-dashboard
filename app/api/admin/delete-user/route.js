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
      return NextResponse.json(
        { error: "Missing Supabase environment variables." },
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
      auth: { persistSession: false, autoRefreshToken: false }
    })

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
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

    const requesterRole =
      normalizeRole(requesterProfile?.role) ||
      normalizeRole(requester?.user_metadata?.role) ||
      (isFallbackAdmin(requester) ? "admin" : "")

    if (requesterRole !== "admin") {
      return NextResponse.json({ error: "Admin access required." }, { status: 403 })
    }

    const body = await request.json()
    const userId = String(body?.userId || "").trim()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 })
    }

    if (userId === requester.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account from this page." },
        { status: 400 }
      )
    }

    const { data: targetProfile } = await adminClient
      .from("profiles")
      .select("id, role, email")
      .eq("id", userId)
      .maybeSingle()

    const targetRole = normalizeRole(targetProfile?.role)

    // Unassign all cases related to this user first
    // dentist_user_id is cleared for dentist accounts
    const { error: unassignDentistCasesError } = await adminClient
      .from("cases")
      .update({ dentist_user_id: null })
      .eq("dentist_user_id", userId)

    if (unassignDentistCasesError) {
      return NextResponse.json(
        { error: `Failed to unassign dentist cases: ${unassignDentistCasesError.message}` },
        { status: 500 }
      )
    }

    // assigned_designer_id is cleared using the linked designers table id
    const { data: designerRow } = await adminClient
      .from("designers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (designerRow?.id) {
      const { error: unassignDesignerCasesError } = await adminClient
        .from("cases")
        .update({ assigned_designer_id: null })
        .eq("assigned_designer_id", designerRow.id)

      if (unassignDesignerCasesError) {
        return NextResponse.json(
          { error: `Failed to unassign designer cases: ${unassignDesignerCasesError.message}` },
          { status: 500 }
        )
      }

      const { error: deleteDesignerError } = await adminClient
        .from("designers")
        .delete()
        .eq("id", designerRow.id)

      if (deleteDesignerError) {
        return NextResponse.json(
          { error: `Failed to delete designer profile: ${deleteDesignerError.message}` },
          { status: 500 }
        )
      }
    }

    const { error: deleteProfileError } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (deleteProfileError) {
      return NextResponse.json(
        { error: `Failed to delete profile: ${deleteProfileError.message}` },
        { status: 500 }
      )
    }

    const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(userId)

    if (deleteAuthError) {
      return NextResponse.json(
        { error: `Profile was cleaned, but auth deletion failed: ${deleteAuthError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deleted_user_id: userId,
      deleted_role: targetRole || null,
      deleted_email: targetProfile?.email || null
    })
  } catch (error) {
    console.error("Delete user route error:", error)
    return NextResponse.json(
      { error: error?.message || "Unexpected server error." },
      { status: 500 }
    )
  }
}
