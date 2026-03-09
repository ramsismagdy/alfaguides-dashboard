"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
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

const statusOptions = [
  "New Case",
  "Pending Info",
  "In Design",
  "Manufacturing",
  "Ready",
  "Delivered",
  "Cancelled"
]

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

function getTimelineBadgeStyle(eventType) {
  const base = {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block"
  }

  switch (eventType) {
    case "case_created":
      return { ...base, background: "#E3EDFF", color: "#1D4ED8" }
    case "status_changed":
      return { ...base, background: "#EFE6FF", color: "#6D28D9" }
    case "note_added":
      return { ...base, background: "#FFF4E5", color: "#B45309" }
    default:
      return { ...base, background: "#F1F1F1", color: "#555" }
  }
}

function getTimelineLabel(eventType) {
  switch (eventType) {
    case "case_created":
      return "Case Created"
    case "status_changed":
      return "Status Updated"
    case "note_added":
      return "Note Added"
    default:
      return "Event"
  }
}

export default function CaseDetailsPage() {
  const params = useParams()
  const caseId = params?.caseNumber

  const [caseData, setCaseData] = useState(null)
  const [caseNotes, setCaseNotes] = useState([])
  const [timeline, setTimeline] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [notesMessage, setNotesMessage] = useState("")

  const [status, setStatus] = useState("")
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails()
    } else {
      setLoading(false)
      setMessage("Case ID not found in URL.")
    }
  }, [caseId])

  const fetchCaseDetails = async () => {
    setLoading(true)
    setMessage("")
    setStatusMessage("")
    setNotesMessage("")

    const decodedCaseId = decodeURIComponent(caseId)

    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", decodedCaseId)
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
    setStatus(data.status || "New Case")

    const { data: notesData, error: notesError } = await supabase
      .from("case_notes")
      .select("*")
      .eq("case_id", decodedCaseId)
      .order("created_at", { ascending: false })

    if (notesError) {
      setMessage(`Error: ${notesError.message}`)
      setLoading(false)
      return
    }

    const { data: timelineData, error: timelineError } = await supabase
      .from("case_timeline")
      .select("*")
      .eq("case_id", decodedCaseId)
      .order("created_at", { ascending: false })

    if (timelineError) {
      setMessage(`Error: ${timelineError.message}`)
      setLoading(false)
      return
    }

    setCaseNotes(notesData || [])
    setTimeline(timelineData || [])
    setLoading(false)
  }

  const updateStatus = async () => {
    if (!caseData?.id) {
      setStatusMessage("Case ID is missing.")
      return
    }

    if (status === caseData.status) {
      setStatusMessage("Status is already set to this value.")
      return
    }

    setSavingStatus(true)
    setStatusMessage("")

    const oldStatus = caseData.status || "Unknown"

    const { error } = await supabase
      .from("cases")
      .update({ status })
      .eq("id", caseData.id)

    if (error) {
      setStatusMessage(`Error: ${error.message}`)
      setSavingStatus(false)
      return
    }

    const { data: timelineInsert } = await supabase
      .from("case_timeline")
      .insert([
        {
          case_id: caseData.id,
          event_type: "status_changed",
          event_text: `Status changed from ${oldStatus} to ${status}`
        }
      ])
      .select()

    setCaseData({ ...caseData, status })
    if (timelineInsert?.[0]) {
      setTimeline([timelineInsert[0], ...timeline])
    }
    setStatusMessage("Status updated successfully.")
    setSavingStatus(false)
  }

  const saveNote = async () => {
    if (!caseData?.id) {
      setNotesMessage("Case ID is missing.")
      return
    }

    if (!newNote.trim()) {
      setNotesMessage("Please write a note first.")
      return
    }

    setSavingNote(true)
    setNotesMessage("")

    const { data, error } = await supabase
      .from("case_notes")
      .insert([
        {
          case_id: caseData.id,
          note_text: newNote.trim()
        }
      ])
      .select()

    if (error) {
      setNotesMessage(`Error: ${error.message}`)
      setSavingNote(false)
      return
    }

    const insertedNote = data?.[0]

    const { data: timelineInsert } = await supabase
      .from("case_timeline")
      .insert([
        {
          case_id: caseData.id,
          event_type: "note_added",
          event_text: `Note added`
        }
      ])
      .select()

    setCaseNotes(insertedNote ? [insertedNote, ...caseNotes] : caseNotes)
    if (timelineInsert?.[0]) {
      setTimeline([timelineInsert[0], ...timeline])
    }
    setNewNote("")
    setNotesMessage("Note added successfully.")
    setSavingNote(false)
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

              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Submission Date</div>
                <div style={valueStyle}>{formatDateTime(caseData.created_at)}</div>
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
                <div style={valueStyle}>{formatDate(caseData.surgical_date)}</div>
              </div>

              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Current Status</div>
                <div style={valueStyle}>{caseData.status || "-"}</div>
              </div>
            </div>

            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Update Status</div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center"
                  }}
                >
                  <select
                    style={{ ...inputStyle, maxWidth: "260px" }}
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {statusOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={updateStatus}
                    disabled={savingStatus}
                    style={{
                      ...buttonStyle,
                      opacity: savingStatus ? 0.7 : 1
                    }}
                  >
                    {savingStatus ? "Updating..." : "Update Status"}
                  </button>
                </div>

                {statusMessage && (
                  <p
                    style={{
                      marginTop: "14px",
                      color: "#685B60",
                      fontSize: "14px"
                    }}
                  >
                    {statusMessage}
                  </p>
                )}
              </div>
            </div>

            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <div style={{ marginBottom: "18px" }}>
                <label style={labelStyle}>Add Note</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "120px", resize: "vertical" }}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={saveNote}
                disabled={savingNote}
                style={{
                  ...buttonStyle,
                  opacity: savingNote ? 0.7 : 1
                }}
              >
                {savingNote ? "Saving..." : "Add Note"}
              </button>

              {notesMessage && (
                <p
                  style={{
                    marginTop: "14px",
                    color: "#685B60",
                    fontSize: "14px"
                  }}
                >
                  {notesMessage}
                </p>
              )}

              <div style={{ marginTop: "24px" }}>
                <div
                  style={{
                    color: "#685B60",
                    fontSize: "16px",
                    fontWeight: "700",
                    marginBottom: "14px"
                  }}
                >
                  Notes History
                </div>

                {caseNotes.length === 0 ? (
                  <div style={{ color: "#685B60", fontSize: "14px" }}>
                    No notes added yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {caseNotes.map((note) => (
                      <div
                        key={note.id}
                        style={{
                          border: "1px solid #E7D9E3",
                          borderRadius: "14px",
                          padding: "14px"
                        }}
                      >
                        <div
                          style={{
                            color: "#9B8C93",
                            fontSize: "12px",
                            marginBottom: "8px"
                          }}
                        >
                          {formatDateTime(note.created_at)}
                        </div>

                        <div
                          style={{
                            color: "#685B60",
                            fontSize: "14px",
                            lineHeight: "1.6"
                          }}
                        >
                          {note.note_text}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <div
                style={{
                  color: "#685B60",
                  fontSize: "16px",
                  fontWeight: "700",
                  marginBottom: "14px"
                }}
              >
                Timeline
              </div>

              {timeline.length === 0 ? (
                <div style={{ color: "#685B60", fontSize: "14px" }}>
                  No timeline events yet.
                </div>
              ) : (
                <div style={{ display: "grid", gap: "14px" }}>
                  {timeline.map((event) => (
                    <div
                      key={event.id}
                      style={{
                        border: "1px solid #E7D9E3",
                        borderRadius: "14px",
                        padding: "14px"
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          flexWrap: "wrap",
                          marginBottom: "8px"
                        }}
                      >
                        <span style={getTimelineBadgeStyle(event.event_type)}>
                          {getTimelineLabel(event.event_type)}
                        </span>

                        <span
                          style={{
                            color: "#9B8C93",
                            fontSize: "12px"
                          }}
                        >
                          {formatDateTime(event.created_at)}
                        </span>
                      </div>

                      <div
                        style={{
                          color: "#685B60",
                          fontSize: "14px",
                          lineHeight: "1.6"
                        }}
                      >
                        {event.event_text}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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