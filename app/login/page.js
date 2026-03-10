"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "../../utils/supabase/client"

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #E7D9E3",
  background: "#FFFFFF",
  color: "#685B60",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box"
}

const buttonStyle = {
  background: "#685B60",
  color: "#F0F0F0",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  fontSize: "14px",
  cursor: "pointer"
}

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    router.push("/")
    router.refresh()
    setLoading(false)
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F9F1F7",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#FFFFFF",
          borderRadius: "16px",
          padding: "28px",
          boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        }}
      >
        <h1 style={{ marginTop: 0, color: "#685B60" }}>Login</h1>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#685B60", fontWeight: "600" }}>
              Email
            </label>
            <input
              type="email"
              style={inputStyle}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#685B60", fontWeight: "600" }}>
              Password
            </label>
            <input
              type="password"
              style={inputStyle}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              width: "100%",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {message && (
            <p style={{ marginTop: "16px", color: "#685B60" }}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}