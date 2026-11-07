import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { registrarAlExpirarSesion } from '../api/cliente.js';
import { autenticacion } from '../api/recursos.js';
import { borrarSesion, guardarSesion, leerSesion } from '../api/sesion.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(leerSesion);
  const [aviso, setAviso] = useState(null);

  const iniciarSesion = useCallback(async (credenciales) => {
    const nueva = await autenticacion.iniciarSesion(credenciales);
    guardarSesion(nueva);
    setAviso(null);
    setSesion(nueva);
  }, []);

  const cerrarSesion = useCallback((motivo = null) => {
    borrarSesion();
    setAviso(motivo);
    setSesion(null);
  }, []);

  useEffect(() => {
    registrarAlExpirarSesion(() => cerrarSesion('Tu sesión expiró. Inicia sesión de nuevo.'));
  }, [cerrarSesion]);

  const valor = useMemo(
    () => ({ usuario: sesion?.usuario ?? null, aviso, iniciarSesion, cerrarSesion }),
    [sesion, aviso, iniciarSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
