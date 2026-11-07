import { useEffect, useState } from 'react';
import { describirError } from '../api/errores.js';
import { quitarVacios } from '../utils/formato.js';
import { useRetraso } from './useRetraso.js';

export const LIMITE_POR_PAGINA = 10;

// Carga un listado paginado de la API y lo vuelve a pedir cuando cambian los filtros o la página.
export function useListado(cargar, filtrosIniciales = {}) {
  const [filtros, setFiltros] = useState(filtrosIniciales);
  const [pagina, setPagina] = useState(1);
  const [version, setVersion] = useState(0);
  const [estado, setEstado] = useState({ filas: [], total: 0, cargando: true, error: null });
  const filtrosEstables = useRetraso(filtros);

  useEffect(() => {
    let vigente = true;
    setEstado((anterior) => ({ ...anterior, cargando: true, error: null }));

    cargar({ ...quitarVacios(filtrosEstables), page: pagina, limit: LIMITE_POR_PAGINA })
      .then(({ data, total }) => vigente && setEstado({ filas: data, total, cargando: false, error: null }))
      .catch((error) => vigente && setEstado((anterior) => ({ ...anterior, cargando: false, error: describirError(error) })));

    return () => {
      vigente = false;
    };
  }, [cargar, filtrosEstables, pagina, version]);

  const cambiarFiltro = (campo, valor) => {
    setFiltros((anteriores) => ({ ...anteriores, [campo]: valor }));
    setPagina(1);
  };

  // Propiedades listas para un <Campo> de filtro.
  const filtro = (nombre) => ({
    nombre,
    valor: filtros[nombre] ?? '',
    alCambiar: (valor) => cambiarFiltro(nombre, valor),
  });

  return {
    ...estado,
    filtro,
    cambiarFiltro,
    pagina,
    cambiarPagina: setPagina,
    recargar: () => setVersion((n) => n + 1),
  };
}
