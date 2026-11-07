import { useEffect, useState } from 'react';

// Devuelve el valor con retraso: evita pedir datos a la API en cada tecla.
export function useRetraso(valor, retraso = 350) {
  const [retrasado, setRetrasado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setRetrasado(valor), retraso);
    return () => clearTimeout(temporizador);
  }, [valor, retraso]);

  return retrasado;
}
