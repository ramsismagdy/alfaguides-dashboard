import Sidebar from "../components/Sidebar"

export default function Home() {
  return (
    <div style={{display:"flex"}}>

      <Sidebar />

      <div style={{padding:"40px", flex:1}}>
        <h1>Dashboard</h1>
        <p>Welcome to Alfaguides Dental Lab Portal</p>
      </div>

    </div>
  )
}