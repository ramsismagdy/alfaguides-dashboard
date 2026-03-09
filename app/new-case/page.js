"use client"

import { useState } from "react"
import Sidebar from "../../components/Sidebar"
import { supabase } from "../../lib/supabase"

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#685B60",
  fontSize: "14px",
  fontWeight: "600"
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

function generateCaseId() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000)
  return `CASE-${randomNumber}`
}

export default function NewCasePage() {
  const [patientFirstName, setPatientFirstName] = useState("")
  const [patientLastName, setPatientLastName] = useState("")
  const [toothNumber, setToothNumber] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [implantType, setImplantType] = useState("")
  const [surgicalKit, setSurgicalKit] = useState("")
  const [surgicalDate, setSurgicalDate] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    if (
      !patientFirstName ||
      !patientLastName ||
      !toothNumber ||
      !serviceType ||
      !implantType ||
      !surgicalKit ||
      !surgicalDate
    ) {
      setMessage("Please fill in all required fields.")
      return
    }

    setLoading(true)

    const caseId = generateCaseId()

    const { error } = await supabase.from("cases").insert([
      {
        case_number: caseId,
        patient_first_name: patientFirstName,
        patient_last_name: patientLastName,
        tooth_number: toothNumber,
        service_type: serviceType,
        implant_type: implantType,
        surgical_kit: surgicalKit,
        surgical_date: surgicalDate,
        status: "New Case"
      }
    ])

    if (error) {
      setMessage(`Error: ${error.message}`)
      setLoading(false)
      return
    }

    setMessage(`Case submitted successfully. Generated Case ID: ${caseId}`)
    setPatientFirstName("")
    setPatientLastName("")
    setToothNumber("")
    setServiceType("")
    setImplantType("")
    setSurgicalKit("")
    setSurgicalDate("")
    setNotes("")
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
          boxSizing: "border-box"
        }}
      >
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              margin: 0,
              color: "#685B60",
              fontSize: "32px"
            }}
          >
            New Case
          </h1>

          <p
            style={{
              color: "#685B60",
              marginTop: "10px",
              fontSize: "16px"
            }}
          >
            Submit a new surgical guide case
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            maxWidth: "900px"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px"
            }}
          >
            <div>
              <label style={labelStyle}>Patient First Name</label>
              <input
                type="text"
                placeholder="Enter first name"
                style={inputStyle}
                value={patientFirstName}
                onChange={(e) => setPatientFirstName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Patient Last Name</label>
              <input
                type="text"
                placeholder="Enter last name"
                style={inputStyle}
                value={patientLastName}
                onChange={(e) => setPatientLastName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Tooth Number</label>
              <input
                type="text"
                placeholder="Example: 14"
                style={inputStyle}
                value={toothNumber}
                onChange={(e) => setToothNumber(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Service</label>
              <select
                style={inputStyle}
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option value="">Select service</option>
                <option value="Surgical Guide">Surgical Guide</option>
                <option value="Implant Planning">Implant Planning</option>
                <option value="Crown">Crown</option>
                <option value="Denture">Denture</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Implant Type</label>
              <input
                type="text"
                placeholder="Enter implant type"
                style={inputStyle}
                value={implantType}
                onChange={(e) => setImplantType(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Surgical Kit</label>
              <input
                type="text"
                placeholder="Enter surgical kit"
                style={inputStyle}
                value={surgicalKit}
                onChange={(e) => setSurgicalKit(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Surgical Date</label>
              <input
                type="date"
                style={inputStyle}
                value={surgicalDate}
                onChange={(e) => setSurgicalDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              placeholder="Add case notes"
              style={{
                ...inputStyle,
                minHeight: "120px",
                resize: "vertical"
              }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={labelStyle}>Upload Files</label>
            <input type="file" multiple style={inputStyle} />
          </div>

          <div style={{ marginTop: "28px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: "#685B60",
                color: "#F0F0F0",
                border: "none",
                borderRadius: "12px",
                padding: "14px 22px",
                fontSize: "14px",
                cursor: "pointer",
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "Submitting..." : "Submit Case"}
            </button>
          </div>

          {message && (
            <p
              style={{
                marginTop: "18px",
                color: "#685B60",
                fontSize: "14px"
              }}
            >
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}