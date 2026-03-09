export default function Sidebar() {
  const menuItemStyle = {
    margin: "18px 0",
    cursor: "pointer",
    color: "#F0F0F0",
    fontSize: "16px"
  }

  return (
    <div
      style={{
        width: "240px",
        background: "#171717",
        color: "#F0F0F0",
        minHeight: "100vh",
        padding: "24px",
        boxSizing: "border-box"
      }}
    >
      <h2 style={{ color: "#F0F0F0", marginBottom: "40px" }}>Alfaguides</h2>

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        <li style={menuItemStyle}>Dashboard</li>
        <li style={menuItemStyle}>New Case</li>
        <li style={menuItemStyle}>Cases</li>
        <li style={menuItemStyle}>Settings</li>
      </ul>
    </div>
  )
}