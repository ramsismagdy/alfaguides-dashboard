import Sidebar from "../../components/Sidebar"

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#685B60",
  fontSize: "14px",
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

export default function NewCasePage() {
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
        <div style={{ marginBottom: "28px" }}>
          <h1
            style={{
              margin: 0,
              color: "#685B60",
              fontSize: "32px"
            }}
          >
            New Case
          </h1>

          <p
            style={{
              color: "#685B60",
              marginTop: "10px",
              fontSize: "16px"
            }}
          >
            Submit a new surgical guide case
          </p>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
            maxWidth: "900px"
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px"
            }}
          >
            <div>
              <label style={labelStyle}>Patient First Name</label>
              <input type="text" placeholder="Enter first name" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Patient Last Name</label>
              <input type="text" placeholder="Enter last name" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Service</label>
              <select style={inputStyle} defaultValue="">
                <option value="" disabled>
                  Select service
                </option>
                <option>Surgical Guide</option>
                <option>Implant Planning</option>
                <option>Crown</option>
                <option>Denture</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Implant Type</label>
              <input type="text" placeholder="Enter implant type" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Surgical Kit</label>
              <input type="text" placeholder="Enter surgical kit" style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Surgical Date</label>
              <input type="date" style={inputStyle} />
            </div>
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              placeholder="Add case notes"
              style={{
                ...inputStyle,
                minHeight: "120px",
                resize: "vertical"
              }}
            />
          </div>

          <div style={{ marginTop: "20px" }}>
            <label style={labelStyle}>Upload Files</label>
            <input type="file" multiple style={inputStyle} />
          </div>

          <div style={{ marginTop: "28px" }}>
            <button
              style={{
                background: "#685B60",
                color: "#F0F0F0",
                border: "none",
                borderRadius: "12px",
                padding: "14px 22px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              Submit Case
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}