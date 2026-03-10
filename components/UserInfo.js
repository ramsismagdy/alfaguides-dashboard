"use client"

import { useEffect, useState } from "react"
import { createClient } from "../utils/supabase/client"

function formatRole(role) {
  if (!role) return ""
  if (role === "external_lab") return "External Lab"
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function UserInfo() {
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("")

  useEffect(() => {
    const supabase = createClient()

    async function loadUserInfo() {
      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) return

      setEmail(user.email || "")

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      setRole(profile?.role || "")
    }

    loadUserInfo()
  }, [])

  if (!email) return null

  return (
    <div
      style={{
        marginTop: "10px",
        padding: "12px 14px",
        borderRadius: "12px",
        background: "rgba(240,240,240,0.06)",
        border: "1px solid rgba(240,240,240,0.12)"
      }}
    >
      <div
        style={{
          color: "#F0F0F0",
          fontSize: "12px",
          opacity: 0.8,
          marginBottom: "6px"
        }}
      >
        Logged in as
      </div>

      <div
        style={{
          color: "#F0F0F0",
          fontSize: "13px",
          fontWeight: "600",
          wordBreak: "break-word",
          marginBottom: role ? "8px" : 0
        }}
      >
        {email}
      </div>

      {role && (
        <div
          style={{
            color: "#F0F0F0",
            fontSize: "12px",
            opacity: 0.9
          }}
        >
          Role: {formatRole(role)}
        </div>
      )}
    </div>
  )
}