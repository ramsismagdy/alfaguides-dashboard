import Sidebar from "../components/Sidebar"

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: "16px",
        padding: "24px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
        minWidth: "220px",
        flex: 1
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#685B60"
        }}
      >
        {title}
      </p>

      <h2
        style={{
          marginTop: "12px",
          marginBottom: 0,
          color: "#685B60",
          fontSize: "28px"
        }}
      >
        {value}
      </h2>
    </div>
  )
}

const tableHeadStyle = {
  textAlign: "left",
  padding: "14px 12px",
  borderBottom: "1px solid #eee",
  color: "#685B60",
  fontSize: "14px",
  whiteSpace: "nowrap"
}

const tableCellStyle = {
  padding: "14px 12px",
  borderBottom: "1px solid #f1f1f1",
  color: "#685B60",
  fontSize: "14px",
  whiteSpace: "nowrap"
}

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

export default function Home() {
  const cases = [
    {
      id: "CASE-000124",
      firstName: "John",
      lastName: "Smith",
      service: "Surgical Guide",
      implant: "Straumann BLX",
      kit: "Straumann Kit",
      surgicalDate: "2026-03-12",
      status: "In Design"
    },
    {
      id: "CASE-000125",
      firstName: "Mariam",
      lastName: "Nabil",
      service: "Surgical Guide",
      implant: "Nobel Active",
      kit: "Nobel Biocare Kit",
      surgicalDate: "2026-03-14",
      status: "Pending Information"
    },
    {
      id: "CASE-000126",
      firstName: "David",
      lastName: "Lee",
      service: "Surgical Guide",
      implant: "Megagen AnyRidge",
      kit: "Megagen Kit",
      surgicalDate: "2026-03-10",
      status: "Ready"
    }
  ]

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
          boxSizing: "border-box"
        }}
      >
        <div style={{ marginBottom: "32px" }}>
          <h1
            style={{
              margin: 0,
              color: "#685B60",
              fontSize: "32px"
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              color: "#685B60",
              marginTop: "10px",
              fontSize: "16px"
            }}
          >
            Welcome to Alfaguides Dental Lab Portal
          </p>
        </div>

        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "32px"
          }}
        >
          <StatCard title="Active Cases" value="24" />
          <StatCard title="In Design" value="8" />
          <StatCard title="Ready for Delivery" value="5" />
          <StatCard title="Total Dentists" value="14" />
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)"
          }}
        >
          <h2
            style={{
              marginTop: 0,
              color: "#685B60",
              marginBottom: "20px"
            }}
          >
            Recent Cases
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse"
              }}
            >
              <thead>
                <tr>
                  <th style={tableHeadStyle}>Case ID</th>
                  <th style={tableHeadStyle}>Patient</th>
                  <th style={tableHeadStyle}>Service</th>
                  <th style={tableHeadStyle}>Implant Type</th>
                  <th style={tableHeadStyle}>Surgical Kit</th>
                  <th style={tableHeadStyle}>Surgical Date</th>
                  <th style={tableHeadStyle}>Status</th>
                </tr>
              </thead>

              <tbody>
                {cases.map((item) => (
                  <tr key={item.id}>
                    <td style={tableCellStyle}>{item.id}</td>
                    <td style={tableCellStyle}>
                      {item.firstName} {item.lastName}
                    </td>
                    <td style={tableCellStyle}>{item.service}</td>
                    <td style={tableCellStyle}>{item.implant}</td>
                    <td style={tableCellStyle}>{item.kit}</td>
                    <td style={tableCellStyle}>{formatDate(item.surgicalDate)}</td>
                    <td style={tableCellStyle}>{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}