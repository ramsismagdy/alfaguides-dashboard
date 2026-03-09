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

const toothButtonStyle = (isSelected) => ({
  width: "44px",
  height: "44px",
  borderRadius: "12px",
  border: isSelected ? "1px solid #685B60" : "1px solid #E7D9E3",
  background: isSelected ? "#685B60" : "#FFFFFF",
  color: isSelected ? "#F0F0F0" : "#685B60",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "600"
})

function generateCaseId() {
  const randomNumber = Math.floor(100000 + Math.random() * 900000)
  return `CASE-${randomNumber}`
}

const upperRight = ["18", "17", "16", "15", "14", "13", "12", "11"]
const upperLeft = ["21", "22", "23", "24", "25", "26", "27", "28"]
const lowerRight = ["48", "47", "46", "45", "44", "43", "42", "41"]
const lowerLeft = ["31", "32", "33", "34", "35", "36", "37", "38"]

function ToothSelector({ selectedTeeth, setSelectedTeeth }) {
  const toggleTooth = (tooth) => {
    if (selectedTeeth.includes(tooth)) {
      setSelectedTeeth(selectedTeeth.filter((item) => item !== tooth))
    } else {
      setSelectedTeeth([...selectedTeeth, tooth])
    }
  }

  const renderRow = (teeth) => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8, 44px)",
        gap: "10px",
        justifyContent: "start"
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
      <p
        style={{
          marginTop: 0,
          marginBottom: "14px",
          color: "#685B60",
          fontSize: "14px",
          fontWeight: "600"
        }}
      >
        Select Tooth / Teeth
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {renderRow(upperRight)}
        {renderRow(upperLeft)}

        <div
          style={{
            height: "10px"
          }}
        />

        {renderRow(lowerRight)}
        {renderRow(lowerLeft)}
      </div>

      <div style={{ marginTop: "16px", color: "#685B60", fontSize: "14px" }}>
        Selected: {selectedTeeth.length > 0 ? selectedTeeth.join(", ") : "None"}
      </div>
    </div>
  )
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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [arch, setArch] = useState("")
  const [numberOfImplants, setNumberOfImplants] = useState("")

  const showArch =
    serviceType === "Implant Full Mouth Rehabilitation" ||
    serviceType === "Surgical Guide" ||
    serviceType === "All-on-X Prosthesis" ||
    serviceType === "Denture"

  const showNumberOfImplants =
    serviceType === "Implant Full Mouth Rehabilitation" ||
    serviceType === "Surgical Guide"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")

    if (
      !patientFirstName ||
      !patientLastName ||
      selectedTeeth.length === 0 ||
      !serviceType ||
      !implantType ||
      !surgicalKit ||
      !surgicalDate
    ) {
      setMessage("Please fill in all required fields.")
      return
    }

    if (showArch && !arch) {
      setMessage("Please select the arch.")
      return
    }

    if (showNumberOfImplants && !numberOfImplants) {
      setMessage("Please enter number of implants.")
      return
    }

    setLoading(true)

    const caseId = generateCaseId()
    const toothNumber = selectedTeeth.join(", ")

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

    setMessage(`Case submitted successfully. Case ID: ${caseId}`)
    setPatientFirstName("")
    setPatientLastName("")
    setSelectedTeeth([])
    setServiceType("")
    setImplantType("")
    setSurgicalKit("")
    setSurgicalDate("")
    setNotes("")
    setArch("")
    setNumberOfImplants("")
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
            Submit a new dental case
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            maxWidth: "980px"
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

            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Tooth / Teeth Selector</label>
              <ToothSelector
                selectedTeeth={selectedTeeth}
                setSelectedTeeth={setSelectedTeeth}
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
                <option value="Implant Full Mouth Rehabilitation">
                  Implant Full Mouth Rehabilitation
                </option>
                <option value="All-on-X Prosthesis">All-on-X Prosthesis</option>
                <option value="Custom Healing Abutment">
                  Custom Healing Abutment
                </option>
                <option value="Crown">Crown</option>
                <option value="Denture">Denture</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Implant(s) Type</label>
              <input
                type="text"
                placeholder="Enter implant type(s)"
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

            {showArch && (
              <div>
                <label style={labelStyle}>Arch</label>
                <select
                  style={inputStyle}
                  value={arch}
                  onChange={(e) => setArch(e.target.value)}
                >
                  <option value="">Select arch</option>
                  <option value="Upper">Upper</option>
                  <option value="Lower">Lower</option>
                </select>
              </div>
            )}

            {showNumberOfImplants && (
              <div>
                <label style={labelStyle}>Number of Implants</label>
                <input
                  type="number"
                  placeholder="Example: 4"
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
                cursor: "pointer"
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

      <div
        style={{
          position: "fixed",
          bottom: "0",
          left: "240px",
          right: "0",
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