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

export async function middleware(request) {
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

  const {
    data: { user }
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const publicRoutes = [
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/update-password"
  ]

  const isPublicRoute = publicRoutes.includes(pathname)

  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (user && isPublicRoute) {
    if (pathname === "/update-password") {
      return response
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    const role = profile?.role || ""

    if (role === "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (role === "designer") {
      return NextResponse.redirect(new URL("/cases", request.url))
    }

    if (role === "dentist") {
      return NextResponse.redirect(new URL("/my-cases", request.url))
    }

    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!user) {
    return response
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const role = profile?.role || ""

  const isAdmin = role === "admin"
  const isDesigner = role === "designer"
  const isDentist = role === "dentist"

  if (pathname === "/") {
    if (isAdmin) return response

    if (isDesigner) {
      return NextResponse.redirect(new URL("/cases", request.url))
    }

    if (isDentist) {
      return NextResponse.redirect(new URL("/my-cases", request.url))
    }

    return NextResponse.redirect(new URL("/sign-in", request.url))
  }

  if (startsWithPath(pathname, "/my-profile")) {
    if (!isDentist) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return response
  }

  if (startsWithPath(pathname, "/my-cases")) {
    if (!isDentist) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return response
  }

  if (startsWithPath(pathname, "/new-case")) {
    if (!(isAdmin || isDentist)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return response
  }

  if (pathname === "/cases") {
    if (!(isAdmin || isDesigner)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return response
  }

  if (isCaseDetailsPath(pathname)) {
    if (!(isAdmin || isDesigner || isDentist)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return response
  }

  if (pathname === "/dentists") {
    if (!(isAdmin || isDesigner)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return response
  }

  if (isDentistDetailsPath(pathname)) {
    const dentistIdInPath = pathname.split("/")[2]

    if (isAdmin || isDesigner) {
      return response
    }

    if (isDentist && dentistIdInPath === user.id) {
      return response
    }

    return NextResponse.redirect(new URL("/", request.url))
  }

  if (startsWithPath(pathname, "/designer-dashboard")) {
    if (!(isAdmin || isDesigner)) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  ]
}