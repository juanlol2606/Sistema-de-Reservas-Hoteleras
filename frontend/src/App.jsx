import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RutaProtegida from './components/RutaProtegida.jsx';
import Habitaciones from './pages/Habitaciones.jsx';
import Hoteles from './pages/Hoteles.jsx';
import Huespedes from './pages/Huespedes.jsx';
import Login from './pages/Login.jsx';
import NoEncontrada from './pages/NoEncontrada.jsx';
import ReservaDetalle from './pages/ReservaDetalle.jsx';
import Reservas from './pages/Reservas.jsx';

// Recharts pesa bastante: solo se descarga al entrar a Reportes.
const Reportes = lazy(() => import('./pages/Reportes.jsx'));

export default function App() {
  return (
    <Suspense fallback={<p className="vacio">Cargando…</p>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RutaProtegida />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/hoteles" replace />} />
            <Route path="hoteles" element={<Hoteles />} />
            <Route path="habitaciones" element={<Habitaciones />} />
            <Route path="huespedes" element={<Huespedes />} />
            <Route path="reservas" element={<Reservas />} />
            <Route path="reservas/:id" element={<ReservaDetalle />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="*" element={<NoEncontrada />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
