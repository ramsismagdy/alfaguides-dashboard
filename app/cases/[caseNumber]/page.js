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

const secondaryButtonStyle = {
  background: "#FFFFFF",
  color: "#685B60",
  border: "1px solid #E7D9E3",
  borderRadius: "12px",
  padding: "12px 18px",
  fontSize: "14px",
  cursor: "pointer"
}

const deleteButtonStyle = {
  background: "#B42318",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "12px",
  padding: "10px 14px",
  fontSize: "13px",
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
    case "file_uploaded":
      return { ...base, background: "#DFF5E3", color: "#1B7A34" }
    case "file_deleted":
      return { ...base, background: "#FFE3E3", color: "#B42318" }
    case "case_info_updated":
      return { ...base, background: "#F3E8FF", color: "#7C3AED" }
    case "case_assigned":
      return { ...base, background: "#E8F1FF", color: "#1E40AF" }
    case "case_unassigned":
      return { ...base, background: "#F3F4F6", color: "#4B5563" }
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
    case "file_uploaded":
      return "File Uploaded"
    case "file_deleted":
      return "File Deleted"
    case "case_info_updated":
      return "Case Info Updated"
    case "case_assigned":
      return "Case Assigned"
    case "case_unassigned":
      return "Case Unassigned"
    default:
      return "Event"
  }
}

function detectFileType(file) {
  const name = file.name.toLowerCase()
  const mime = (file.type || "").toLowerCase()

  if (name.endsWith(".stl")) return "STL"
  if (name.endsWith(".obj") || name.endsWith(".ply")) return "3D Model"
  if (name.endsWith(".dcm") || name.endsWith(".dicom") || mime.includes("dicom")) return "DICOM"
  if (mime.startsWith("image/")) return "Photo"

  if (
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif") ||
    name.endsWith(".bmp") ||
    name.endsWith(".tif") ||
    name.endsWith(".tiff") ||
    name.endsWith(".svg")
  ) {
    return "Photo"
  }

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
    mime.startsWith("image/") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif") ||
    name.endsWith(".bmp") ||
    name.endsWith(".tif") ||
    name.endsWith(".tiff") ||
    name.endsWith(".svg") ||
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

function isImageFile(file) {
  const name = String(file?.file_name || "").toLowerCase()
  return (
    file?.file_type === "Photo" ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".png") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif") ||
    name.endsWith(".bmp") ||
    name.endsWith(".tif") ||
    name.endsWith(".tiff") ||
    name.endsWith(".svg")
  )
}

export default function CaseDetailsPage() {
  const params = useParams()
  const caseId = params?.caseNumber

  const [caseData, setCaseData] = useState(null)
  const [caseNotes, setCaseNotes] = useState([])
  const [timeline, setTimeline] = useState([])
  const [files, setFiles] = useState([])
  const [designers, setDesigners] = useState([])
  const [selectedDesignerId, setSelectedDesignerId] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [fileInputKey, setFileInputKey] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)
  const [statusMessage, setStatusMessage] = useState("")
  const [savingCaseInfo, setSavingCaseInfo] = useState(false)
  const [caseInfoMessage, setCaseInfoMessage] = useState("")
  const [savingAssignment, setSavingAssignment] = useState(false)
  const [assignmentMessage, setAssignmentMessage] = useState("")
  const [savingNote, setSavingNote] = useState(false)
  const [notesMessage, setNotesMessage] = useState("")
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [filesMessage, setFilesMessage] = useState("")
  const [viewerImage, setViewerImage] = useState(null)

  const [status, setStatus] = useState("")
  const [editableImplantType, setEditableImplantType] = useState("")
  const [editableSurgicalKit, setEditableSurgicalKit] = useState("")
  const [editableSurgicalDate, setEditableSurgicalDate] = useState("")
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails()
      fetchDesigners()
    } else {
      setLoading(false)
      setMessage("Case ID not found in URL.")
    }
  }, [caseId])

  const fetchDesigners = async () => {
    const { data, error } = await supabase
      .from("designers")
      .select("*")
      .eq("is_active", true)
      .order("full_name", { ascending: true })

    if (!error) {
      setDesigners(data || [])
    }
  }

  const fetchFilesWithUrls = async (casePrimaryId) => {
    const { data: filesData, error: filesError } = await supabase
      .from("case_files")
      .select("*")
      .eq("case_id", casePrimaryId)
      .order("created_at", { ascending: false })

    if (filesError) {
      throw filesError
    }

    const mapped = await Promise.all(
      (filesData || []).map(async (fileRow) => {
        const { data: signedData } = await supabase
          .storage
          .from("case-files")
          .createSignedUrl(fileRow.file_path, 3600)

        return {
          ...fileRow,
          signedUrl: signedData?.signedUrl || null
        }
      })
    )

    setFiles(mapped)
  }

  const fetchCaseDetails = async () => {
    setLoading(true)
    setMessage("")
    setStatusMessage("")
    setCaseInfoMessage("")
    setAssignmentMessage("")
    setNotesMessage("")
    setFilesMessage("")

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
    setEditableImplantType(data.implant_type || "")
    setEditableSurgicalKit(data.surgical_kit || "")
    setEditableSurgicalDate(data.surgical_date || "")
    setSelectedDesignerId(data.assigned_designer_id || "")

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

    try {
      await fetchFilesWithUrls(decodedCaseId)
    } catch (fileErr) {
      setMessage(`Error: ${fileErr.message}`)
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
    const wasAssigned = !!caseData.assigned_designer_name
    const previousDesignerName = caseData.assigned_designer_name || ""

    const updatePayload = { status }

    if (status === "Delivered") {
      updatePayload.assigned_designer_id = null
      updatePayload.assigned_designer_name = null
    }

    const { error } = await supabase
      .from("cases")
      .update(updatePayload)
      .eq("id", caseData.id)

    if (error) {
      setStatusMessage(`Error: ${error.message}`)
      setSavingStatus(false)
      return
    }

    const timelineEntries = [
      {
        case_id: caseData.id,
        event_type: "status_changed",
        event_text: `Status changed from ${oldStatus} to ${status}`
      }
    ]

    if (status === "Delivered" && wasAssigned) {
      timelineEntries.push({
        case_id: caseData.id,
        event_type: "case_unassigned",
        event_text: `Case automatically unassigned from ${previousDesignerName} after delivery`
      })
    }

    const { data: timelineInsert } = await supabase
      .from("case_timeline")
      .insert(timelineEntries)
      .select()

    const updatedCase = {
      ...caseData,
      ...updatePayload
    }

    setCaseData(updatedCase)
    setSelectedDesignerId(status === "Delivered" ? "" : (caseData.assigned_designer_id || ""))

    if (timelineInsert?.length) {
      setTimeline([...timelineInsert.reverse(), ...timeline])
    }

    setStatusMessage(
      status === "Delivered" && wasAssigned
        ? "Status updated and case automatically unassigned."
        : "Status updated successfully."
    )
    setSavingStatus(false)
  }

  const updateCaseInfo = async () => {
    if (!caseData?.id) {
      setCaseInfoMessage("Case ID is missing.")
      return
    }

    const currentImplantType = caseData.implant_type || ""
    const currentSurgicalKit = caseData.surgical_kit || ""
    const currentSurgicalDate = caseData.surgical_date || ""

    const nextImplantType = editableImplantType.trim()
    const nextSurgicalKit = editableSurgicalKit.trim()
    const nextSurgicalDate = editableSurgicalDate || ""

    const implantChanged = currentImplantType !== nextImplantType
    const kitChanged = currentSurgicalKit !== nextSurgicalKit
    const dateChanged = currentSurgicalDate !== nextSurgicalDate

    if (!implantChanged && !kitChanged && !dateChanged) {
      setCaseInfoMessage("No changes to save.")
      return
    }

    setSavingCaseInfo(true)
    setCaseInfoMessage("")

    const updatePayload = {
      implant_type: nextImplantType || null,
      surgical_kit: nextSurgicalKit || null,
      surgical_date: nextSurgicalDate || null
    }

    const { error } = await supabase
      .from("cases")
      .update(updatePayload)
      .eq("id", caseData.id)

    if (error) {
      setCaseInfoMessage(`Error: ${error.message}`)
      setSavingCaseInfo(false)
      return
    }

    const changes = []

    if (implantChanged) {
      changes.push(`Implant type changed from ${currentImplantType || "-"} to ${nextImplantType || "-"}`)
    }

    if (kitChanged) {
      changes.push(`Surgical kit changed from ${currentSurgicalKit || "-"} to ${nextSurgicalKit || "-"}`)
    }

    if (dateChanged) {
      changes.push(
        `Surgical date changed from ${currentSurgicalDate ? formatDate(currentSurgicalDate) : "-"} to ${nextSurgicalDate ? formatDate(nextSurgicalDate) : "-"}`
      )
    }

    const { data: timelineInsert } = await supabase
      .from("case_timeline")
      .insert([
        {
          case_id: caseData.id,
          event_type: "case_info_updated",
          event_text: changes.join(" | ")
        }
      ])
      .select()

    const updatedCaseData = {
      ...caseData,
      implant_type: updatePayload.implant_type,
      surgical_kit: updatePayload.surgical_kit,
      surgical_date: updatePayload.surgical_date
    }

    setCaseData(updatedCaseData)

    if (timelineInsert?.[0]) {
      setTimeline([timelineInsert[0], ...timeline])
    }

    setCaseInfoMessage("Case information updated successfully.")
    setSavingCaseInfo(false)
  }

  const updateAssignment = async () => {
    if (!caseData?.id) {
      setAssignmentMessage("Case ID is missing.")
      return
    }

    if (!selectedDesignerId) {
      setAssignmentMessage("Please select a designer.")
      return
    }

    if (selectedDesignerId === (caseData.assigned_designer_id || "")) {
      setAssignmentMessage("This designer is already assigned.")
      return
    }

    const selectedDesigner = designers.find((item) => item.id === selectedDesignerId)

    if (!selectedDesigner) {
      setAssignmentMessage("Selected designer was not found.")
      return
    }

    setSavingAssignment(true)
    setAssignmentMessage("")

    const previousDesignerName = caseData.assigned_designer_name || ""
    const nextDesignerName = selectedDesigner.full_name

    const { error } = await supabase
      .from("cases")
      .update({
        assigned_designer_id: selectedDesigner.id,
        assigned_designer_name: selectedDesigner.full_name
      })
      .eq("id", caseData.id)

    if (error) {
      setAssignmentMessage(`Error: ${error.message}`)
      setSavingAssignment(false)
      return
    }

    const timelineText = previousDesignerName
      ? `Case reassigned from ${previousDesignerName} to ${nextDesignerName}`
      : `Case assigned to ${nextDesignerName}`

    const { data: timelineInsert } = await supabase
      .from("case_timeline")
      .insert([
        {
          case_id: caseData.id,
          event_type: "case_assigned",
          event_text: timelineText
        }
      ])
      .select()

    setCaseData({
      ...caseData,
      assigned_designer_id: selectedDesigner.id,
      assigned_designer_name: selectedDesigner.full_name
    })

    if (timelineInsert?.[0]) {
      setTimeline([timelineInsert[0], ...timeline])
    }

    setAssignmentMessage(previousDesignerName ? "Designer reassigned successfully." : "Designer assigned successfully.")
    setSavingAssignment(false)
  }

  const unassignDesigner = async () => {
    if (!caseData?.id) {
      setAssignmentMessage("Case ID is missing.")
      return
    }

    if (!caseData.assigned_designer_name) {
      setAssignmentMessage("This case is already unassigned.")
      return
    }

    const confirmed = window.confirm(`Unassign ${caseData.assigned_designer_name} from this case?`)
    if (!confirmed) return

    setSavingAssignment(true)
    setAssignmentMessage("")

    const previousDesignerName = caseData.assigned_designer_name

    const { error } = await supabase
      .from("cases")
      .update({
        assigned_designer_id: null,
        assigned_designer_name: null
      })
      .eq("id", caseData.id)

    if (error) {
      setAssignmentMessage(`Error: ${error.message}`)
      setSavingAssignment(false)
      return
    }

    const { data: timelineInsert } = await supabase
      .from("case_timeline")
      .insert([
        {
          case_id: caseData.id,
          event_type: "case_unassigned",
          event_text: `Case unassigned from ${previousDesignerName}`
        }
      ])
      .select()

    setCaseData({
      ...caseData,
      assigned_designer_id: null,
      assigned_designer_name: null
    })
    setSelectedDesignerId("")

    if (timelineInsert?.[0]) {
      setTimeline([timelineInsert[0], ...timeline])
    }

    setAssignmentMessage("Designer unassigned successfully.")
    setSavingAssignment(false)
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
          event_text: "Note added"
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

  const uploadFiles = async () => {
    if (!caseData?.id) {
      setFilesMessage("Case ID is missing.")
      return
    }

    if (!selectedFiles.length) {
      setFilesMessage("Please choose at least one file.")
      return
    }

    const invalidFiles = selectedFiles.filter((file) => !isAllowedFile(file))
    if (invalidFiles.length > 0) {
      setFilesMessage(`Unsupported file type: ${invalidFiles[0].name}`)
      return
    }

    setUploadingFiles(true)
    setFilesMessage("")

    const uploadedRecords = []
    const timelineEntries = []

    try {
      for (const file of selectedFiles) {
        const fileType = detectFileType(file)
        const safeName = sanitizeFileName(file.name)
        const filePath = `${caseData.id}/${Date.now()}-${safeName}`

        const { error: uploadError } = await supabase
          .storage
          .from("case-files")
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type || undefined
          })

        if (uploadError) {
          throw uploadError
        }

        const { data: fileRowData, error: fileRowError } = await supabase
          .from("case_files")
          .insert([
            {
              case_id: caseData.id,
              file_name: file.name,
              file_path: filePath,
              file_type: fileType
            }
          ])
          .select()

        if (fileRowError) {
          throw fileRowError
        }

        const insertedFile = fileRowData?.[0]

        if (insertedFile) {
          const { data: signedData } = await supabase
            .storage
            .from("case-files")
            .createSignedUrl(insertedFile.file_path, 3600)

          uploadedRecords.push({
            ...insertedFile,
            signedUrl: signedData?.signedUrl || null
          })

          timelineEntries.push({
            case_id: caseData.id,
            event_type: "file_uploaded",
            event_text: `File uploaded: ${insertedFile.file_name}`
          })
        }
      }

      if (timelineEntries.length > 0) {
        const { data: timelineInsert } = await supabase
          .from("case_timeline")
          .insert(timelineEntries)
          .select()

        if (timelineInsert?.length) {
          setTimeline([...timelineInsert.reverse(), ...timeline])
        }
      }

      setFiles([...uploadedRecords.reverse(), ...files])
      setSelectedFiles([])
      setFileInputKey((prev) => prev + 1)
      setFilesMessage("Files uploaded successfully.")
    } catch (err) {
      setFilesMessage(`Error: ${err.message}`)
    }

    setUploadingFiles(false)
  }

  const deleteFile = async (file) => {
    const confirmed = window.confirm(`Delete ${file.file_name}?`)
    if (!confirmed) return

    setFilesMessage("")

    try {
      const { error: storageError } = await supabase
        .storage
        .from("case-files")
        .remove([file.file_path])

      if (storageError) {
        throw storageError
      }

      const { error: rowDeleteError } = await supabase
        .from("case_files")
        .delete()
        .eq("id", file.id)

      if (rowDeleteError) {
        throw rowDeleteError
      }

      const { data: timelineInsert } = await supabase
        .from("case_timeline")
        .insert([
          {
            case_id: caseData.id,
            event_type: "file_deleted",
            event_text: `File deleted: ${file.file_name}`
          }
        ])
        .select()

      setFiles(files.filter((item) => item.id !== file.id))
      if (timelineInsert?.[0]) {
        setTimeline([timelineInsert[0], ...timeline])
      }
      setFilesMessage("File deleted successfully.")
    } catch (err) {
      setFilesMessage(`Error: ${err.message}`)
    }
  }

  const imageFiles = files.filter(isImageFile)

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

              <div style={{ marginBottom: 0 }}>
                <div style={labelStyle}>Assigned Designer</div>
                <div style={valueStyle}>{caseData.assigned_designer_name || "Unassigned"}</div>
              </div>
            </div>

            {imageFiles.length > 0 && (
              <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
                <div
                  style={{
                    color: "#685B60",
                    fontSize: "16px",
                    fontWeight: "700",
                    marginBottom: "14px"
                  }}
                >
                  Image Viewer
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                    gap: "14px"
                  }}
                >
                  {imageFiles.map((file) => (
                    <button
                      key={file.id}
                      type="button"
                      onClick={() => setViewerImage(file)}
                      style={{
                        border: "1px solid #E7D9E3",
                        borderRadius: "14px",
                        padding: "10px",
                        background: "#FFFFFF",
                        cursor: "pointer",
                        textAlign: "left"
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "150px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          background: "#F9F1F7",
                          marginBottom: "10px"
                        }}
                      >
                        {file.signedUrl ? (
                          <img
                            src={file.signedUrl}
                            alt={file.file_name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block"
                            }}
                          />
                        ) : null}
                      </div>

                      <div
                        style={{
                          color: "#685B60",
                          fontSize: "13px",
                          fontWeight: "600",
                          wordBreak: "break-word"
                        }}
                      >
                        {file.file_name}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Assign Designer</div>

                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    flexWrap: "wrap",
                    alignItems: "center"
                  }}
                >
                  <select
                    style={{ ...inputStyle, maxWidth: "320px" }}
                    value={selectedDesignerId}
                    onChange={(e) => setSelectedDesignerId(e.target.value)}
                  >
                    <option value="">Select designer</option>
                    {designers.map((designer) => (
                      <option key={designer.id} value={designer.id}>
                        {designer.full_name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={updateAssignment}
                    disabled={savingAssignment}
                    style={{
                      ...buttonStyle,
                      opacity: savingAssignment ? 0.7 : 1
                    }}
                  >
                    {savingAssignment
                      ? "Saving..."
                      : caseData.assigned_designer_name
                      ? "Reassign Designer"
                      : "Assign Designer"}
                  </button>

                  {caseData.assigned_designer_name && (
                    <button
                      type="button"
                      onClick={unassignDesigner}
                      disabled={savingAssignment}
                      style={{
                        ...secondaryButtonStyle,
                        opacity: savingAssignment ? 0.7 : 1
                      }}
                    >
                      Unassign
                    </button>
                  )}
                </div>

                {assignmentMessage && (
                  <p
                    style={{
                      marginTop: "14px",
                      color: "#685B60",
                      fontSize: "14px"
                    }}
                  >
                    {assignmentMessage}
                  </p>
                )}
              </div>
            </div>

            <div style={{ ...cardStyle, gridColumn: "1 / -1" }}>
              <div style={{ marginBottom: "18px" }}>
                <div style={labelStyle}>Edit Case Info</div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "14px",
                    marginBottom: "14px"
                  }}
                >
                  <div>
                    <label style={labelStyle}>Implant(s) Type</label>
                    <input
                      style={inputStyle}
                      value={editableImplantType}
                      onChange={(e) => setEditableImplantType(e.target.value)}
                      placeholder="Enter implant type"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Surgical Kit</label>
                    <input
                      style={inputStyle}
                      value={editableSurgicalKit}
                      onChange={(e) => setEditableSurgicalKit(e.target.value)}
                      placeholder="Enter surgical kit"
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Surgical Date</label>
                    <input
                      type="date"
                      style={inputStyle}
                      value={editableSurgicalDate}
                      onChange={(e) => setEditableSurgicalDate(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={updateCaseInfo}
                  disabled={savingCaseInfo}
                  style={{
                    ...buttonStyle,
                    opacity: savingCaseInfo ? 0.7 : 1
                  }}
                >
                  {savingCaseInfo ? "Saving..." : "Save Case Info"}
                </button>

                {caseInfoMessage && (
                  <p
                    style={{
                      marginTop: "14px",
                      color: "#685B60",
                      fontSize: "14px"
                    }}
                  >
                    {caseInfoMessage}
                  </p>
                )}
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
                <label style={labelStyle}>Upload Files</label>
                <input
                  key={fileInputKey}
                  type="file"
                  multiple
                  accept=".stl,.obj,.ply,.dcm,.dicom,image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,.svg,.zip,.rar,.7z,.tar,.gz,.bz2,.xz"
                  style={inputStyle}
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
                />
              </div>

              <button
                type="button"
                onClick={uploadFiles}
                disabled={uploadingFiles}
                style={{
                  ...buttonStyle,
                  opacity: uploadingFiles ? 0.7 : 1
                }}
              >
                {uploadingFiles ? "Uploading..." : "Upload Files"}
              </button>

              {filesMessage && (
                <p
                  style={{
                    marginTop: "14px",
                    color: "#685B60",
                    fontSize: "14px"
                  }}
                >
                  {filesMessage}
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
                  Files
                </div>

                {files.length === 0 ? (
                  <div style={{ color: "#685B60", fontSize: "14px" }}>
                    No files uploaded yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {files.map((file) => (
                      <div
                        key={file.id}
                        style={{
                          border: "1px solid #E7D9E3",
                          borderRadius: "14px",
                          padding: "14px",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "12px",
                          alignItems: "center",
                          flexWrap: "wrap"
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
                            {file.file_name}
                          </div>

                          <div
                            style={{
                              color: "#9B8C93",
                              fontSize: "12px"
                            }}
                          >
                            {file.file_type} • {formatDateTime(file.created_at)}
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            flexWrap: "wrap"
                          }}
                        >
                          {isImageFile(file) && file.signedUrl && (
                            <button
                              type="button"
                              onClick={() => setViewerImage(file)}
                              style={secondaryButtonStyle}
                            >
                              View Image
                            </button>
                          )}

                          {file.signedUrl && (
                            <a
                              href={file.signedUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                color: "#685B60",
                                fontWeight: "600",
                                textDecoration: "none"
                              }}
                            >
                              Open File
                            </a>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteFile(file)}
                            style={deleteButtonStyle}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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

      {viewerImage?.signedUrl && (
        <div
          onClick={() => setViewerImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(23,23,23,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 1000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#FFFFFF",
              borderRadius: "16px",
              padding: "16px",
              maxWidth: "95vw",
              maxHeight: "95vh",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                marginBottom: "12px"
              }}
            >
              <div
                style={{
                  color: "#685B60",
                  fontSize: "14px",
                  fontWeight: "600",
                  wordBreak: "break-word"
                }}
              >
                {viewerImage.file_name}
              </div>

              <button
                type="button"
                onClick={() => setViewerImage(null)}
                style={{
                  ...secondaryButtonStyle,
                  padding: "8px 12px"
                }}
              >
                Close
              </button>
            </div>

            <div
              style={{
                maxWidth: "88vw",
                maxHeight: "80vh",
                overflow: "auto"
              }}
            >
              <img
                src={viewerImage.signedUrl}
                alt={viewerImage.file_name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "78vh",
                  display: "block",
                  margin: "0 auto",
                  borderRadius: "12px"
                }}
              />
            </div>
          </div>
        </div>
      )}

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