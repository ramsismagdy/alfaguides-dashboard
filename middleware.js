import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  const isAuthPage = pathname === '/login'
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)

  if (!user && !isAuthPage && !isPublicAsset) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isAuthPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .maybeSingle()

    const role = profile?.role || ''
    const isActive = profile?.is_active !== false

    if (!profile || !isActive) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const fallbackPath =
      role === 'admin'
        ? '/'
        : role === 'designer'
        ? '/designer-dashboard'
        : role === 'dentist'
        ? '/my-cases'
        : '/login'

    const url = request.nextUrl.clone()
    url.pathname = fallbackPath
    return NextResponse.redirect(url)
  }

  if (user && !isAuthPage && !isPublicAsset) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .maybeSingle()

    const role = profile?.role || ''
    const isActive = profile?.is_active !== false

    if (!profile || !isActive) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    const isDentistCaseDetails =
      role === 'dentist' &&
      pathname.startsWith('/cases/') &&
      pathname !== '/cases'

    const roleAccess = {
      admin: ['/', '/new-case', '/cases', '/designer-dashboard'],
      designer: ['/cases', '/designer-dashboard'],
      dentist: ['/new-case', '/my-cases'],
      external_lab: []
    }

    const allowedPaths = roleAccess[role] || []

    const isAllowed =
      isDentistCaseDetails ||
      allowedPaths.some((allowedPath) => {
        if (allowedPath === '/') {
          return pathname === '/'
        }

        return pathname === allowedPath || pathname.startsWith(`${allowedPath}/`)
      })

    if (!isAllowed) {
      const fallbackPath =
        role === 'admin'
          ? '/'
          : role === 'designer'
          ? '/designer-dashboard'
          : role === 'dentist'
          ? '/my-cases'
          : '/login'

      const url = request.nextUrl.clone()
      url.pathname = fallbackPath
      return NextResponse.redirect(url)
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}