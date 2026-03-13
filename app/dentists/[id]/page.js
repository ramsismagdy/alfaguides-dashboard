"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Sidebar from "../../../components/Sidebar"
import { createClient } from "../../../utils/supabase/client"

const cardStyle = {
  background: "#FFFFFF",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
}

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

const secondaryButtonStyle = {
  background: "#FFFFFF",
  color: "#685B60",
  border: "1px solid #E7D9E3",
  borderRadius: "12px",
  padding: "12px 18px",
  fontSize: "14px",
  cursor: "pointer"
}

function formatDateTime(value) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  }).format(date)

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZoneName: "short"
  }).format(date)

  return `${datePart}, ${timePart}`
}

export default function DentistProfilePage() {
  const params = useParams()
  const dentistId = params?.id

  const [currentRole, setCurrentRole] = useState("")
  const [currentUserId, setCurrentUserId] = useState("")
  const [profile, setProfile] = useState(null)
  const [cases, setCases] = useState([])
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const [sendingReset, setSendingReset] = useState(false)
  const [profileForm, setProfileForm] = useState({})
  const [caseSearch, setCaseSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    if (dentistId) {
      loadPage()
    }
  }, [dentistId])

  const loadPage = async () => {
    const supabase = createClient()
    setLoading(true)
    setMessage("")

    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user) {
      setMessage("Unable to load user.")
      setLoading(false)
      return
    }

    setCurrentUserId(user.id)

    const { data: me } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("id", user.id)
      .maybeSingle()

    const roleValue = me?.role || ""
    setCurrentRole(roleValue)

    if (!(roleValue === "admin" || roleValue === "designer" || user.id === dentistId)) {
      setMessage("You do not have access to this profile.")
      setLoading(false)
      return
    }

    const [{ data: dentistProfile, error: profileError }, { data: caseRows, error: caseError }, { data: auditRows }] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("*")
          .eq("id", dentistId)
          .maybeSingle(),
        supabase
          .from("cases")
          .select("*")
          .eq("dentist_user_id", dentistId)
          .order("created_at", { ascending: false }),
        roleValue === "admin"
          ? supabase
              .from("login_audit")
              .select("*")
              .eq("user_id", dentistId)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] })
      ])

    if (profileError) {
      setMessage(profileError.message)
      setLoading(false)
      return
    }

    if (caseError) {
      setMessage(caseError.message)
      setLoading(false)
      return
    }

    setProfile(dentistProfile)
    setProfileForm(dentistProfile || {})
    setCases(caseRows || [])
    setAudits(auditRows || [])
    setLoading(false)
  }

  const canEdit = currentRole === "admin" || (currentRole === "dentist" && currentUserId === dentistId)
  const canSendReset = currentRole === "admin"
  const canChangeOwnPassword = currentUserId === dentistId

  const updateField = (key, value) => {
    setProfileForm((prev) => ({ ...prev, [key]: value }))
  }

  const saveProfile = async () => {
    if (!canEdit) return

    const supabase = createClient()
    setSaving(true)
    setMessage("")

    const fullName = [
      profileForm.name_prefix || "",
      profileForm.first_name || "",
      profileForm.last_name || ""
    ]
      .filter(Boolean)
      .join(" ")

    const payload = {
      name_prefix: profileForm.name_prefix || null,
      first_name: profileForm.first_name || null,
      last_name: profileForm.last_name || null,
      full_name: fullName || null,
      additional_email_1: profileForm.additional_email_1 || null,
      additional_email_2: profileForm.additional_email_2 || null,
      additional_email_3: profileForm.additional_email_3 || null,
      phone: profileForm.phone || null,
      additional_phone_1: profileForm.additional_phone_1 || null,
      additional_phone_2: profileForm.additional_phone_2 || null,
      additional_phone_3: profileForm.additional_phone_3 || null,
      full_address: profileForm.full_address || null,
      city: profileForm.city || null,
      state: profileForm.state || null,
      zip_postal_code: profileForm.zip_postal_code || null,
      country: profileForm.country || null,
      preferred_implant_types: profileForm.preferred_implant_types || null,
      surgical_guided_kit: profileForm.surgical_guided_kit || null,
      dentist_license_number: profileForm.dentist_license_number || null,
      special_note: profileForm.special_note || null
    }

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", dentistId)

    if (error) {
      setMessage(error.message)
      setSaving(false)
      return
    }

    setProfile((prev) => ({ ...prev, ...payload }))
    setMessage("Profile updated successfully.")
    setSaving(false)
  }

  const sendPasswordReset = async () => {
    if (!canSendReset || !profile?.email) return

    const confirmed = window.confirm(`Send password reset email to ${profile.email}?`)
    if (!confirmed) return

    const supabase = createClient()
    setSendingReset(true)
    setMessage("")

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/update-password`
        : undefined

    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
      redirectTo
    })

    if (error) {
      setMessage(error.message)
      setSendingReset(false)
      return
    }

    setMessage("Password reset email sent successfully.")
    setSendingReset(false)
  }

  const changeOwnPassword = async () => {
    if (!canChangeOwnPassword) return

    if (!password || !confirmPassword) {
      setMessage("Please enter and confirm your new password.")
      return
    }

    if (password.length < 8) {
      setMessage("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }

    const supabase = createClient()
    setChangingPassword(true)
    setMessage("")

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setMessage(error.message)
      setChangingPassword(false)
      return
    }

    setPassword("")
    setConfirmPassword("")
    setMessage("Password updated successfully.")
    setChangingPassword(false)
  }

  const serviceOptions = useMemo(() => {
    return [...new Set(cases.map((item) => item.service_type).filter(Boolean))].sort()
  }, [cases])

  const filteredCases = useMemo(() => {
    const value = caseSearch.toLowerCase()

    return cases.filter((item) => {
      const patient = `${item.patient_first_name || ""} ${item.patient_last_name || ""}`.toLowerCase()
      const matchesSearch = patient.includes(value) || String(item.case_number || "").includes(value)
      const matchesStatus = !statusFilter || item.status === statusFilter
      const matchesService = !serviceFilter || item.service_type === serviceFilter

      return matchesSearch && matchesStatus && matchesService
    })
  }, [cases, caseSearch, statusFilter, serviceFilter])

  return (
    <div style={{ display: "flex", background: "#F9F1F7", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "32px", paddingBottom: "120px" }}>
        <h1 style={{ color: "#685B60", marginTop: 0 }}>
          {currentRole === "dentist" ? "My Profile" : "Dentist Profile"}
        </h1>

        {loading && <div style={cardStyle}>Loading...</div>}
        {message && !loading && <div style={cardStyle}>{message}</div>}

        {!loading && profile && (
          <div style={{ display: "grid", gap: "20px" }}>
            <div style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  flexWrap: "wrap",
                  marginBottom: "18px"
                }}
              >
                <h2 style={{ color: "#685B60", margin: 0 }}>Dentist Details</h2>

                {canSendReset && (
                  <button
                    type="button"
                    onClick={sendPasswordReset}
                    disabled={sendingReset}
                    style={{
                      ...secondaryButtonStyle,
                      opacity: sendingReset ? 0.7 : 1
                    }}
                  >
                    {sendingReset ? "Sending Reset..." : "Send Password Reset"}
                  </button>
                )}
              </div>

              <div style={{ display: "grid", gap: "14px" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 1fr",
                    gap: "14px"
                  }}
                >
                  <input
                    style={inputStyle}
                    value={profileForm.name_prefix || ""}
                    onChange={(e) => updateField("name_prefix", e.target.value)}
                    placeholder="Prefix"
                    disabled={!canEdit}
                  />
                  <input
                    style={inputStyle}
                    value={profileForm.first_name || ""}
                    onChange={(e) => updateField("first_name", e.target.value)}
                    placeholder="First Name"
                    disabled={!canEdit}
                  />
                  <input
                    style={inputStyle}
                    value={profileForm.last_name || ""}
                    onChange={(e) => updateField("last_name", e.target.value)}
                    placeholder="Last Name"
                    disabled={!canEdit}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <input
                    style={inputStyle}
                    value={profileForm.email || ""}
                    placeholder="Email"
                    disabled
                  />
                  <input
                    style={inputStyle}
                    value={profileForm.additional_email_1 || ""}
                    onChange={(e) => updateField("additional_email_1", e.target.value)}
                    placeholder="Additional Email 1"
                    disabled={!canEdit}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <input
                    style={inputStyle}
                    value={profileForm.additional_email_2 || ""}
                    onChange={(e) => updateField("additional_email_2", e.target.value)}
                    placeholder="Additional Email 2"
                    disabled={!canEdit}
                  />
                  <input
                    style={inputStyle}
                    value={profileForm.additional_email_3 || ""}
                    onChange={(e) => updateField("additional_email_3", e.target.value)}
                    placeholder="Additional Email 3"
                    disabled={!canEdit}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <input
                    style={inputStyle}
                    value={profileForm.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="Phone"
                    disabled={!canEdit}
                  />
                  <input
                    style={inputStyle}
                    value={profileForm.additional_phone_1 || ""}
                    onChange={(e) => updateField("additional_phone_1", e.target.value)}
                    placeholder="Additional Phone 1"
                    disabled={!canEdit}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <input
                    style={inputStyle}
                    value={profileForm.additional_phone_2 || ""}
                    onChange={(e) => updateField("additional_phone_2", e.target.value)}
                    placeholder="Additional Phone 2"
                    disabled={!canEdit}
                  />
                  <input
                    style={inputStyle}
                    value={profileForm.additional_phone_3 || ""}
                    onChange={(e) => updateField("additional_phone_3", e.target.value)}
                    placeholder="Additional Phone 3"
                    disabled={!canEdit}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <input
                    style={inputStyle}
                    value={profileForm.full_address || ""}
                    onChange={(e) => updateField("full_address", e.target.value)}
                    placeholder="Address"
                    disabled={!canEdit}
                  />
                  <input
                    style={inputStyle}
                    value={profileForm.city || ""}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="City"
                    disabled={!canEdit}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "14px"
                  }}
                >
                  <input
                    style={inputStyle}
                    value={profileForm.zip_postal_code || ""}
                    onChange={(e) => updateField("zip_postal_code", e.target.value)}
                    placeholder="Zip / Postal Code"
                    disabled={!canEdit}
                  />
                  <input
                    style={inputStyle}
                    value={profileForm.state || ""}
                    onChange={(e) => updateField("state", e.target.value)}
                    placeholder="State"
                    disabled={!canEdit}
                  />
                  <input
                    style={inputStyle}
                    value={profileForm.country || ""}
                    onChange={(e) => updateField("country", e.target.value)}
                    placeholder="Country"
                    disabled={!canEdit}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <input
                    style={inputStyle}
                    value={profileForm.preferred_implant_types || ""}
                    onChange={(e) => updateField("preferred_implant_types", e.target.value)}
                    placeholder="Preferred Implant Type(s)"
                    disabled={!canEdit}
                  />
                  <input
                    style={inputStyle}
                    value={profileForm.surgical_guided_kit || ""}
                    onChange={(e) => updateField("surgical_guided_kit", e.target.value)}
                    placeholder="Surgical Guided Kit"
                    disabled={!canEdit}
                  />
                </div>

                <div>
                  <input
                    style={inputStyle}
                    value={profileForm.dentist_license_number || ""}
                    onChange={(e) => updateField("dentist_license_number", e.target.value)}
                    placeholder="Dentist License Number"
                    disabled={!canEdit}
                  />
                </div>
              </div>

              {canEdit && (
                <button type="button" onClick={saveProfile} disabled={saving} style={{ ...buttonStyle, marginTop: "16px" }}>
                  {saving ? "Saving..." : "Save Details"}
                </button>
              )}
            </div>

            {canChangeOwnPassword && (
              <div style={cardStyle}>
                <h2 style={{ color: "#685B60", marginTop: 0 }}>Change Password</h2>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <input
                    type="password"
                    style={inputStyle}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New Password"
                  />
                  <input
                    type="password"
                    style={inputStyle}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                  />
                </div>
                <button
                  type="button"
                  onClick={changeOwnPassword}
                  disabled={changingPassword}
                  style={{ ...buttonStyle, marginTop: "16px" }}
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            )}

            <div style={cardStyle}>
              <h2 style={{ color: "#685B60", marginTop: 0 }}>Special Note</h2>
              <textarea
                style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                value={profileForm.special_note || ""}
                onChange={(e) => updateField("special_note", e.target.value)}
                disabled={!canEdit}
              />
              {canEdit && (
                <button type="button" onClick={saveProfile} disabled={saving} style={{ ...buttonStyle, marginTop: "16px" }}>
                  {saving ? "Saving..." : "Save Special Note"}
                </button>
              )}
            </div>

            <div style={cardStyle}>
              <h2 style={{ color: "#685B60", marginTop: 0 }}>Cases Submitted By This Dentist</h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px", marginBottom: "18px" }}>
                <input
                  type="text"
                  placeholder="Search by patient or case ID"
                  style={inputStyle}
                  value={caseSearch}
                  onChange={(e) => setCaseSearch(e.target.value)}
                />
                <select style={inputStyle} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="">All Statuses</option>
                  <option>New Case</option>
                  <option>Pending Info</option>
                  <option>In Design</option>
                  <option>Manufacturing</option>
                  <option>Ready</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
                <select style={inputStyle} value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                  <option value="">All Services</option>
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </select>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: "left", padding: "12px", color: "#685B60" }}>Case ID</th>
                      <th style={{ textAlign: "left", padding: "12px", color: "#685B60" }}>Patient</th>
                      <th style={{ textAlign: "left", padding: "12px", color: "#685B60" }}>Service</th>
                      <th style={{ textAlign: "left", padding: "12px", color: "#685B60" }}>Status</th>
                      <th style={{ textAlign: "left", padding: "12px", color: "#685B60" }}>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCases.map((item) => (
                      <tr key={item.id}>
                        <td style={{ padding: "12px", borderTop: "1px solid #F1F1F1" }}>
                          <Link href={`/cases/${item.id}`} style={{ color: "#685B60", fontWeight: "600", textDecoration: "none" }}>
                            {item.case_number}
                          </Link>
                        </td>
                        <td style={{ padding: "12px", borderTop: "1px solid #F1F1F1", color: "#685B60" }}>
                          {item.patient_first_name} {item.patient_last_name}
                        </td>
                        <td style={{ padding: "12px", borderTop: "1px solid #F1F1F1", color: "#685B60" }}>
                          {item.service_type || "-"}
                        </td>
                        <td style={{ padding: "12px", borderTop: "1px solid #F1F1F1", color: "#685B60" }}>
                          {item.status || "-"}
                        </td>
                        <td style={{ padding: "12px", borderTop: "1px solid #F1F1F1", color: "#685B60" }}>
                          {formatDateTime(item.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {currentRole === "admin" && (
              <div style={cardStyle}>
                <h2 style={{ color: "#685B60", marginTop: 0 }}>Login Tracking</h2>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: "12px", color: "#685B60" }}>Event</th>
                        <th style={{ textAlign: "left", padding: "12px", color: "#685B60" }}>Location</th>
                        <th style={{ textAlign: "left", padding: "12px", color: "#685B60" }}>IP</th>
                        <th style={{ textAlign: "left", padding: "12px", color: "#685B60" }}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audits.map((item) => (
                        <tr key={item.id}>
                          <td style={{ padding: "12px", borderTop: "1px solid #F1F1F1", color: "#685B60" }}>
                            {item.event_type}
                          </td>
                          <td style={{ padding: "12px", borderTop: "1px solid #F1F1F1", color: "#685B60" }}>
                            {[item.city, item.state_region, item.country].filter(Boolean).join(", ") || "-"}
                          </td>
                          <td style={{ padding: "12px", borderTop: "1px solid #F1F1F1", color: "#685B60" }}>
                            {item.ip_address || "-"}
                          </td>
                          <td style={{ padding: "12px", borderTop: "1px solid #F1F1F1", color: "#685B60" }}>
                            {formatDateTime(item.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
