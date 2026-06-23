import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) =>{
    e.preventDefault()
    setError(null)
    try{
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password })
      localStorage.setItem('token', res.data.token)
      nav('/')
    }catch(err: unknown){
      if (axios.isAxiosError(err)) {
        setError(err?.response?.data?.error || 'Error')
      } else {
        setError('Error')
      }
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <div>
          <label>Email</label>
          <input type='email' value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type='password' value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type='submit'>Login</button>
      </form>
    </div>
  )
}
