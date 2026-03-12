"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
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

export default function UpdatePasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const initializeRecoverySession = async () => {
      try {
        const currentUrl = new URL(window.location.href)
        const code = currentUrl.searchParams.get("code")

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            if (mounted) {
              setMessage(error.message)
              setCheckingSession(false)
            }
            return
          }
        }

        const {
          data: { session }
        } = await supabase.auth.getSession()

        if (mounted && session) {
          setHasRecoverySession(true)
          setCheckingSession(false)
          return
        }

        const {
          data: { subscription }
        } = supabase.auth.onAuthStateChange((event, sessionData) => {
          if (!mounted) return

          if (event === "PASSWORD_RECOVERY" && sessionData) {
            setHasRecoverySession(true)
            setCheckingSession(false)
            setMessage("")
            return
          }

          if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && sessionData) {
            setHasRecoverySession(true)
            setCheckingSession(false)
          }
        })

        setTimeout(async () => {
          if (!mounted) return

          const {
            data: { session: delayedSession }
          } = await supabase.auth.getSession()

          if (delayedSession) {
            setHasRecoverySession(true)
            setCheckingSession(false)
          } else {
            setHasRecoverySession(false)
            setCheckingSession(false)
            setMessage("Recovery session not found. Please open the latest reset link from your email again.")
          }
        }, 1200)

        return () => {
          subscription.unsubscribe()
        }
      } catch (error) {
        if (mounted) {
          setMessage(error.message || "Unable to verify reset session.")
          setCheckingSession(false)
        }
      }
    }

    let cleanup

    initializeRecoverySession().then((fn) => {
      cleanup = fn
    })

    return () => {
      mounted = false
      if (cleanup) cleanup()
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    if (!password) {
      setMessage("Please enter a new password.")
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }

    if (!hasRecoverySession) {
      setMessage("Recovery session not found. Please open the reset link from your email again.")
      return
    }

    const supabase = createClient()
    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage("Password updated successfully.")

    setTimeout(() => {
      router.push("/sign-in")
    }, 1200)
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
          Update Password
        </h1>

        <div style={{ marginBottom: "14px" }}>
          <input
            type="password"
            style={inputStyle}
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={checkingSession || loading}
          />
        </div>

        <div style={{ marginBottom: "18px" }}>
          <input
            type="password"
            style={inputStyle}
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={checkingSession || loading}
          />
        </div>

        <button
          type="submit"
          disabled={checkingSession || loading || !hasRecoverySession}
          style={{
            width: "100%",
            background: "#685B60",
            color: "#F0F0F0",
            border: "none",
            borderRadius: "12px",
            padding: "14px 18px",
            cursor: checkingSession || loading || !hasRecoverySession ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600",
            opacity: checkingSession || loading || !hasRecoverySession ? 0.7 : 1
          }}
        >
          {checkingSession ? "Checking Reset Link..." : loading ? "Updating..." : "Save New Password"}
        </button>

        {message && (
          <p style={{ marginTop: "18px", color: "#F0F0F0", textAlign: "center" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}