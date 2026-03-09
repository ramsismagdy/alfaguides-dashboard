export default function Home() {
  return (
    <main style={{padding:"40px",fontFamily:"Arial"}}>
      <h1>Alfaguides Dental Lab Portal</h1>

      <p>Welcome to the dental case management system.</p>

      <div style={{marginTop:"30px"}}>
        <a href="/login">Login</a>
      </div>

      <div style={{marginTop:"10px"}}>
        <a href="/new-case">Submit New Case</a>
      </div>
    </main>
  )
}