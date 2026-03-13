"use client"

import { useEffect, useMemo, useState } from "react"
import Sidebar from "../../../components/Sidebar"
import { createClient } from "../../../utils/supabase/client"

const pageStyle = {
  minHeight: "100vh",
  background: "#F7F3F5",
  display: "flex"
}

const contentStyle = {
  flex: 1,
  padding: "32px"
}

const containerStyle = {
  maxWidth: "760px",
  margin: "0 auto"
}

const cardStyle = {
  background: "#FFFFFF",
  borderRadius: "20px",
  padding: "28px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  border: "1px solid #EEE3E8"
}

const titleStyle = {
  fontSize: "30px",
  fontWeight: "700",
  color: "#4B3F45",
  marginBottom: "10px"
}

const subtitleStyle = {
  fontSize: "15px",
  color: "#7A6A72",
  marginBottom: "28px",
  lineHeight: 1.6
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "18px"
}

const fullWidthStyle = {
  gridColumn: "1 / -1"
}

const fieldWrapStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
}

const labelStyle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#685B60"
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #E7D9E3",
  background: "#FFFDFE",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box"
}

const selectStyle = {
  ...inputStyle,
  appearance: "none"
}

const buttonRowStyle = {
  display: "flex",
  justifyContent: "flex-start",
  gap: "12px",
  marginTop: "24px",
  flexWrap: "wrap"
}

const primaryButtonStyle = {
  background: "#8A3D68",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "12px",
  padding: "12px 18px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer"
}

const secondaryButtonStyle = {
  background: "#F3E8EE",
  color: "#6E5663",
  border: "1px solid #E4D4DD",
  borderRadius: "12px",
  padding: "12px 18px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer"
}

const messageBaseStyle = {
  marginTop: "18px",
  padding: "14px 16px",
  borderRadius: "12px",
  fontSize: "14px",
  lineHeight: 1.5
}

const infoCardStyle = {
  marginTop: "20px",
  background: "#FCFAFB",
  border: "1px solid #EADDE4",
  borderRadius: "16px",
  padding: "18px"
}

const infoTitleStyle = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#53474C",
  marginBottom: "8px"
}

const listStyle = {
  margin: 0,
  paddingLeft: "18px",
  color: "#6D5E65",
  lineHeight: 1.7,
  fontSize: "14px"
}

const initialForm = {
  full_name: "",
  email: "",
  password: "",
  role: "designer",
  phone: "",
  company_name: ""
}

function normalizeRole(role) {
  return (role || "").toString().trim().toLowerCase().replace(/[\s-]+/g, "_")
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

export default function AdminUsersPage() {
  const supabase = createClient()

  const [loadingPage, setLoadingPage] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentRole, setCurrentRole] = useState("")
  const [form, setForm] = useState(initialForm)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("info")

  useEffect(() => {
    let mounted = true

    async function loadRole() {
      try {
        const {
          data: { user }
        } = await supabase.auth.getUser()

        if (!user) {
          window.location.href = "/sign-in"
          return
        }

        let role = normalizeRole(user.user_metadata?.role)

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle()

        if (profile?.role) {
          role = normalizeRole(profile.role)
        }

        if (!role) {
          role = getFallbackRoleByEmail(user.email)
        }

        if (!mounted) return

        setCurrentRole(role)

        if (role !== "admin") {
          window.location.href = "/"
          return
        }
      } catch (error) {
        console.error("Role load error:", error)
        if (mounted) {
          setMessage("Unable to verify your account role.")
          setMessageType("error")
        }
      } finally {
        if (mounted) setLoadingPage(false)
      }
    }

    loadRole()

    return () => {
      mounted = false
    }
  }, [supabase])

  const generatedNote = useMemo(() => {
    if (form.role === "external_lab") {
      return "External lab accounts are intended for lab partners."
    }

    if (form.role === "designer") {
      return "Designer accounts can be used for case work and progress handling."
    }

    return "Admin accounts should be created carefully because they have full system access."
  }, [form.role])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  function resetForm() {
    setForm(initialForm)
    setMessage("")
    setMessageType("info")
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setMessage("")
    setMessageType("info")

    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: normalizeRole(form.role),
        phone: form.phone.trim(),
        company_name: form.company_name.trim()
      }

      const {
        data: { session }
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error("No active session found. Please sign in again.")
      }

      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify(payload)
      })

      const responseText = await response.text()
      let result = {}

      try {
        result = responseText ? JSON.parse(responseText) : {}
      } catch {
        throw new Error(responseText || "Unexpected server response.")
      }

      if (!response.ok) {
        throw new Error(result?.error || "Failed to create user.")
      }

      setMessage(`User created successfully: ${result.email} (${result.role})`)
      setMessageType("success")
      setForm(initialForm)
    } catch (error) {
      console.error("Create user error:", error)
      setMessage(error.message || "Failed to create user.")
      setMessageType("error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingPage) {
    return (
      <div style={pageStyle}>
        <Sidebar />
        <main style={contentStyle}>
          <div style={containerStyle}>
            <div style={cardStyle}>Loading...</div>
          </div>
        </main>
      </div>
    )
  }

  if (currentRole !== "admin") {
    return null
  }

  const messageStyle = {
    ...messageBaseStyle,
    background:
      messageType === "success"
        ? "#EDF9F1"
        : messageType === "error"
        ? "#FFF0F0"
        : "#F4F3FF",
    color:
      messageType === "success"
        ? "#256B42"
        : messageType === "error"
        ? "#8F2D2D"
        : "#4D4AA8",
    border:
      messageType === "success"
        ? "1px solid #CDEED8"
        : messageType === "error"
        ? "1px solid #F3CFCF"
        : "1px solid #DCDCF8"
  }

  return (
    <div style={pageStyle}>
      <Sidebar />

      <main style={contentStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={titleStyle}>Create User Account</div>
            <div style={subtitleStyle}>
              Admin-only page to create admin, designer, and external lab accounts.
            </div>

            <form onSubmit={handleSubmit}>
              <div style={gridStyle}>
                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Email</label>
                  <input
                    style={inputStyle}
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                    required
                  />
                </div>

                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Temporary Password</label>
                  <input
                    style={inputStyle}
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    required
                    minLength={8}
                  />
                </div>

                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Role</label>
                  <select
                    style={selectStyle}
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="admin">Admin</option>
                    <option value="designer">Designer</option>
                    <option value="external_lab">External Lab</option>
                  </select>
                </div>

                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Phone</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div style={fieldWrapStyle}>
                  <label style={labelStyle}>Company / Lab Name</label>
                  <input
                    style={inputStyle}
                    type="text"
                    name="company_name"
                    value={form.company_name}
                    onChange={handleChange}
                    placeholder="Optional"
                  />
                </div>

                <div style={{ ...fieldWrapStyle, ...fullWidthStyle }}>
                  <label style={labelStyle}>Role Note</label>
                  <div
                    style={{
                      ...inputStyle,
                      minHeight: "48px",
                      display: "flex",
                      alignItems: "center",
                      background: "#FAF6F8",
                      color: "#6E5C66"
                    }}
                  >
                    {generatedNote}
                  </div>
                </div>
              </div>

              <div style={buttonRowStyle}>
                <button type="submit" style={primaryButtonStyle} disabled={submitting}>
                  {submitting ? "Creating..." : "Create User"}
                </button>

                <button
                  type="button"
                  style={secondaryButtonStyle}
                  onClick={resetForm}
                  disabled={submitting}
                >
                  Reset
                </button>
              </div>
            </form>

            {message ? <div style={messageStyle}>{message}</div> : null}

            <div style={infoCardStyle}>
              <div style={infoTitleStyle}>Important</div>
              <ul style={listStyle}>
                <li>This page is for admin accounts only.</li>
                <li>User creation is done through a secure server route.</li>
                <li>The profile row should be created automatically by your trigger.</li>
                <li>External lab is a new role, so sidebar and middleware must allow it.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
