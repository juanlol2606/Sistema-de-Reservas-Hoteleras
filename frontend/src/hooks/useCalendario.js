import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { describirError } from '../api/errores.js';
import { calendario, hoteles } from '../api/recursos.js';
import { DIAS_CALENDARIO } from '../utils/catalogos.js';
import { hoyEnBogota, lunesDeLaSemana, quitarVacios, sumarDiasATexto } from '../utils/formato.js';

const DIAS_POR_DEFECTO = 14;
const TIPOS = ['sencilla', 'doble', 'suite'];
const esFecha = (texto) => /^\d{4}-\d{2}-\d{2}$/.test(texto ?? '') && !Number.isNaN(Date.parse(texto));

// El calendario vive en la URL (hotelId, desde, dias, tipo): recargar o compartir el link muestra lo mismo.
// Los valores inválidos o ausentes se reemplazan por los de defecto: la semana actual y 14 días.
function leerFiltros(parametros) {
  const dias = Number(parametros.get('dias'));
  const tipo = parametros.get('tipo');
  return {
    hotelId: parametros.get('hotelId') ?? '',
    desde: esFecha(parametros.get('desde')) ? parametros.get('desde') : lunesDeLaSemana(hoyEnBogota()),
    dias: DIAS_CALENDARIO.includes(dias) ? dias : DIAS_POR_DEFECTO,
    tipo: TIPOS.includes(tipo) ? tipo : '',
  };
}

export function useCalendario() {
  const [parametros, setParametros] = useSearchParams();
  const filtros = leerFiltros(parametros);
  const { hotelId, desde, dias, tipo } = filtros;

  const [listaDeHoteles, setListaDeHoteles] = useState({ hoteles: [], cargando: true });
  const [estado, setEstado] = useState({ datos: null, cargando: false, error: null });
  const [version, setVersion] = useState(0);

  const cambiar = (cambios) => {
    const siguientes = { ...filtros, ...cambios };
    setParametros(quitarVacios({ ...siguientes, dias: String(siguientes.dias) }), { replace: true });
  };

  useEffect(() => {
    let vigente = true;
    hoteles
      .listar({ limit: 100 })
      .then(({ data }) => vigente && setListaDeHoteles({ hoteles: data, cargando: false }))
      .catch(() => vigente && setListaDeHoteles({ hoteles: [], cargando: false }));
    return () => {
      vigente = false;
    };
  }, []);

  // Sin hotel en la URL se elige el primero activo y la URL queda completa.
  useEffect(() => {
    if (hotelId || listaDeHoteles.cargando) return;
    const primero = listaDeHoteles.hoteles.find((hotel) => hotel.activo);
    if (primero) cambiar({ hotelId: primero._id });
  }, [hotelId, listaDeHoteles]);

  useEffect(() => {
    if (!hotelId) return undefined;
    let vigente = true;
    setEstado((anterior) => ({ ...anterior, cargando: true, error: null }));

    calendario
      .obtener(quitarVacios({ hotelId, desde, dias, tipo }))
      .then((datos) => vigente && setEstado({ datos, cargando: false, error: null }))
      .catch((error) => vigente && setEstado({ datos: null, cargando: false, error: describirError(error) }));

    return () => {
      vigente = false;
    };
  }, [hotelId, desde, dias, tipo, version]);

  const opcionesDeHoteles = listaDeHoteles.hoteles.map((hotel) => ({
    valor: hotel._id,
    etiqueta: `${hotel.nombre} · ${hotel.direccion.ciudad}${hotel.activo ? '' : ' (inactivo)'}`,
  }));

  return {
    filtros,
    hasta: sumarDiasATexto(desde, dias - 1),
    opcionesDeHoteles,
    hayHoteles: listaDeHoteles.hoteles.length > 0,
    cambiar,
    mover: (sentido) => cambiar({ desde: sumarDiasATexto(desde, sentido * dias) }),
    irAHoy: () => cambiar({ desde: lunesDeLaSemana(hoyEnBogota()) }),
    recargar: () => setVersion((n) => n + 1),
    ...estado,
    cargando: listaDeHoteles.cargando || estado.cargando,
  };
}
