"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "../../utils/supabase/client"

const pageStyle = {
  minHeight: "100vh",
  background: "#F9F1F7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px"
}

const cardStyle = {
  width: "100%",
  maxWidth: "460px",
  background: "#171717",
  borderRadius: "24px",
  padding: "32px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.14)"
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #3A3A3A",
  background: "#232323",
  color: "#F0F0F0",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box"
}

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    if (data?.user?.id) {
      await fetch("/api/audit-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId: data.user.id })
      })
    }

    router.push("/")
    router.refresh()
  }

  return (
    <div style={pageStyle}>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <Image
            src="/alfaguides-logo-v3.png"
            alt="Alfaguides"
            width={210}
            height={100}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <h1 style={{ color: "#F0F0F0", marginTop: 0, marginBottom: "10px", textAlign: "center" }}>
          Sign In
        </h1>

        <p style={{ color: "#CFCFCF", marginTop: 0, marginBottom: "24px", textAlign: "center" }}>
          Welcome to Alfaguides
        </p>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ color: "#F0F0F0", display: "block", marginBottom: "8px", fontSize: "14px" }}>
            Email
          </label>
          <input
            type="email"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label style={{ color: "#F0F0F0", display: "block", marginBottom: "8px", fontSize: "14px" }}>
            Password
          </label>
          <input
            type="password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "18px", textAlign: "right" }}>
          <Link
            href="/forgot-password"
            style={{
              color: "#F0F0F0",
              fontSize: "13px",
              textDecoration: "none",
              fontWeight: "600"
            }}
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: "#685B60",
            color: "#F0F0F0",
            border: "none",
            borderRadius: "12px",
            padding: "14px 18px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <div style={{ marginTop: "18px", textAlign: "center", color: "#CFCFCF", fontSize: "14px" }}>
          Don't have an account?{" "}
          <Link href="/sign-up" style={{ color: "#F0F0F0", fontWeight: "600", textDecoration: "none" }}>
            Sign Up
          </Link>
        </div>

        {message && (
          <p style={{ marginTop: "18px", color: "#F0F0F0", textAlign: "center" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}