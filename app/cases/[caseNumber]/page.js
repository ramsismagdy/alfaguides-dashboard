"use client"

import { useEffect, useState } from "react"
import Sidebar from "../../../components/Sidebar"
import { supabase } from "../../../lib/supabase"

const cardStyle = {
  background: "#FFFFFF",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
}

const labelStyle = {
  fontSize: "13px",
  color: "#9B8C93",
  marginBottom: "6px"
}

const valueStyle = {
  fontSize: "16px",
  color: "#685B60",
  fontWeight: "600"
}

export default function CaseDetailsPage({ params }) {
  const [caseData, setCaseData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchCaseDetails()
  }, [])

  const fetchCaseDetails = async () => {
    setLoading(true)
    setMessage("")

    const decodedCaseNumber = decodeURIComponent(params.caseNumber)

    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("case_number", decodedCaseNumber)
      .limit(1)
      .maybeSingle()

    if (error) {
      setMessage(`Error: ${error.message}`)
      setLoading(false)
      return
    }

    if (!data) {
      setMessage("Case not found.")
      setLoading(false)
      return
    }

    setCaseData(data)
    setLoading(false)
  }

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
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              margin: 0,
              color: "#685B60",
              fontSize: "32px"
            }}
          >
            Case Details
          </h1>

          <p
            style={{
              color: "#685B60",
              marginTop: "10px",
              fontSize: "16px"
            }}
          >
            Review full case information
          </p>
        </div>

        {loading && (
          <div style={cardStyle}>
            <p style={{ color: "#685B60", margin: 0 }}>Loading case details...</p>
          </div>
        )}

        {message && !loading && (
          <div style={cardStyle}>
            <p style={{ color: "#685B60", margin: 0 }}>{message}</p>
          </div>
        )}

        {!loading && !message && caseData && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px"
            }}
          >
            <div style={cardStyle}>
              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Case ID</div>
                <div style={valueStyle}>{caseData.case_number || "-"}</div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Patient Name</div>
                <div style={valueStyle}>
                  {caseData.patient_first_name || ""} {caseData.patient_last_name || ""}
                </div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Teeth</div>
                <div style={valueStyle}>{caseData.tooth_number || "-"}</div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Service</div>
                <div style={valueStyle}>{caseData.service_type || "-"}</div>
              </div>
            </div>

            <div style={cardStyle}>
              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Implant(s) Type</div>
                <div style={valueStyle}>{caseData.implant_type || "-"}</div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Surgical Kit</div>
                <div style={valueStyle}>{caseData.surgical_kit || "-"}</div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Surgical Date</div>
                <div style={valueStyle}>{caseData.surgical_date || "-"}</div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Status</div>
                <div style={valueStyle}>{caseData.status || "-"}</div>
              </div>
            </div>

            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <div style={labelStyle}>Notes</div>
              <div style={valueStyle}>
                {caseData.notes ? caseData.notes : "No notes added yet."}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "240px",
          right: 0,
          background: "#171717",
          color: "#F0F0F0",
          padding: "14px 30px",
          fontSize: "14px"
        }}
      >
        Need help? Call Alfaguides Support →{" "}
        <a
          href="tel:+34953805054"
          style={{
            color: "#F0F0F0",
            fontWeight: "600",
            textDecoration: "none"
          }}
        >
          +34 953 80 50 54
        </a>
      </div>
    </div>
  )
}