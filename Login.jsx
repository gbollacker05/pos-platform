import React, { useState } from 'react'
import { login } from '../lib/api'
import { useNavigate } from 'react-router-dom'

export default function Login(){
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [err, setErr] = useState('')
  const navigate = useNavigate()

  const submit = async (e)=>{
    e.preventDefault()
    try{
      await login(email, password)
      navigate('/')
    }catch(e){
      setErr('Invalid credentials')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={submit} className="bg-white p-6 rounded-xl shadow-sm w-full max-w-sm space-y-3">
        <div className="text-xl font-semibold">Sign in</div>
        <input className="border rounded-lg px-3 py-2 w-full" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="border rounded-lg px-3 py-2 w-full" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {err && <div className="text-sm text-red-600">{err}</div>}
        <button className="w-full rounded-lg bg-black text-white px-4 py-2">Sign in</button>
      </form>
    </div>
  )
}
