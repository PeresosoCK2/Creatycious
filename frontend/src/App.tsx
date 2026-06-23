import React from 'react'
import { Link } from 'react-router-dom'

export default function App(){
  return (
    <div style={{ padding: 20 }}>
      <h1>Creatycios (scaffold)</h1>
      <p>Bienvenido al scaffold — usa /login y /register para probar.
      </p>
      <p>
        <Link to='/login'>Login</Link> | <Link to='/register'>Register</Link>
      </p>
    </div>
  )
}
