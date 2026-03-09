import Sidebar from "../../components/Sidebar"

export default function CasesPage() {
  return (
    <div
      style={{
        display: "flex",
        background: "#F9F1F7",
        minHeight: "100vh"
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, padding: "32px", color: "#685B60" }}>
        <h1>Cases</h1>
        <p>Cases page coming next.</p>
      </div>
    </div>
  )
}