"use client"

import { useRouter } from "next/navigation"
import { createClient } from "../utils/supabase/client"

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (user) {
      await fetch("/api/audit-logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: user.id })
      })
    }

    await supabase.auth.signOut()
    router.push("/sign-in")
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: "12px",
        border: "1px solid #3A3A3A",
        background: "#232323",
        color: "#F0F0F0",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer"
      }}
    >
      Logout
    </button>
  )
}