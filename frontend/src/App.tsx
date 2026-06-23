import React from 'react'
import { Link } from 'react-router-dom'

export default function App(){
  return (
    <div style={{ padding: 20 }}>
      <h1>Creatycios</h1>
      <p>Bienvenido a Creatycios — plataforma para crear anuncios.</p>
      <p>
        <Link to='/login'>Login</Link> | <Link to='/register'>Register</Link>
      </p>
    </div>
  )
}
