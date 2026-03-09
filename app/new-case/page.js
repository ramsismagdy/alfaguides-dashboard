'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function NewCase(){

const [patient,setPatient] = useState('')
const [tooth,setTooth] = useState('')

const createCase = async () => {

await supabase
.from('cases')
.insert([
{
patient_first_name: patient,
tooth_number: tooth,
status:'New Case'
}
])

alert("Case submitted")
}

return(

<div>
<h1>Submit New Case</h1>

<input placeholder="Patient Name"
onChange={(e)=>setPatient(e.target.value)} />

<input placeholder="Tooth Number"
onChange={(e)=>setTooth(e.target.value)} />

<button onClick={createCase}>Submit</button>

</div>

)

}
const uploadFile = async (file) => {

const { data, error } =
await supabase.storage
.from('case-files')
.upload(`cases/${file.name}`, file)

}
const { data, error } =
await supabase
.from('cases')
.select('*')