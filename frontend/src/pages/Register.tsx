import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'

export default function Register(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) =>{
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    try{
      const res = await axios.post(`${API_BASE}/auth/register`, { email, password, name })
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
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div>
          <label>Name</label>
          <input value={name} onChange={e=>setName(e.target.value)} maxLength={255} />
        </div>
        <div>
          <label>Email</label>
          <input type='email' value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <input type='password' value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button type='submit'>Register</button>
      </form>
    </div>
  )
}
