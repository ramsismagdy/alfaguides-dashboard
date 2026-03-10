"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Sidebar from "../../../components/Sidebar"
import { createClient } from "../../../utils/supabase/client"

const DISPLAY_TIMEZONE = "Africa/Cairo"

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

const allStatusOptions = [
  "New Case",
  "Pending Info",
  "In Design",
  "Manufacturing",
  "Ready",
  "Delivered",
  "Cancelled"
]

const allowedActivityEventTypes = [
  "file_uploaded",
  "case_info_updated",
  "status_changed",
  "case_created",
  "case_assigned",
  "case_unassigned"
]

function parseAppDate(value) {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const text = String(value).trim()
  if (!text) return null

  const hasTimezone =
    text.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(text)

  const normalized = hasTimezone ? text : `${text}Z`
  const date = new Date(normalized)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function formatDate(value) {
  if (!value) return "-"
  const date = parseAppDate(value)
  if (!date) return String(value)

  return new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: DISPLAY_TIMEZONE
  }).format(date)
}

function formatDateTime(value) {
  if (!value) return "-"
  const date = parseAppDate(value)
  if (!date) return String(value)

  const datePart = new Intl.DateTimeFormat("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    timeZone: DISPLAY_TIMEZONE
  }).format(date)

  const timePart = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: DISPLAY_TIMEZONE,
    timeZoneName: "short"
  }).format(date)

  return `${datePart}, ${timePart}`
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

function buildActorLabel(profile, user) {
  if (profile?.full_name?.trim()) return profile.full_name.trim()
  if (profile?.email?.trim()) return profile.email.trim()
  if (user?.email?.trim()) return user.email.trim()
  return "User"
}

function getActivityBadgeStyle(type) {
  const base = {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "600",
    display: "inline-block"
  }

  switch (type) {
    case "file_uploaded":
      return { ...base, background: "#DFF5E3", color: "#1B7A34" }
    case "case_info_updated":
      return { ...base, background: "#F3E8FF", color: "#7C3AED" }
    case "status_changed":
      return { ...base, background: "#EFE6FF", color: "#6D28D9" }
    case "case_created":
      return { ...base, background: "#E3EDFF", color: "#1D4ED8" }
    case "note_added":
      return { ...base, background: "#FFF4E5", color: "#B45309" }
    case "case_assigned":
      return { ...base, background: "#E8F1FF", color: "#1E40AF" }
    default:
      return { ...base, background: "#F1F1F1", color: "#555" }
  }
}

function getActivityBadgeLabel(type) {
  switch (type) {
    case "file_uploaded":
      return "File Uploaded"
    case "case_info_updated":
      return "Case Info Updated"
    case "status_changed":
      return "Status Updated"
    case "case_created":
      return "Case Created"
    case "note_added":
      return "Note Added"
    case "case_assigned":
      return "Case Assigned"
    default:
      return "Activity"
  }
}

function extractAfterColon(text) {
  const idx = String(text || "").indexOf(":")
  if (idx === -1) return ""
  return String(text).slice(idx + 1).trim()
}

function extractStatusChange(text) {
  const match = String(text || "").match(/from\s+(.+?)\s+to\s+(.+)$/i)
  if (!match) return ""
  return `from ${match[1]} to ${match[2]}`
}

function extractAssignedTarget(text) {
  const matchTo = String(text || "").match(/\bto\s+(.+)$/i)
  if (matchTo) return matchTo[1].trim()

  const matchFrom = String(text || "").match(/\bfrom\s+(.+)$/i)
  if (matchFrom) return matchFrom[1].trim()

  return ""
}

function replaceDesignerNamesWithRole(text, designers) {
  let result = String(text || "")

  ;(designers || []).forEach((designer) => {
    const fullName = String(designer?.full_name || "").trim()
    if (!fullName) return
    const escaped = fullName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    result = result.replace(new RegExp(escaped, "gi"), "Designer")
  })

  return result
}

function looksLikeSystemGeneratedNote(noteText) {
  const text = String(noteText || "").trim().toLowerCase()

  return (
    text.includes("assigned case to") ||
    text.includes("unassigned case from") ||
    text.includes("updated case info:") ||
    text.includes("updated status from") ||
    text.includes("created case (") ||
    text.startsWith("status changed from ") ||
    text.includes("reassigned this case from") ||
    text.includes("assigned this case to") ||
    text.includes("unassigned this case from") ||
    text.includes("changed the case status from") ||
    text.includes("updated case information:")
  )
}

function getActorDisplayName({
  item,
  currentRole,
  currentUser,
  currentProfile,
  designers,
  activityProfiles
}) {
  const createdById = item.created_by_user_id || null
  const isSelf = createdById && currentUser?.id && createdById === currentUser.id

  if (currentRole === "dentist") {
    if (isSelf) {
      return buildActorLabel(currentProfile, currentUser)
    }

    const creatorProfile = createdById ? activityProfiles?.[createdById] : null
    const creatorRole = String(creatorProfile?.role || "").toLowerCase()

    if (creatorRole === "designer") {
      return "Designer"
    }

    if (creatorRole === "admin") {
      return "Admin"
    }

    const creatorDesigner = (designers || []).find(
      (designer) => designer.id === createdById
    )

    if (creatorDesigner) {
      return "Designer"
    }

    return "Admin"
  }

  if (isSelf) {
    return buildActorLabel(currentProfile, currentUser)
  }

  const creatorProfile = createdById ? activityProfiles?.[createdById] : null

  if (creatorProfile?.full_name && String(creatorProfile.full_name).trim()) {
    return String(creatorProfile.full_name).trim()
  }

  if (creatorProfile?.email && String(creatorProfile.email).trim()) {
    return String(creatorProfile.email).trim()
  }

  const creatorDesigner = (designers || []).find(
    (designer) => designer.id === createdById
  )

  if (creatorDesigner?.full_name) {
    return creatorDesigner.full_name
  }

  if (item.created_by_name && String(item.created_by_name).trim()) {
    return String(item.created_by_name).trim()
  }

  return "Admin"
}

function buildActivityText({
  item,
  currentRole,
  currentUser,
  currentProfile,
  designers,
  activityProfiles,
  caseData
}) {
  const actor = getActorDisplayName({
    item,
    currentRole,
    currentUser,
    currentProfile,
    designers,
    activityProfiles
  })

  if (item.activity_type === "note_added") {
    if (currentRole === "dentist" && item.created_by_user_id !== currentUser?.id) {
      return `"${String(item.text || "").trim()}"`
    }

    return `${actor} added "${String(item.text || "").trim()}"`
  }

  if (item.activity_type === "file_uploaded") {
    const fileName = extractAfterColon(item.text)
    return `${actor} uploaded file: ${fileName || "file"}`
  }

  if (item.activity_type === "case_info_updated") {
    const details = extractAfterColon(item.text) || String(item.text || "").trim()
    return `${actor} updated case info: ${details}`
  }

  if (item.activity_type === "status_changed") {
    const details = extractStatusChange(item.text)
    return details
      ? `${actor} updated status ${details}`
      : `${actor} updated status`
  }

  if (item.activity_type === "case_created") {
    const caseNumber = caseData?.case_number ? ` (${caseData.case_number})` : ""
    return `${actor} created case${caseNumber}`
  }

  if (item.activity_type === "case_assigned") {
    const targetRaw = extractAssignedTarget(item.text)
    const target =
      currentRole === "dentist"
        ? replaceDesignerNamesWithRole(targetRaw, designers)
        : targetRaw

    return `${actor} assigned case to ${target || "Designer"}`
  }

  return String(item.text || "").trim()
}

function dedupeActivityItems(items) {
  const seen = new Set()

  return items.filter((item) => {
    const minuteKey = (() => {
      const date = parseAppDate(item.created_at)
      if (!date) return String(item.created_at || "")
      return `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}-${date.getUTCHours()}-${date.getUTCMinutes()}`
    })()

    const normalizedText = String(item.text || "").trim().toLowerCase()

    const key = [
      item.activity_type,
      item.created_by_user_id || "",
      minuteKey,
      normalizedText
    ].join("|")

    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export default function CaseDetailsPage() {
  const params = useParams()
  const caseId = params?.caseNumber

  const [caseData, setCaseData] = useState(null)
  const [caseNotes, setCaseNotes] = useState([])
  const [timeline, setTimeline] = useState([])
  const [files, setFiles] = useState([])
  const [designers, setDesigners] = useState([])
  const [activityProfiles, setActivityProfiles] = useState({})
  const [selectedDesignerId, setSelectedDesignerId] = useState("")
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedFinalDesignFiles, setSelectedFinalDesignFiles] = useState([])
  const [fileInputKey, setFileInputKey] = useState(0)
  const [finalDesignInputKey, setFinalDesignInputKey] = useState(0)
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
  const [uploadingFinalDesign, setUploadingFinalDesign] = useState(false)
  const [filesMessage, setFilesMessage] = useState("")
  const [finalDesignMessage, setFinalDesignMessage] = useState("")
  const [viewerImage, setViewerImage] = useState(null)
  const [currentRole, setCurrentRole] = useState("")
  const [currentProfile, setCurrentProfile] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [dentistDisplayName, setDentistDisplayName] = useState("")
  const [noteVisibleToDentist, setNoteVisibleToDentist] = useState(false)

  const [status, setStatus] = useState("")
  const [editableImplantType, setEditableImplantType] = useState("")
  const [editableSurgicalKit, setEditableSurgicalKit] = useState("")
  const [editableSurgicalDate, setEditableSurgicalDate] = useState("")
  const [newNote, setNewNote] = useState("")

  useEffect(() => {
    if (caseId) {
      fetchCaseDetails()
    } else {
      setLoading(false)
      setMessage("Case ID not found in URL.")
    }
  }, [caseId])

  const fetchFilesWithUrls = async (supabase, casePrimaryId) => {
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
    const supabase = createClient()

    setLoading(true)
    setMessage("")
    setStatusMessage("")
    setCaseInfoMessage("")
    setAssignmentMessage("")
    setNotesMessage("")
    setFilesMessage("")
    setFinalDesignMessage("")

    const decodedCaseId = decodeURIComponent(caseId)

    const {
      data: { user },
      error: userError
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage("Unable to load the logged-in user.")
      setLoading(false)
      return
    }

    setCurrentUser(user)

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, is_active")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError || !profile) {
      setMessage(profileError?.message || "Unable to load the user profile.")
      setLoading(false)
      return
    }

    setCurrentProfile(profile)
    setCurrentRole(profile.role || "")

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

    let resolvedDentistName =
      data.dentist_name ||
      data.dentist_email ||
      "-"

    if (data.dentist_user_id) {
      const { data: dentistProfile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", data.dentist_user_id)
        .maybeSingle()

      if (dentistProfile?.full_name?.trim()) {
        resolvedDentistName = dentistProfile.full_name.trim()
      } else if (dentistProfile?.email?.trim()) {
        resolvedDentistName = dentistProfile.email.trim()
      }
    }

    setDentistDisplayName(resolvedDentistName)

    const [notesResult, timelineResult, designersResult] = await Promise.all([
      supabase
        .from("case_notes")
        .select("*")
        .eq("case_id", decodedCaseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("case_timeline")
        .select("*")
        .eq("case_id", decodedCaseId)
        .order("created_at", { ascending: false }),
      supabase
        .from("designers")
        .select("*")
        .eq("is_active", true)
        .order("full_name", { ascending: true })
    ])

    if (notesResult.error) {
      setMessage(`Error: ${notesResult.error.message}`)
      setLoading(false)
      return
    }

    if (timelineResult.error) {
      setMessage(`Error: ${timelineResult.error.message}`)
      setLoading(false)
      return
    }

    if (designersResult.error && (profile.role === "admin" || profile.role === "designer")) {
      setMessage(`Error: ${designersResult.error.message}`)
      setLoading(false)
      return
    }

    try {
      await fetchFilesWithUrls(supabase, decodedCaseId)
    } catch (fileErr) {
      setMessage(`Error: ${fileErr.message}`)
      setLoading(false)
      return
    }

    const notesData = notesResult.data || []
    const timelineData = timelineResult.data || []
    const designersData = designersResult.data || []

    setCaseNotes(notesData)
    setTimeline(timelineData)
    setDesigners(designersData)

    const creatorIds = [
      ...new Set(
        [...notesData, ...timelineData]
          .map((item) => item.created_by_user_id)
          .filter(Boolean)
      )
    ]

    if (creatorIds.length > 0) {
      const { data: creatorProfiles } = await supabase
        .from("profiles")
        .select("id, full_name, email, role")
        .in("id", creatorIds)

      const mappedProfiles = (creatorProfiles || []).reduce((acc, item) => {
        acc[item.id] = item
        return acc
      }, {})

      setActivityProfiles(mappedProfiles)
    } else {
      setActivityProfiles({})
    }

    setLoading(false)
  }

  const addSystemTimelineOnly = async (supabase, timelineEntry) => {
    const { data } = await supabase
      .from("case_timeline")
      .insert([
        {
          ...timelineEntry,
          created_by_user_id: currentUser.id
        }
      ])
      .select()

    if (data?.[0]) {
      setTimeline((prev) => [data[0], ...prev])
    }
  }

  const makeNoteVisibleToDentist = async (noteId) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("case_notes")
      .update({ visible_to_dentist: true })
      .eq("id", noteId)
      .select()

    if (error) {
      setNotesMessage(`Error: ${error.message}`)
      return
    }

    if (data?.[0]) {
      setCaseNotes((prev) =>
        prev.map((item) =>
          item.id === noteId ? { ...item, visible_to_dentist: true } : item
        )
      )
    }
  }

  const makeTimelineVisibleToDentist = async (timelineId) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("case_timeline")
      .update({ visible_to_dentist: true })
      .eq("id", timelineId)
      .select()

    if (error) {
      setNotesMessage(`Error: ${error.message}`)
      return
    }

    if (data?.[0]) {
      setTimeline((prev) =>
        prev.map((item) =>
          item.id === timelineId ? { ...item, visible_to_dentist: true } : item
        )
      )
    }
  }

  const hideNoteFromDentist = async (noteId) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("case_notes")
      .update({ visible_to_dentist: false })
      .eq("id", noteId)
      .select()

    if (error) {
      setNotesMessage(`Error: ${error.message}`)
      return
    }

    if (data?.[0]) {
      setCaseNotes((prev) =>
        prev.map((item) =>
          item.id === noteId ? { ...item, visible_to_dentist: false } : item
        )
      )
    }
  }

  const hideTimelineFromDentist = async (timelineId) => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("case_timeline")
      .update({ visible_to_dentist: false })
      .eq("id", timelineId)
      .select()

    if (error) {
      setNotesMessage(`Error: ${error.message}`)
      return
    }

    if (data?.[0]) {
      setTimeline((prev) =>
        prev.map((item) =>
          item.id === timelineId ? { ...item, visible_to_dentist: false } : item
        )
      )
    }
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

    if (currentRole === "dentist" && status !== "Cancelled") {
      setStatusMessage("Dentists can only cancel the case.")
      return
    }

    const supabase = createClient()

    setSavingStatus(true)
    setStatusMessage("")

    const oldStatus = caseData.status || "Unknown"
    const actorLabel = buildActorLabel(currentProfile, currentUser)

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

    await addSystemTimelineOnly(supabase, {
      case_id: caseData.id,
      event_type: "status_changed",
      event_text: `${actorLabel} updated status from ${oldStatus} to ${status}`,
      visible_to_dentist: currentRole === "dentist"
    })

    setCaseData({
      ...caseData,
      ...updatePayload
    })
    setSelectedDesignerId(status === "Delivered" ? "" : (caseData.assigned_designer_id || ""))

    setStatusMessage("Status updated successfully.")
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

    const supabase = createClient()

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

    const actorLabel = buildActorLabel(currentProfile, currentUser)

    await addSystemTimelineOnly(supabase, {
      case_id: caseData.id,
      event_type: "case_info_updated",
      event_text: `${actorLabel} updated case info: ${changes.join(" | ")}`,
      visible_to_dentist: currentRole === "dentist"
    })

    setCaseData({
      ...caseData,
      implant_type: updatePayload.implant_type,
      surgical_kit: updatePayload.surgical_kit,
      surgical_date: updatePayload.surgical_date
    })

    setCaseInfoMessage("Case information updated successfully.")
    setSavingCaseInfo(false)
  }

  const updateAssignment = async () => {
    if (!caseData?.id) {
      setAssignmentMessage("Case ID is missing.")
      return
    }

    if (!(currentRole === "admin" || currentRole === "designer")) {
      setAssignmentMessage("You do not have permission to assign this case.")
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

    const supabase = createClient()

    setSavingAssignment(true)
    setAssignmentMessage("")

    const nextDesignerName = selectedDesigner.full_name
    const actorLabel = buildActorLabel(currentProfile, currentUser)

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

    await addSystemTimelineOnly(supabase, {
      case_id: caseData.id,
      event_type: "case_assigned",
      event_text: `${actorLabel} assigned case to ${nextDesignerName}`,
      visible_to_dentist: false
    })

    setCaseData({
      ...caseData,
      assigned_designer_id: selectedDesigner.id,
      assigned_designer_name: selectedDesigner.full_name
    })

    setAssignmentMessage("Designer assigned successfully.")
    setSavingAssignment(false)
  }

  const unassignDesigner = async () => {
    if (!caseData?.id) {
      setAssignmentMessage("Case ID is missing.")
      return
    }

    if (!(currentRole === "admin" || currentRole === "designer")) {
      setAssignmentMessage("You do not have permission to unassign this case.")
      return
    }

    if (!caseData.assigned_designer_name) {
      setAssignmentMessage("This case is already unassigned.")
      return
    }

    const confirmed = window.confirm(`Unassign ${caseData.assigned_designer_name} from this case?`)
    if (!confirmed) return

    const supabase = createClient()

    setSavingAssignment(true)
    setAssignmentMessage("")

    const previousDesignerName = caseData.assigned_designer_name
    const actorLabel = buildActorLabel(currentProfile, currentUser)

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

    await addSystemTimelineOnly(supabase, {
      case_id: caseData.id,
      event_type: "case_unassigned",
      event_text: `${actorLabel} unassigned case from ${previousDesignerName}`,
      visible_to_dentist: false
    })

    setCaseData({
      ...caseData,
      assigned_designer_id: null,
      assigned_designer_name: null
    })
    setSelectedDesignerId("")

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

    const supabase = createClient()

    setSavingNote(true)
    setNotesMessage("")

    const visibleToDentist = currentRole === "dentist" ? true : noteVisibleToDentist

    const { data, error } = await supabase
      .from("case_notes")
      .insert([
        {
          case_id: caseData.id,
          note_text: newNote.trim(),
          created_by_user_id: currentUser.id,
          visible_to_dentist: visibleToDentist
        }
      ])
      .select()

    if (error) {
      setNotesMessage(`Error: ${error.message}`)
      setSavingNote(false)
      return
    }

    if (data?.[0]) {
      setCaseNotes((prev) => [data[0], ...prev])
      const creatorProfile = currentProfile
        ? {
            id: currentProfile.id,
            full_name: currentProfile.full_name,
            email: currentProfile.email,
            role: currentProfile.role
          }
        : null

      if (creatorProfile?.id) {
        setActivityProfiles((prev) => ({
          ...prev,
          [creatorProfile.id]: creatorProfile
        }))
      }
    }

    setNewNote("")
    setNoteVisibleToDentist(false)
    setNotesMessage("Note added successfully.")
    setSavingNote(false)
  }

  const uploadFilesBySection = async (section) => {
    if (!caseData?.id) {
      if (section === "final_design") {
        setFinalDesignMessage("Case ID is missing.")
      } else {
        setFilesMessage("Case ID is missing.")
      }
      return
    }

    const selectedList = section === "final_design" ? selectedFinalDesignFiles : selectedFiles

    if (!selectedList.length) {
      if (section === "final_design") {
        setFinalDesignMessage("Please choose at least one file.")
      } else {
        setFilesMessage("Please choose at least one file.")
      }
      return
    }

    const invalidFiles = selectedList.filter((file) => !isAllowedFile(file))
    if (invalidFiles.length > 0) {
      const text = `Unsupported file type: ${invalidFiles[0].name}`
      if (section === "final_design") {
        setFinalDesignMessage(text)
      } else {
        setFilesMessage(text)
      }
      return
    }

    if (section === "final_design" && !(currentRole === "admin" || currentRole === "designer")) {
      setFinalDesignMessage("You do not have permission to upload final designs.")
      return
    }

    const supabase = createClient()

    if (section === "final_design") {
      setUploadingFinalDesign(true)
      setFinalDesignMessage("")
    } else {
      setUploadingFiles(true)
      setFilesMessage("")
    }

    const uploadedRecords = []
    const timelineEntries = []

    try {
      for (const file of selectedList) {
        const fileType = detectFileType(file)
        const safeName = sanitizeFileName(file.name)
        const prefix = section === "final_design" ? "final-design" : "uploads"
        const filePath = `${caseData.id}/${prefix}/${Date.now()}-${safeName}`

        const { error: uploadError } = await supabase
          .storage
          .from("case-files")
          .upload(filePath, file, {
            upsert: false,
            contentType: file.type || undefined
          })

        if (uploadError) throw uploadError

        const { data: fileRowData, error: fileRowError } = await supabase
          .from("case_files")
          .insert([
            {
              case_id: caseData.id,
              file_name: file.name,
              file_path: filePath,
              file_type: fileType,
              file_section: section
            }
          ])
          .select()

        if (fileRowError) throw fileRowError

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
            event_text: `${buildActorLabel(currentProfile, currentUser)} uploaded file: ${insertedFile.file_name}`,
            created_by_user_id: currentUser.id,
            visible_to_dentist: section === "final_design" || currentRole === "dentist"
          })
        }
      }

      if (timelineEntries.length > 0) {
        const { data: timelineInsert } = await supabase
          .from("case_timeline")
          .insert(timelineEntries)
          .select()

        if (timelineInsert?.length) {
          setTimeline((prev) => [...timelineInsert.reverse(), ...prev])

          if (currentProfile?.id) {
            setActivityProfiles((prev) => ({
              ...prev,
              [currentProfile.id]: {
                id: currentProfile.id,
                full_name: currentProfile.full_name,
                email: currentProfile.email,
                role: currentProfile.role
              }
            }))
          }
        }
      }

      setFiles((prev) => [...uploadedRecords.reverse(), ...prev])

      if (section === "final_design") {
        setSelectedFinalDesignFiles([])
        setFinalDesignInputKey((prev) => prev + 1)
        setFinalDesignMessage("Final design uploaded successfully.")
      } else {
        setSelectedFiles([])
        setFileInputKey((prev) => prev + 1)
        setFilesMessage("Files uploaded successfully.")
      }
    } catch (err) {
      if (section === "final_design") {
        setFinalDesignMessage(`Error: ${err.message}`)
      } else {
        setFilesMessage(`Error: ${err.message}`)
      }
    }

    if (section === "final_design") {
      setUploadingFinalDesign(false)
    } else {
      setUploadingFiles(false)
    }
  }

  const deleteFile = async (file) => {
    if (currentRole !== "admin") {
      setFilesMessage("Only admin can delete files.")
      return
    }

    const confirmed = window.confirm(`Delete ${file.file_name}?`)
    if (!confirmed) return

    const supabase = createClient()

    setFilesMessage("")
    setFinalDesignMessage("")

    try {
      const { error: storageError } = await supabase
        .storage
        .from("case-files")
        .remove([file.file_path])

      if (storageError) throw storageError

      const { error: rowDeleteError } = await supabase
        .from("case_files")
        .delete()
        .eq("id", file.id)

      if (rowDeleteError) throw rowDeleteError

      setFiles((prev) => prev.filter((item) => item.id !== file.id))
      setFilesMessage("File deleted successfully.")
    } catch (err) {
      setFilesMessage(`Error: ${err.message}`)
    }
  }

  const regularFiles = useMemo(
    () => files.filter((file) => (file.file_section || "case_file") !== "final_design"),
    [files]
  )

  const finalDesignFiles = useMemo(
    () => files.filter((file) => (file.file_section || "case_file") === "final_design"),
    [files]
  )

  const imageFiles = regularFiles.filter(isImageFile)

  const activityItems = useMemo(() => {
    const noteItems = caseNotes
      .filter((note) => !looksLikeSystemGeneratedNote(note.note_text))
      .map((note) => ({
        id: `note-${note.id}`,
        rawId: note.id,
        activity_type: "note_added",
        created_at: note.created_at,
        text: note.note_text,
        visible_to_dentist: note.visible_to_dentist === true,
        created_by_user_id: note.created_by_user_id || null
      }))

    const timelineItems = timeline
      .filter((event) => allowedActivityEventTypes.includes(event.event_type))
      .map((event) => ({
        id: `timeline-${event.id}`,
        rawId: event.id,
        activity_type:
          event.event_type === "case_unassigned" ? "case_assigned" : event.event_type,
        original_event_type: event.event_type,
        created_at: event.created_at,
        text: event.event_text,
        visible_to_dentist: event.visible_to_dentist === true,
        created_by_user_id: event.created_by_user_id || null
      }))

    let combined = [...noteItems, ...timelineItems].sort((a, b) => {
      const aTime = parseAppDate(a.created_at)?.getTime() || 0
      const bTime = parseAppDate(b.created_at)?.getTime() || 0
      return bTime - aTime
    })

    combined = dedupeActivityItems(combined)

    if (currentRole !== "dentist" || !currentUser?.id) {
      return combined
    }

    return combined.filter((item) => {
      return item.visible_to_dentist === true || item.created_by_user_id === currentUser.id
    })
  }, [caseNotes, timeline, currentRole, currentUser])

  const canManageAssignments = currentRole === "admin" || currentRole === "designer"
  const canUploadFinalDesign = currentRole === "admin" || currentRole === "designer"
  const statusOptionsForCurrentRole =
    currentRole === "dentist" ? ["Cancelled"] : allStatusOptions

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
                <div style={labelStyle}>Dentist Name</div>
                <div style={valueStyle}>{dentistDisplayName || "-"}</div>
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

              <div style={{ marginBottom: currentRole !== "dentist" ? "18px" : 0 }}>
                <div style={labelStyle}>Current Status</div>
                <div style={valueStyle}>{caseData.status || "-"}</div>
              </div>

              {currentRole !== "dentist" && (
                <div style={{ marginBottom: 0 }}>
                  <div style={labelStyle}>Assigned Designer</div>
                  <div style={valueStyle}>{caseData.assigned_designer_name || "Unassigned"}</div>
                </div>
              )}
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
                <div style={labelStyle}>Final Design</div>

                {canUploadFinalDesign && (
                  <>
                    <input
                      key={finalDesignInputKey}
                      type="file"
                      multiple
                      accept=".stl,.obj,.ply,.dcm,.dicom,image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,.svg,.zip,.rar,.7z,.tar,.gz,.bz2,.xz"
                      style={inputStyle}
                      onChange={(e) => setSelectedFinalDesignFiles(Array.from(e.target.files || []))}
                    />

                    <button
                      type="button"
                      onClick={() => uploadFilesBySection("final_design")}
                      disabled={uploadingFinalDesign}
                      style={{
                        ...buttonStyle,
                        marginTop: "14px",
                        opacity: uploadingFinalDesign ? 0.7 : 1
                      }}
                    >
                      {uploadingFinalDesign ? "Uploading..." : "Upload Final Design"}
                    </button>
                  </>
                )}

                {finalDesignMessage && (
                  <p
                    style={{
                      marginTop: "14px",
                      color: "#685B60",
                      fontSize: "14px"
                    }}
                  >
                    {finalDesignMessage}
                  </p>
                )}

                <div style={{ marginTop: "20px", display: "grid", gap: "14px" }}>
                  {finalDesignFiles.length === 0 ? (
                    <div style={{ color: "#685B60", fontSize: "14px" }}>
                      No final design files uploaded yet.
                    </div>
                  ) : (
                    finalDesignFiles.map((file) => (
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

                          {currentRole === "admin" && (
                            <button
                              type="button"
                              onClick={() => deleteFile(file)}
                              style={deleteButtonStyle}
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {canManageAssignments && (
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
            )}

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
                    {statusOptionsForCurrentRole.map((item) => (
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
                onClick={() => uploadFilesBySection("case_file")}
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

                {regularFiles.length === 0 ? (
                  <div style={{ color: "#685B60", fontSize: "14px" }}>
                    No files uploaded yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {regularFiles.map((file) => (
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

                          {currentRole === "admin" && (
                            <button
                              type="button"
                              onClick={() => deleteFile(file)}
                              style={deleteButtonStyle}
                            >
                              Delete
                            </button>
                          )}
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

                {currentRole !== "dentist" && (
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginTop: "14px",
                      color: "#685B60",
                      fontSize: "14px"
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={noteVisibleToDentist}
                      onChange={(e) => setNoteVisibleToDentist(e.target.checked)}
                    />
                    Visible to dentist
                  </label>
                )}
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
                  Activity
                </div>

                {activityItems.length === 0 ? (
                  <div style={{ color: "#685B60", fontSize: "14px" }}>
                    No activity yet.
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {activityItems.map((item) => {
                      const visibleToDentist = item.visible_to_dentist === true

                      const displayText = buildActivityText({
                        item,
                        currentRole,
                        currentUser,
                        currentProfile,
                        designers,
                        activityProfiles,
                        caseData
                      })

                      return (
                        <div
                          key={item.id}
                          style={{
                            border: visibleToDentist ? "1px solid #B7E3C1" : "1px solid #E7D9E3",
                            borderRadius: "14px",
                            padding: "14px",
                            background: visibleToDentist ? "#EEF9F1" : "#FFFFFF"
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
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center",
                                flexWrap: "wrap"
                              }}
                            >
                              <span style={getActivityBadgeStyle(item.activity_type)}>
                                {getActivityBadgeLabel(item.activity_type)}
                              </span>
                            </div>

                            <span
                              style={{
                                color: "#9B8C93",
                                fontSize: "12px"
                              }}
                            >
                              {formatDateTime(item.created_at)}
                            </span>
                          </div>

                          <div
                            style={{
                              color: "#685B60",
                              fontSize: "14px",
                              lineHeight: "1.6"
                            }}
                          >
                            {displayText}
                          </div>

                          {(currentRole === "admin" || currentRole === "designer") && (
                            <div
                              style={{
                                marginTop: "12px",
                                display: "flex",
                                gap: "10px",
                                flexWrap: "wrap"
                              }}
                            >
                              {!visibleToDentist ? (
                                <button
                                  type="button"
                                  onClick={() =>
                                    item.activity_type === "note_added"
                                      ? makeNoteVisibleToDentist(item.rawId)
                                      : makeTimelineVisibleToDentist(item.rawId)
                                  }
                                  style={{
                                    ...secondaryButtonStyle,
                                    padding: "8px 12px"
                                  }}
                                >
                                  Make Visible to Dentist
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    item.activity_type === "note_added"
                                      ? hideNoteFromDentist(item.rawId)
                                      : hideTimelineFromDentist(item.rawId)
                                  }
                                  style={{
                                    ...secondaryButtonStyle,
                                    padding: "8px 12px"
                                  }}
                                >
                                  Hide from Dentist
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
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