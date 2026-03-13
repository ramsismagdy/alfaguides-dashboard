"use client"

import { useEffect, useState } from "react"
import Sidebar from "../../components/Sidebar"
import { createClient } from "../../utils/supabase/client"

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

const secondaryButtonStyle = {
  background: "#FFFFFF",
  color: "#685B60",
  border: "1px solid #E7D9E3",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "14px",
  cursor: "pointer"
}

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

function detectFileType(file) {
  const name = file.name.toLowerCase()
  const mime = (file.type || "").toLowerCase()

  if (name.endsWith(".stl")) return "STL"
  if (name.endsWith(".obj") || name.endsWith(".ply")) return "3D Model"
  if (name.endsWith(".dcm") || name.endsWith(".dicom") || mime.includes("dicom")) return "DICOM"
  if (
    name.endsWith(".pdf") ||
    mime === "application/pdf"
  ) {
    return "PDF"
  }
  if (
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return "Word Document"
  }
  if (mime.startsWith("image/")) return "Photo"

  if (
    name.endsWith(".zip") ||
    name.endsWith(".rar") ||
    name.endsWith(".7z") ||
    name.endsWith(".tar") ||
    name.endsWith(".gz") ||
    name.endsWith(".bz2") ||
    name.endsWith(".xz")
  ) {
    return "Archive"
  }

  return "Other"
}

function isAllowedFile(file) {
  const name = file.name.toLowerCase()
  const mime = (file.type || "").toLowerCase()

  return (
    name.endsWith(".stl") ||
    name.endsWith(".obj") ||
    name.endsWith(".ply") ||
    name.endsWith(".dcm") ||
    name.endsWith(".dicom") ||
    name.endsWith(".pdf") ||
    name.endsWith(".doc") ||
    name.endsWith(".docx") ||
    mime === "application/pdf" ||
    mime === "application/msword" ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime.startsWith("image/") ||
    name.endsWith(".zip") ||
    name.endsWith(".rar") ||
    name.endsWith(".7z") ||
    name.endsWith(".tar") ||
    name.endsWith(".gz") ||
    name.endsWith(".bz2") ||
    name.endsWith(".xz")
  )
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_")
}

function formatFileSize(size) {
  if (!size && size !== 0) return "-"
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

async function getNextCaseNumber(supabase) {
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
  const [selectedFiles, setSelectedFiles] = useState([])
  const [fileInputKey, setFileInputKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [dentistProfile, setDentistProfile] = useState(null)
  const [specialNote, setSpecialNote] = useState("")

  useEffect(() => {
    setArch(detectArch(selectedTeeth))
  }, [selectedTeeth])

  useEffect(() => {
    const loadDentistDefaults = async () => {
      const supabase = createClient()

      const {
        data: { user }
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle()

      if (!profile) return

      setDentistProfile(profile)

      if (profile.role === "dentist") {
        setImplantType(profile.preferred_implant_types || "")
        setSurgicalKit(profile.surgical_guided_kit || "")
        setSpecialNote(profile.special_note || "")
      }
    }

    loadDentistDefaults()
  }, [])

  const showNumberOfImplants =
    serviceType === "Implant Planning" ||
    serviceType === "Implant Full Mouth Rehabilitation" ||
    serviceType === "Surgical Guide"

  const removeSelectedFile = (fileName) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName))
  }

  const resetForm = () => {
    setPatientFirstName("")
    setPatientLastName("")
    setSelectedTeeth([])
    setServiceType("")
    setImplantType(dentistProfile?.preferred_implant_types || "")
    setSurgicalKit(dentistProfile?.surgical_guided_kit || "")
    setSurgicalDate("")
    setNotes("")
    setArch("")
    setNumberOfImplants("")
    setSelectedFiles([])
    setFileInputKey((prev) => prev + 1)
  }

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

    const invalidFiles = selectedFiles.filter((file) => !isAllowedFile(file))
    if (invalidFiles.length > 0) {
      setMessage(`Unsupported file type: ${invalidFiles[0].name}`)
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setMessage("Unable to identify the logged-in user.")
        setLoading(false)
        return
      }

      const caseNumber = await getNextCaseNumber(supabase)
      const toothNumber = selectedTeeth.join(",")

      const { data, error } = await supabase
        .from("cases")
        .insert([
          {
            case_number: caseNumber,
            patient_first_name: patientFirstName.trim(),
            patient_last_name: patientLastName.trim(),
            tooth_number: toothNumber,
            service_type: serviceType,
            implant_type: implantType.trim() || null,
            surgical_kit: surgicalKit.trim() || null,
            surgical_date: surgicalDate || null,
            status: "New Case",
            created_by_user_id: user.id,
            dentist_user_id: dentistProfile?.id || user.id,
            dentist_name: dentistProfile?.full_name || null,
            dentist_email: dentistProfile?.email || null
          }
        ])
        .select()

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      const insertedCase = data?.[0]

      if (!insertedCase?.id) {
        setMessage("Case was created, but the case ID could not be returned.")
        setLoading(false)
        return
      }

      const timelineEntries = [
        {
          case_id: insertedCase.id,
          event_type: "case_created",
          event_text: `Case created (${insertedCase.case_number})`,
          created_by_user_id: user.id,
          visible_to_dentist: true
        }
      ]

      if (specialNote.trim()) {
        const { error: specialNoteError } = await supabase
          .from("case_notes")
          .insert([
            {
              case_id: insertedCase.id,
              note_text: specialNote.trim(),
              created_by_user_id: dentistProfile?.id || null,
              visible_to_dentist: true
            }
          ])

        if (specialNoteError) {
          setMessage(`Case created, but dentist special note could not be saved: ${specialNoteError.message}`)
          setLoading(false)
          return
        }

        timelineEntries.push({
          case_id: insertedCase.id,
          event_type: "note_added",
          event_text: "Dentist special note added",
          created_by_user_id: dentistProfile?.id || null,
          visible_to_dentist: true
        })
      }

      if (notes.trim()) {
        const { error: noteError } = await supabase
          .from("case_notes")
          .insert([
            {
              case_id: insertedCase.id,
              note_text: notes.trim(),
              created_by_user_id: user.id,
              visible_to_dentist: true
            }
          ])

        if (noteError) {
          setMessage(`Case created, but note could not be saved: ${noteError.message}`)
          setLoading(false)
          return
        }

        timelineEntries.push({
          case_id: insertedCase.id,
          event_type: "note_added",
          event_text: "Initial note added",
          created_by_user_id: user.id,
          visible_to_dentist: true
        })
      }

      for (const file of selectedFiles) {
        const safeName = sanitizeFileName(file.name)
        const filePath = `${insertedCase.id}/${Date.now()}-${safeName}`
        const fileType = detectFileType(file)

        const { error: uploadError } = await supabase
          .storage
          .from("case-files")
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type || undefined
          })

        if (uploadError) {
          setMessage(`Case created, but file upload failed for ${file.name}: ${uploadError.message}`)
          setLoading(false)
          return
        }

        const { error: fileRowError } = await supabase
          .from("case_files")
          .insert([
            {
              case_id: insertedCase.id,
              file_name: file.name,
              file_path: filePath,
              file_type: fileType,
              file_section: "case_file"
            }
          ])

        if (fileRowError) {
          setMessage(`Case created, but file record could not be saved for ${file.name}: ${fileRowError.message}`)
          setLoading(false)
          return
        }

        timelineEntries.push({
          case_id: insertedCase.id,
          event_type: "file_uploaded",
          event_text: `File uploaded: ${file.name}`,
          created_by_user_id: user.id,
          visible_to_dentist: true
        })
      }

      if (timelineEntries.length > 0) {
        await supabase
          .from("case_timeline")
          .insert(timelineEntries)
      }

      const successParts = [`Case submitted successfully. Case ID: ${caseNumber}`]

      if (specialNote.trim()) {
        successParts.push("Dentist special note added.")
      }

      if (notes.trim()) {
        successParts.push("Initial note saved.")
      }

      if (selectedFiles.length > 0) {
        successParts.push(`${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} uploaded.`)
      }

      setMessage(successParts.join(" "))
      resetForm()
      setLoading(false)
    } catch (err) {
      setMessage(err.message || "Failed to submit case.")
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
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
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
              style={{ ...inputStyle, minHeight: "100px", resize: "vertical" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any internal note for this case"
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={labelStyle}>Upload Files</label>
            <input
              key={fileInputKey}
              type="file"
              multiple
              accept=".stl,.obj,.ply,.dcm,.dicom,.pdf,.doc,.docx,image/*,.zip,.rar,.7z,.tar,.gz,.bz2,.xz"
              style={inputStyle}
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            />

            <div
              style={{
                marginTop: "10px",
                color: "#9B8C93",
                fontSize: "13px",
                lineHeight: "1.6"
              }}
            >
              Supported files: STL, OBJ, PLY, DCM, DICOM, PDF, DOC, DOCX, JPG, JPEG, PNG, ZIP, RAR, 7Z, TAR, GZ, BZ2, XZ
            </div>

            <div style={{ marginTop: "18px" }}>
              <div
                style={{
                  color: "#685B60",
                  fontSize: "15px",
                  fontWeight: "700",
                  marginBottom: "12px"
                }}
              >
                Selected Files
              </div>

              {selectedFiles.length === 0 ? (
                <div
                  style={{
                    color: "#685B60",
                    fontSize: "14px"
                  }}
                >
                  No files selected yet.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {selectedFiles.map((file) => (
                    <div
                      key={`${file.name}-${file.size}`}
                      style={{
                        border: "1px solid #E7D9E3",
                        borderRadius: "14px",
                        padding: "14px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                        background: "#FFFFFF"
                      }}
                    >
                      <div>
                        <div
                          style={{
                            color: "#685B60",
                            fontSize: "14px",
                            fontWeight: "600",
                            marginBottom: "6px"
                          }}
                        >
                          {file.name}
                        </div>

                        <div
                          style={{
                            color: "#9B8C93",
                            fontSize: "12px"
                          }}
                        >
                          {detectFileType(file)} • {formatFileSize(file.size)}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeSelectedFile(file.name)}
                        style={secondaryButtonStyle}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "24px",
              background: "#685B60",
              color: "#F0F0F0",
              border: "none",
              padding: "14px 22px",
              borderRadius: "12px",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Submitting..." : "Submit Case"}
          </button>

          {message && (
            <p
              style={{
                marginTop: "16px",
                color: "#685B60",
                lineHeight: "1.6"
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