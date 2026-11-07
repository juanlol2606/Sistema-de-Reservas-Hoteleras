import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const AvisosContext = createContext(null);
const DURACION_MS = 4500;

export function AvisosProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const siguienteId = useRef(0);

  const mostrarAviso = useCallback((texto, tipo = 'exito') => {
    const id = siguienteId.current++;
    setAvisos((actuales) => [...actuales, { id, texto, tipo }]);
    setTimeout(() => setAvisos((actuales) => actuales.filter((aviso) => aviso.id !== id)), DURACION_MS);
  }, []);

  const valor = useMemo(() => ({ mostrarAviso }), [mostrarAviso]);

  return (
    <AvisosContext.Provider value={valor}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        {avisos.map((aviso) => (
          <div key={aviso.id} className={`aviso aviso-${aviso.tipo}`}>
            {aviso.texto}
          </div>
        ))}
      </div>
    </AvisosContext.Provider>
  );
}

export const useAvisos = () => useContext(AvisosContext);
