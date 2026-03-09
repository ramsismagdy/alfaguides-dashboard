"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import Sidebar from "../../components/Sidebar"
import { supabase } from "../../lib/supabase"

const tableHeadStyle = {
  textAlign: "left",
  padding: "14px 12px",
  borderBottom: "1px solid #eee",
  color: "#685B60",
  fontSize: "14px",
  whiteSpace: "nowrap"
}

const tableCellStyle = {
  padding: "14px 12px",
  borderBottom: "1px solid #f1f1f1",
  color: "#685B60",
  fontSize: "14px",
  whiteSpace: "nowrap"
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

const linkStyle = {
  color: "#685B60",
  textDecoration: "none",
  fontWeight: "600"
}

function getStatusStyle(status) {

  const base = {
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block"
  }

  switch (status) {
    case "Ready":
    case "Delivered":
      return { ...base, background: "#DFF5E3", color: "#1B7A34" }

    case "Cancelled":
      return { ...base, background: "#FFE3E3", color: "#B42318" }

    case "In Design":
      return { ...base, background: "#E3EDFF", color: "#1D4ED8" }

    case "Manufacturing":
      return { ...base, background: "#EFE6FF", color: "#6D28D9" }

    case "Pending Info":
      return { ...base, background: "#FFF4E5", color: "#B45309" }

    default:
      return { ...base, background: "#F1F1F1", color: "#555" }
  }
}

export default function CasesPage() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setCases(data || [])
    setLoading(false)
  }

  const filteredCases = cases.filter((item) => {
    const patientName =
      `${item.patient_first_name || ""} ${item.patient_last_name || ""}`.toLowerCase()

    const caseNumber = (item.case_number || "").toLowerCase()
    const searchValue = search.toLowerCase()

    return (
      patientName.includes(searchValue) ||
      caseNumber.includes(searchValue)
    )
  })

  return (
    <div
      style={{
        display: "flex",
        background: "#F9F1F7",
        minHeight: "100vh"
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "32px",
          paddingBottom: "120px"
        }}
      >
        <h1 style={{ color: "#685B60" }}>Cases</h1>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
          }}
        >
          <div style={{ marginBottom: "20px", maxWidth: "360px" }}>
            <input
              type="text"
              placeholder="Search by patient or case ID"
              style={inputStyle}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading && <p>Loading cases...</p>}

          {!loading && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={tableHeadStyle}>Case ID</th>
                  <th style={tableHeadStyle}>Patient</th>
                  <th style={tableHeadStyle}>Teeth</th>
                  <th style={tableHeadStyle}>Service</th>
                  <th style={tableHeadStyle}>Implant(s) Type</th>
                  <th style={tableHeadStyle}>Surgical Kit</th>
                  <th style={tableHeadStyle}>Surgical Date</th>
                  <th style={tableHeadStyle}>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredCases.map((item) => (
                  <tr key={item.id}>
                    <td style={tableCellStyle}>
                      <Link href={`/cases/${item.id}`} style={linkStyle}>
                        {item.case_number}
                      </Link>
                    </td>

                    <td style={tableCellStyle}>
                      {item.patient_first_name} {item.patient_last_name}
                    </td>

                    <td style={tableCellStyle}>{item.tooth_number}</td>

                    <td style={tableCellStyle}>{item.service_type}</td>

                    <td style={tableCellStyle}>{item.implant_type}</td>

                    <td style={tableCellStyle}>{item.surgical_kit}</td>

                    <td style={tableCellStyle}>{item.surgical_date}</td>

                    <td style={tableCellStyle}>
                      <span style={getStatusStyle(item.status)}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "240px",
          right: 0,
          background: "#171717",
          color: "#F0F0F0",
          padding: "14px 30px"
        }}
      >
        Need help? Call Alfaguides Support →
        <a
          href="tel:+34953805054"
          style={{ color: "#F0F0F0", fontWeight: "600" }}
        >
          {" "}
          +34 953 80 50 54
        </a>
      </div>
    </div>
  )
}