"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import Sidebar from "../components/Sidebar"
import { supabase } from "../lib/supabase"

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        minWidth: "220px",
        flex: 1
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#685B60"
        }}
      >
        {title}
      </p>

      <h2
        style={{
          marginTop: "12px",
          marginBottom: 0,
          color: "#685B60",
          fontSize: "28px"
        }}
      >
        {value}
      </h2>
    </div>
  )
}

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

function formatDate(value) {
  if (!value) return "-"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric"
  }).format(date)
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

export default function Home() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    setMessage("")

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

  const serviceOptions = useMemo(() => {
    const uniqueServices = [...new Set(cases.map((item) => item.service_type).filter(Boolean))]
    return uniqueServices.sort()
  }, [cases])

  const statusOptions = [
    "New Case",
    "Pending Info",
    "In Design",
    "Manufacturing",
    "Ready",
    "Delivered",
    "Cancelled"
  ]

  const filteredCases = useMemo(() => {
    return cases.filter((item) => {
      const patientName =
        `${item.patient_first_name || ""} ${item.patient_last_name || ""}`.toLowerCase()

      const caseNumber = String(item.case_number || "").toLowerCase()
      const service = (item.service_type || "").toLowerCase()
      const status = item.status || ""
      const searchValue = search.toLowerCase()

      const matchesSearch =
        patientName.includes(searchValue) ||
        caseNumber.includes(searchValue) ||
        service.includes(searchValue)

      const matchesStatus = !statusFilter || status === statusFilter
      const matchesService = !serviceFilter || item.service_type === serviceFilter

      return matchesSearch && matchesStatus && matchesService
    })
  }, [cases, search, statusFilter, serviceFilter])

  const activeCasesCount = cases.filter(
    (item) => item.status !== "Delivered" && item.status !== "Cancelled"
  ).length

  const inDesignCount = cases.filter(
    (item) => item.status === "In Design"
  ).length

  const pendingInfoCount = cases.filter(
    (item) => item.status === "Pending Info"
  ).length

  const manufacturingCount = cases.filter(
    (item) => item.status === "Manufacturing"
  ).length

  const deliveredCount = cases.filter(
    (item) => item.status === "Delivered"
  ).length

  const visibleCases = filteredCases

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
          boxSizing: "border-box",
          paddingBottom: "120px"
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              margin: 0,
              color: "#685B60",
              fontSize: "32px"
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              color: "#685B60",
              marginTop: "10px",
              fontSize: "16px"
            }}
          >
            Welcome to Alfaguides
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "32px"
          }}
        >
          <StatCard title="Active Cases" value={activeCasesCount} />
          <StatCard title="In Design" value={inDesignCount} />
          <StatCard title="Pending Info" value={pendingInfoCount} />
          <StatCard title="Manufacturing" value={manufacturingCount} />
          <StatCard title="Delivered" value={deliveredCount} />
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
          }}
        >
          <div style={{ marginBottom: "20px" }}>
            <h2
              style={{
                marginTop: 0,
                marginBottom: 0,
                color: "#685B60"
              }}
            >
              Cases
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(240px, 1.3fr) minmax(180px, 1fr) minmax(220px, 1fr)",
              gap: "14px",
              marginBottom: "20px"
            }}
          >
            <input
              type="text"
              placeholder="Search by patient, service, or case ID"
              style={inputStyle}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              style={inputStyle}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              style={inputStyle}
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
            >
              <option value="">All Services</option>
              {serviceOptions.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          {(search || statusFilter || serviceFilter) && (
            <div
              style={{
                marginBottom: "18px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap"
              }}
            >
              <div style={{ color: "#685B60", fontSize: "14px" }}>
                Showing {visibleCases.length} case{visibleCases.length !== 1 ? "s" : ""}
              </div>

              <button
                type="button"
                onClick={() => {
                  setSearch("")
                  setStatusFilter("")
                  setServiceFilter("")
                }}
                style={{
                  background: "#FFFFFF",
                  color: "#685B60",
                  border: "1px solid #E7D9E3",
                  borderRadius: "12px",
                  padding: "10px 14px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Clear Filters
              </button>
            </div>
          )}

          {loading && (
            <p style={{ color: "#685B60", margin: 0 }}>Loading cases...</p>
          )}

          {message && !loading && (
            <p style={{ color: "#685B60", margin: 0 }}>{message}</p>
          )}

          {!loading && !message && (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse"
                }}
              >
                <thead>
                  <tr>
                    <th style={tableHeadStyle}>Case ID</th>
                    <th style={tableHeadStyle}>Patient</th>
                    <th style={tableHeadStyle}>Teeth</th>
                    <th style={tableHeadStyle}>Service</th>
                    <th style={tableHeadStyle}>Implant(s) Type</th>
                    <th style={tableHeadStyle}>Surgical Kit</th>
                    <th style={tableHeadStyle}>Surgical Date</th>
                    <th style={tableHeadStyle}>Submission Date</th>
                    <th style={tableHeadStyle}>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCases.length > 0 ? (
                    visibleCases.map((item) => (
                      <tr key={item.id}>
                        <td style={tableCellStyle}>
                          <Link href={`/cases/${item.id}`} style={linkStyle}>
                            {item.case_number}
                          </Link>
                        </td>

                        <td style={tableCellStyle}>
                          {item.patient_first_name} {item.patient_last_name}
                        </td>

                        <td style={tableCellStyle}>{item.tooth_number || "-"}</td>

                        <td style={tableCellStyle}>{item.service_type || "-"}</td>

                        <td style={tableCellStyle}>{item.implant_type || "-"}</td>

                        <td style={tableCellStyle}>{item.surgical_kit || "-"}</td>

                        <td style={tableCellStyle}>
                          {formatDate(item.surgical_date)}
                        </td>

                        <td style={tableCellStyle}>
                          {formatDateTime(item.created_at)}
                        </td>

                        <td style={tableCellStyle}>
                          <span style={getStatusStyle(item.status)}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        style={{
                          ...tableCellStyle,
                          textAlign: "center",
                          whiteSpace: "normal"
                        }}
                        colSpan="9"
                      >
                        No cases found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
        Need help? Call Alfaguides Support →{" "}
        <a
          href="tel:+34953805054"
          style={{ color: "#F0F0F0", fontWeight: "600" }}
        >
          +34 953 80 50 54
        </a>
      </div>
    </div>
  )
}