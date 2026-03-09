"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

const sidebarStyle = {
  width: "240px",
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

export default function Sidebar() {
  const pathname = usePathname()

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/new-case", label: "New Case" },
    { href: "/cases", label: "Cases" },
    { href: "/designer-dashboard", label: "Designer" }
  ]

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
        {links.map((link) => {
          const isActive =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(`${link.href}/`)

          return (
            <Link key={link.href} href={link.href} style={getLinkStyle(isActive)}>
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}