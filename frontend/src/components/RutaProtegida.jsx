import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RutaProtegida() {
  const { usuario } = useAuth();
  const ubicacion = useLocation();

  if (!usuario) return <Navigate to="/login" replace state={{ desde: ubicacion }} />;
  return <Outlet />;
}
