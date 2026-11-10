import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Boton from './Boton.jsx';

const ENLACES = [
  { ruta: '/hoteles', texto: 'Hoteles' },
  { ruta: '/habitaciones', texto: 'Habitaciones' },
  { ruta: '/huespedes', texto: 'Huéspedes' },
  { ruta: '/reservas', texto: 'Reservas' },
  { ruta: '/reportes', texto: 'Reportes' },
];

export default function Layout() {
  const { usuario, cerrarSesion } = useAuth();

  return (
    <>
      <header className="cabecera">
        <div className="cabecera-interior">
          <NavLink to="/" className="marca">
            <span>Stay</span>Hub
          </NavLink>
          <nav className="navegacion" aria-label="Principal">
            {ENLACES.map(({ ruta, texto }) => (
              <NavLink key={ruta} to={ruta} className={({ isActive }) => (isActive ? 'activo' : undefined)}>
                {texto}
              </NavLink>
            ))}
          </nav>
          <div className="usuario">
            <span>{usuario.email}</span>
            <Boton variante="sobre-oscuro" onClick={() => cerrarSesion()}>
              Cerrar sesión
            </Boton>
          </div>
        </div>
      </header>
      <Outlet />
    </>
  );
}
