import { useEffect, useState } from 'react';
import { hoteles, huespedes } from '../api/recursos.js';

function useOpciones(cargar, params, aOpcion) {
  const [opciones, setOpciones] = useState([]);

  useEffect(() => {
    let vigente = true;
    cargar(params)
      .then(({ data }) => vigente && setOpciones(data.map(aOpcion)))
      .catch(() => vigente && setOpciones([]));
    return () => {
      vigente = false;
    };
  }, []);

  return opciones;
}

const TODOS = { limit: 100 };

export const useOpcionesDeHoteles = () => useOpciones(hoteles.listar, TODOS, (h) => ({ valor: h._id, etiqueta: h.nombre }));

export const useOpcionesDeHuespedes = () =>
  useOpciones(huespedes.listar, { ...TODOS, activo: true }, (h) => ({
    valor: h._id,
    etiqueta: `${h.nombre} · ${h.documento.tipo} ${h.documento.numero}`,
  }));
