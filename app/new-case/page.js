"use client"

import { useEffect, useState } from "react"
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

const toothButtonStyle = (selected) => ({
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  border: selected ? "1px solid #685B60" : "1px solid #E7D9E3",
  background: selected ? "#685B60" : "#FFFFFF",
  color: selected ? "#F0F0F0" : "#685B60",
  cursor: "pointer",
  fontWeight: "600"
})

const upperTeeth = [
  "1", "2", "3", "4", "5", "6", "7", "8",
  "9", "10", "11", "12", "13", "14", "15", "16"
]

const lowerTeeth = [
  "32", "31", "30", "29", "28", "27", "26", "25",
  "24", "23", "22", "21", "20", "19", "18", "17"
]

function ToothSelector({ selectedTeeth, setSelectedTeeth }) {
  const toggleTooth = (tooth) => {
    if (selectedTeeth.includes(tooth)) {
      setSelectedTeeth(selectedTeeth.filter((t) => t !== tooth))
    } else {
      setSelectedTeeth([...selectedTeeth, tooth])
    }
  }

  const renderRow = (label, teeth) => (
    <div style={{ marginBottom: "16px" }}>
      <div
        style={{
          marginBottom: "10px",
          fontWeight: "600",
          color: "#685B60"
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(16,42px)",
          gap: "8px"
        }}
      >
        {teeth.map((tooth) => (
          <button
            key={tooth}
            type="button"
            onClick={() => toggleTooth(tooth)}
            style={toothButtonStyle(selectedTeeth.includes(tooth))}
          >
            {tooth}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid #E7D9E3",
        borderRadius: "16px",
        padding: "18px"
      }}
    >
      <p style={{ fontWeight: "600", color: "#685B60" }}>
        Select Tooth / Teeth *
      </p>

      {renderRow("Upper", upperTeeth)}
      {renderRow("Lower", lowerTeeth)}

      <div style={{ marginTop: "14px", color: "#685B60" }}>
        Selected: {selectedTeeth.length > 0 ? selectedTeeth.join(", ") : "None"}
      </div>
    </div>
  )
}

function detectArch(selectedTeeth) {
  if (selectedTeeth.length === 0) return ""

  const allUpper = selectedTeeth.every(
    (tooth) => Number(tooth) >= 1 && Number(tooth) <= 16
  )
  const allLower = selectedTeeth.every(
    (tooth) => Number(tooth) >= 17 && Number(tooth) <= 32
  )

  if (allUpper) return "Upper"
  if (allLower) return "Lower"
  return "Both"
}

async function getNextCaseNumber() {
  const { data, error } = await supabase.rpc("get_next_case_number")

  if (error) {
    throw error
  }

  return String(data)
}

export default function NewCasePage() {
  const [patientFirstName, setPatientFirstName] = useState("")
  const [patientLastName, setPatientLastName] = useState("")
  const [selectedTeeth, setSelectedTeeth] = useState([])
  const [serviceType, setServiceType] = useState("")
  const [implantType, setImplantType] = useState("")
  const [surgicalKit, setSurgicalKit] = useState("")
  const [surgicalDate, setSurgicalDate] = useState("")
  const [notes, setNotes] = useState("")
  const [arch, setArch] = useState("")
  const [numberOfImplants, setNumberOfImplants] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    setArch(detectArch(selectedTeeth))
  }, [selectedTeeth])

  const showNumberOfImplants =
    serviceType === "Implant Planning" ||
    serviceType === "Implant Full Mouth Rehabilitation" ||
    serviceType === "Surgical Guide"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    if (!patientFirstName.trim()) {
      setMessage("Patient first name is required.")
      return
    }

    if (!patientLastName.trim()) {
      setMessage("Patient last name is required.")
      return
    }

    if (!serviceType) {
      setMessage("Please select a service.")
      return
    }

    if (selectedTeeth.length === 0) {
      setMessage("Please select at least one tooth.")
      return
    }

    if (!arch) {
      setMessage("Arch could not be detected. Please select teeth again.")
      return
    }

    if (showNumberOfImplants && !numberOfImplants) {
      setMessage("Please enter number of implants.")
      return
    }

    setLoading(true)

    try {
      const caseNumber = await getNextCaseNumber()
      const toothNumber = selectedTeeth.join(",")

      const { data, error } = await supabase
        .from("cases")
        .insert([
          {
            case_number: caseNumber,
            patient_first_name: patientFirstName,
            patient_last_name: patientLastName,
            tooth_number: toothNumber,
            service_type: serviceType,
            implant_type: implantType,
            surgical_kit: surgicalKit,
            surgical_date: surgicalDate || null,
            status: "New Case"
          }
        ])
        .select()

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      const insertedCase = data?.[0]

      if (insertedCase?.id) {
        await supabase.from("case_timeline").insert([
          {
            case_id: insertedCase.id,
            event_type: "case_created",
            event_text: `Case created (${insertedCase.case_number})`
          }
        ])
      }

      setMessage(`Case submitted successfully. Case ID: ${caseNumber}`)
      setPatientFirstName("")
      setPatientLastName("")
      setSelectedTeeth([])
      setServiceType("")
      setImplantType("")
      setSurgicalKit("")
      setSurgicalDate("")
      setArch("")
      setNumberOfImplants("")
      setNotes("")
      setLoading(false)
    } catch (err) {
      setMessage(err.message || "Failed to generate case number.")
      setLoading(false)
    }
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
          paddingBottom: "120px"
        }}
      >
        <h1 style={{ color: "#685B60" }}>New Case</h1>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#FFF",
            borderRadius: "16px",
            padding: "24px"
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
              <label style={labelStyle}>Patient First Name *</label>
              <input
                style={inputStyle}
                value={patientFirstName}
                onChange={(e) => setPatientFirstName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Patient Last Name *</label>
              <input
                style={inputStyle}
                value={patientLastName}
                onChange={(e) => setPatientLastName(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Service *</label>
              <select
                style={inputStyle}
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
              >
                <option value="">Select service</option>
                <option>Surgical Guide</option>
                <option>Implant Planning</option>
                <option>Implant Full Mouth Rehabilitation</option>
                <option>All-on-X Prosthesis</option>
                <option>Custom Healing Abutment</option>
                <option>Crown</option>
                <option>Denture</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Arch *</label>
              <input
                style={{
                  ...inputStyle,
                  background: "#F4EDF2"
                }}
                value={arch}
                readOnly
                placeholder="Auto-detected from selected teeth"
              />
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <ToothSelector
                selectedTeeth={selectedTeeth}
                setSelectedTeeth={setSelectedTeeth}
              />
            </div>

            <div>
              <label style={labelStyle}>Implant(s) Type</label>
              <input
                style={inputStyle}
                value={implantType}
                onChange={(e) => setImplantType(e.target.value)}
              />
            </div>

            <div>
              <label style={labelStyle}>Surgical Kit</label>
              <input
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

            {showNumberOfImplants && (
              <div>
                <label style={labelStyle}>Number of Implants</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={numberOfImplants}
                  onChange={(e) => setNumberOfImplants(e.target.value)}
                />
              </div>
            )}
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, minHeight: "100px" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: "24px",
              background: "#685B60",
              color: "#F0F0F0",
              border: "none",
              padding: "14px 22px",
              borderRadius: "12px",
              cursor: "pointer"
            }}
          >
            {loading ? "Submitting..." : "Submit Case"}
          </button>

          {message && <p style={{ marginTop: "16px" }}>{message}</p>}
        </form>
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