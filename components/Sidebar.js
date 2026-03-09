export default function Sidebar() {
  return (
    <div style={{
      width: "220px",
      background: "#171717",
      color: "#F0F0F0",
      height: "100vh",
      padding: "20px"
    }}>
      <h2 style={{color:"#F0F0F0"}}>Alfaguides</h2>

      <ul style={{listStyle:"none", padding:0}}>
        <li style={{margin:"20px 0"}}>Dashboard</li>
        <li style={{margin:"20px 0"}}>New Case</li>
        <li style={{margin:"20px 0"}}>Cases</li>
        <li style={{margin:"20px 0"}}>Settings</li>
      </ul>
    </div>
  )
}