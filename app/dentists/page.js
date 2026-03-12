"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import Sidebar from "../../components/Sidebar"
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

export default function DentistsPage() {
  const [dentists, setDentists] = useState([])
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadDentists()
  }, [])

  const loadDentists = async () => {
    const supabase = createClient()

    const { data: profileData } = await supabase.auth.getUser()
    if (!profileData?.user) return

    const { data: me } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", profileData.user.id)
      .maybeSingle()

    if (!(me?.role === "admin" || me?.role === "designer")) {
      setMessage("You do not have access to this page.")
      return
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, country, city")
      .eq("role", "dentist")
      .order("full_name", { ascending: true })

    if (error) {
      setMessage(error.message)
      return
    }

    setDentists(data || [])
  }

  const filteredDentists = useMemo(() => {
    const value = search.toLowerCase()
    return dentists.filter((item) => {
      const name = String(item.full_name || "").toLowerCase()
      const email = String(item.email || "").toLowerCase()
      return name.includes(value) || email.includes(value)
    })
  }, [dentists, search])

  return (
    <div style={{ display: "flex", background: "#F9F1F7", minHeight: "100vh" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "32px", paddingBottom: "120px" }}>
        <h1 style={{ color: "#685B60", marginTop: 0 }}>Dentists</h1>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Search dentist by name or email"
              style={inputStyle}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <select
                style={inputStyle}
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">Choose dentist</option>
                {filteredDentists.map((dentist) => (
                  <option key={dentist.id} value={dentist.id}>
                    {dentist.full_name || dentist.email}
                  </option>
                ))}
              </select>

              {selectedId && (
                <Link
                  href={`/dentists/${selectedId}`}
                  style={{
                    whiteSpace: "nowrap",
                    background: "#685B60",
                    color: "#F0F0F0",
                    textDecoration: "none",
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontWeight: "600"
                  }}
                >
                  Open
                </Link>
              )}
            </div>
          </div>

          {message && <p style={{ color: "#685B60" }}>{message}</p>}

          <div style={{ display: "grid", gap: "12px" }}>
            {filteredDentists.map((dentist) => (
              <Link
                key={dentist.id}
                href={`/dentists/${dentist.id}`}
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #E7D9E3",
                  borderRadius: "14px",
                  padding: "14px",
                  textDecoration: "none",
                  color: "#685B60"
                }}
              >
                <div style={{ fontWeight: "700", marginBottom: "6px" }}>
                  {dentist.full_name || "-"}
                </div>
                <div style={{ fontSize: "14px" }}>
                  {dentist.email || "-"}{dentist.phone ? ` • ${dentist.phone}` : ""}{dentist.city ? ` • ${dentist.city}` : ""}{dentist.country ? `, ${dentist.country}` : ""}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}