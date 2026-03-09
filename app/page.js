import Sidebar from "../components/Sidebar"

export default function Home() {
  return (
    <div style={{
      display:"flex",
      background:"#F9F1F7",
      minHeight:"100vh"
    }}>

      <Sidebar />

      <div style={{
        padding:"40px",
        flex:1,
        color:"#685B60"
      }}>
        <h1>Dashboard</h1>
        <p>Welcome to Alfaguides</p>
      </div>

    </div>
  )
}