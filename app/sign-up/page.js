"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "../../utils/supabase/client"

const pageStyle = {
  minHeight: "100vh",
  background: "#F9F1F7",
  display: "flex",
  justifyContent: "center",
  padding: "24px"
}

const cardStyle = {
  width: "100%",
  maxWidth: "980px",
  background: "#171717",
  borderRadius: "24px",
  padding: "32px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.14)"
}

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "1px solid #3A3A3A",
  background: "#232323",
  color: "#F0F0F0",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box"
}

const countries = [
  "United States",
  "──────────",
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua and Barbuda",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Marshall Islands",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Micronesia",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Palestine",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Vatican City",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe"
]

export default function SignUpPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    name_prefix: "",
    first_name: "",
    last_name: "",
    email: "",
    additional_email_1: "",
    additional_email_2: "",
    additional_email_3: "",
    phone: "",
    additional_phone_1: "",
    additional_phone_2: "",
    additional_phone_3: "",
    full_address: "",
    city: "",
    state: "",
    zip_postal_code: "",
    country: "",
    preferred_implant_types: "",
    surgical_guided_kit: "",
    dentist_license_number: "",
    password: ""
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setMessage("")

    const supabase = createClient()

    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          role: "dentist",
          name_prefix: form.name_prefix.trim(),
          first_name: form.first_name.trim(),
          last_name: form.last_name.trim(),
          additional_email_1: form.additional_email_1.trim(),
          additional_email_2: form.additional_email_2.trim(),
          additional_email_3: form.additional_email_3.trim(),
          phone: form.phone.trim(),
          additional_phone_1: form.additional_phone_1.trim(),
          additional_phone_2: form.additional_phone_2.trim(),
          additional_phone_3: form.additional_phone_3.trim(),
          full_address: form.full_address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          zip_postal_code: form.zip_postal_code.trim(),
          country: form.country,
          preferred_implant_types: form.preferred_implant_types.trim(),
          surgical_guided_kit: form.surgical_guided_kit.trim(),
          dentist_license_number: form.dentist_license_number.trim(),
          special_note: ""
        }
      }
    })

    if (error) {
      const lowerMessage = String(error.message || "").toLowerCase()

      if (lowerMessage.includes("email rate limit exceeded")) {
        setMessage("Too many signup attempts in a short time. Please wait a few minutes and try again.")
      } else if (lowerMessage.includes("user already registered")) {
        setMessage("This email is already registered. Please sign in instead.")
      } else {
        setMessage(error.message)
      }

      setLoading(false)
      return
    }

    setMessage("Dentist account created successfully. Please check email confirmation if it is enabled, then sign in.")
    setLoading(false)

    setTimeout(() => {
      router.push("/sign-in")
    }, 1500)
  }

  return (
    <div style={pageStyle}>
      <form onSubmit={handleSubmit} style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
          <Image
            src="/alfaguides-logo-v3.png"
            alt="Alfaguides"
            width={210}
            height={100}
            style={{ objectFit: "contain" }}
            priority
          />
        </div>

        <h1 style={{ color: "#F0F0F0", marginTop: 0, marginBottom: "10px", textAlign: "center" }}>
          Dentist Sign Up
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px"
          }}
        >
          <div
            style={{
              gridColumn: "1 / -1",
              display: "grid",
              gridTemplateColumns: "120px 1fr 1fr",
              gap: "16px"
            }}
          >
            <input
              style={inputStyle}
              placeholder="Prefix"
              value={form.name_prefix}
              onChange={(e) => updateField("name_prefix", e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="First Name *"
              value={form.first_name}
              onChange={(e) => updateField("first_name", e.target.value)}
              required
            />
            <input
              style={inputStyle}
              placeholder="Last Name *"
              value={form.last_name}
              onChange={(e) => updateField("last_name", e.target.value)}
              required
            />
          </div>

          <input
            type="email"
            style={inputStyle}
            placeholder="Email *"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
          />
          <input
            type="email"
            style={inputStyle}
            placeholder="Additional Email 1"
            value={form.additional_email_1}
            onChange={(e) => updateField("additional_email_1", e.target.value)}
          />

          <input
            type="email"
            style={inputStyle}
            placeholder="Additional Email 2"
            value={form.additional_email_2}
            onChange={(e) => updateField("additional_email_2", e.target.value)}
          />
          <input
            type="email"
            style={inputStyle}
            placeholder="Additional Email 3"
            value={form.additional_email_3}
            onChange={(e) => updateField("additional_email_3", e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Phone *"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            required
          />
          <input
            style={inputStyle}
            placeholder="Additional Phone 1"
            value={form.additional_phone_1}
            onChange={(e) => updateField("additional_phone_1", e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Additional Phone 2"
            value={form.additional_phone_2}
            onChange={(e) => updateField("additional_phone_2", e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="Additional Phone 3"
            value={form.additional_phone_3}
            onChange={(e) => updateField("additional_phone_3", e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Full Address"
            value={form.full_address}
            onChange={(e) => updateField("full_address", e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="City"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
          />

          <div
            style={{
              gridColumn: "1 / -1",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "16px"
            }}
          >
            <input
              style={inputStyle}
              placeholder="Zip / Postal Code"
              value={form.zip_postal_code}
              onChange={(e) => updateField("zip_postal_code", e.target.value)}
            />
            <input
              style={inputStyle}
              placeholder="State"
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
            />
            <select
              style={inputStyle}
              value={form.country}
              onChange={(e) => updateField("country", e.target.value)}
            >
              <option value="">Country</option>
              {countries.map((country) =>
                country === "──────────" ? (
                  <option key={country} value="" disabled>
                    ──────────
                  </option>
                ) : (
                  <option key={country} value={country}>
                    {country}
                  </option>
                )
              )}
            </select>
          </div>

          <input
            style={inputStyle}
            placeholder="Preferred Implant Type(s)"
            value={form.preferred_implant_types}
            onChange={(e) => updateField("preferred_implant_types", e.target.value)}
          />
          <input
            style={inputStyle}
            placeholder="Surgical Guided Kit"
            value={form.surgical_guided_kit}
            onChange={(e) => updateField("surgical_guided_kit", e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Dentist License Number"
            value={form.dentist_license_number}
            onChange={(e) => updateField("dentist_license_number", e.target.value)}
          />
          <input
            type="password"
            style={inputStyle}
            placeholder="Password *"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "20px",
            background: "#685B60",
            color: "#F0F0F0",
            border: "none",
            borderRadius: "12px",
            padding: "14px 18px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
            fontWeight: "600",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Creating Account..." : "Create Dentist Account"}
        </button>

        <div style={{ marginTop: "18px", textAlign: "center", color: "#CFCFCF", fontSize: "14px" }}>
          Already have an account?{" "}
          <Link href="/sign-in" style={{ color: "#F0F0F0", fontWeight: "600", textDecoration: "none" }}>
            Sign In
          </Link>
        </div>

        {message && (
          <p style={{ marginTop: "18px", color: "#F0F0F0", textAlign: "center", lineHeight: "1.6" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}