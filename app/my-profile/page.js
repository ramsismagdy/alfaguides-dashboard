"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "../../utils/supabase/client"

export default function MyProfilePage() {
  const router = useRouter()
  const [message, setMessage] = useState("Loading profile...")

  useEffect(() => {
    const run = async () => {
      const supabase = createClient()

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.replace("/sign-in")
        return
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle()

      if (profileError || !profile) {
        setMessage("Unable to load your profile.")
        return
      }

      if (profile.role !== "dentist") {
        router.replace("/")
        return
      }

      router.replace(`/dentists/${user.id}`)
    }

    run()
  }, [router])

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F9F1F7",
        color: "#685B60",
        fontSize: "16px"
      }}
    >
      {message}
    </div>
  )
}