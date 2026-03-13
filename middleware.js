import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"

function startsWithPath(pathname, basePath) {
  return pathname === basePath || pathname.startsWith(`${basePath}/`)
}

function isCaseDetailsPath(pathname) {
  return /^\/cases\/[^/]+$/.test(pathname)
}

function isDentistDetailsPath(pathname) {
  return /^\/dentists\/[^/]+$/.test(pathname)
}

function normalizeRole(roleValue, emailValue = "") {
  const role = String(roleValue || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_")
  const email = String(emailValue || "").trim().toLowerCase()

  if (role === "admin" || role === "designer" || role === "dentist" || role === "external_lab") {
    return role
  }

  if (email === "ram@alfaguides.com") return "admin"
  if (email === "designer@test.com") return "designer"

  return "dentist"
}

function getHomeForRole(role) {
  if (role === "admin") return "/"
  if (role === "designer") return "/designer-dashboard"
  if (role === "dentist") return "/my-cases"
  if (role === "external_lab") return "/cases"
  return "/sign-in"
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          response.cookies.set({ name, value: "", ...options })
        }
      }
    }
  )

  const publicRoutes = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/update-password"
  ]

  const isPublicRoute = publicRoutes.includes(pathname)

  const {
    data: { user }
  } = await supabase.auth.getUser()

  if (!user) {
    if (isPublicRoute) return response
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  let role = ""
  const email = user.email || ""

  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    role = normalizeRole(profile?.role || user.user_metadata?.role, email)
  } catch {
    role = normalizeRole(user.user_metadata?.role, email)
  }

  if (isPublicRoute) {
    if (pathname === "/update-password") return response
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  if (pathname === "/") {
    if (role === "admin") return response
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  if (startsWithPath(pathname, "/admin/users")) {
    if (role === "admin") return response
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  if (startsWithPath(pathname, "/new-case")) {
    if (role === "admin" || role === "dentist") return response
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  if (pathname === "/cases") {
    if (role === "admin" || role === "designer" || role === "external_lab") return response
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  if (isCaseDetailsPath(pathname)) {
    if (role === "admin" || role === "designer" || role === "dentist" || role === "external_lab") {
      return response
    }
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  if (startsWithPath(pathname, "/designer-dashboard")) {
    if (role === "admin" || role === "designer") return response
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  if (startsWithPath(pathname, "/my-cases")) {
    if (role === "dentist") return response
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  if (startsWithPath(pathname, "/my-profile")) {
    if (role === "dentist") return response
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  if (pathname === "/dentists") {
    if (role === "admin" || role === "designer") return response
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  if (isDentistDetailsPath(pathname)) {
    const dentistIdInPath = pathname.split("/")[2]

    if (role === "admin" || role === "designer") return response
    if (role === "dentist" && dentistIdInPath === user.id) return response

    return NextResponse.redirect(new URL(getHomeForRole(role), request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
}
