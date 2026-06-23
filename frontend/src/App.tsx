import { Link } from 'react-router-dom';

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Creatycios</h1>
      <p>Bienvenido — usa /login y /register para probar.</p>
      <p>
        <Link to="/login">Login</Link> | <Link to="/register">Register</Link> | <Link to="/ads">Mis Anuncios</Link>
      </p>
    </div>
  );
}
