"use client"

import { useRouter } from "next/navigation"
import { createClient } from "../utils/supabase/client"

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      style={{
        width: "100%",
        marginTop: "18px",
        background: "transparent",
        color: "#F0F0F0",
        border: "1px solid rgba(240,240,240,0.2)",
        borderRadius: "12px",
        padding: "12px 14px",
        fontSize: "14px",
        cursor: "pointer"
      }}
    >
      Logout
    </button>
  )
}