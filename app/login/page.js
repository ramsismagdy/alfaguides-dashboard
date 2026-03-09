'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    })

    if(error){
      alert(error.message)
    }else{
      alert("Logged in")
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  )
}