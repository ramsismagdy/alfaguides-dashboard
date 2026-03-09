import Link from "next/link"

export default function Sidebar() {
  const menuItemStyle = {
    margin: "18px 0",
    cursor: "pointer",
    color: "#F0F0F0",
    fontSize: "16px",
    textDecoration: "none",
    display: "block"
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

      <nav>
        <Link href="/" style={menuItemStyle}>
          Dashboard
        </Link>

        <Link href="/new-case" style={menuItemStyle}>
          New Case
        </Link>

        <Link href="/cases" style={menuItemStyle}>
          Cases
        </Link>

        <Link href="/settings" style={menuItemStyle}>
          Settings
        </Link>
      </nav>
    </div>
  )
}