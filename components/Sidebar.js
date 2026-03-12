"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import LogoutButton from "./LogoutButton"
import UserInfo from "./UserInfo"
import { createClient } from "../utils/supabase/client"

const sidebarStyle = {
  width: "240px",
  minWidth: "240px",
  maxWidth: "240px",
  flexShrink: 0,
  background: "#171717",
  color: "#F0F0F0",
  minHeight: "100vh",
  padding: "24px 18px",
  boxSizing: "border-box",
  position: "sticky",
  top: 0
}

const brandStyle = {
  marginBottom: "40px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  paddingTop: "10px"
}

const navStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px"
}

function getLinkStyle(active) {
  return {
    display: "block",
    padding: "12px 14px",
    borderRadius: "12px",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "600",
    fontFamily: "inherit",
    background: active ? "#F9F1F7" : "transparent",
    color: active ? "#685B60" : "#F0F0F0",
    border: active ? "1px solid #E7D9E3" : "1px solid transparent"
  }
}

function normalizeRole(roleValue) {
  const role = String(roleValue || "").trim().toLowerCase()

  if (role === "admin") return "admin"
  if (role === "designer") return "designer"
  if (role === "dentist") return "dentist"

  return ""
}

function getFallbackRoleByEmail(email) {
  const safeEmail = String(email || "").trim().toLowerCase()

  if (safeEmail === "ram@alfaguides.com") return "admin"
  if (safeEmail === "designer@test.com") return "designer"

  if (
    safeEmail === "dentist@test.com" ||
    safeEmail === "mowag19505@devlug.com" ||
    safeEmail === "riyafi9882@devlug.com"
  ) {
    return "dentist"
  }

  return ""
}

export default function Sidebar() {
  const pathname = usePathname()
  const [role, setRole] = useState("")
  const [loadingRole, setLoadingRole] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function loadRole() {
      setLoadingRole(true)

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setRole("")
        setLoadingRole(false)
        return
      }

      let detectedRole = normalizeRole(user.user_metadata?.role)
      const email = user.email || ""

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (profile?.role) {
        detectedRole = normalizeRole(profile.role)
      }

      if (!detectedRole) {
        detectedRole = getFallbackRoleByEmail(email)
      }

      setRole(detectedRole)
      setLoadingRole(false)
    }

    loadRole()
  }, [])

  const allLinks = [
    { href: "/", label: "Dashboard", roles: ["admin"] },
    { href: "/new-case", label: "New Case", roles: ["admin", "dentist"] },
    { href: "/cases", label: "Cases", roles: ["admin", "designer"] },
    { href: "/designer-dashboard", label: "My Cases", roles: ["designer"] },
    { href: "/designer-dashboard", label: "Designer", roles: ["admin"] },
    { href: "/my-cases", label: "My Cases", roles: ["dentist"] },
    { href: "/my-profile", label: "My Profile", roles: ["dentist"] },
    { href: "/dentists", label: "Dentists", roles: ["admin", "designer"] }
  ]

  const visibleLinks = useMemo(() => {
    if (!role) return []
    return allLinks.filter((link) => link.roles.includes(role))
  }, [role])

  return (
    <aside style={sidebarStyle}>
      <div style={brandStyle}>
        <Image
          src="/alfaguides-logo-v3.png"
          alt="Alfaguides"
          width={210}
          height={100}
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      <nav style={navStyle}>
        {loadingRole ? (
          <div
            style={{
              color: "#CFCFCF",
              fontSize: "14px",
              padding: "8px 4px"
            }}
          >
            Loading menu...
          </div>
        ) : visibleLinks.length > 0 ? (
          visibleLinks.map((link, index) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname === link.href || pathname.startsWith(`${link.href}/`)

            return (
              <Link
                key={`${link.href}-${link.label}-${index}`}
                href={link.href}
                style={getLinkStyle(isActive)}
              >
                {link.label}
              </Link>
            )
          })
        ) : (
          <div
            style={{
              color: "#CFCFCF",
              fontSize: "14px",
              lineHeight: "1.6",
              padding: "8px 4px"
            }}
          >
            No menu items available for this account.
          </div>
        )}

        <UserInfo />

        <div style={{ marginTop: "10px" }}>
          <LogoutButton />
        </div>
      </nav>
    </aside>
  )
}