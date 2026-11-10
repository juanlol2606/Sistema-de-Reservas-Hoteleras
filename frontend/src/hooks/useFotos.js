import { useEffect, useRef, useState } from 'react';
import { MAX_FOTOS, validarFoto } from '../utils/imagenes.js';

let consecutivo = 0;

const desdeGuardada = ({ url, publicId }) => ({ id: publicId, tipo: 'guardada', url, publicId });

// Estado de las fotos de un formulario: las ya guardadas y las nuevas, en el orden que elige el usuario (la primera es la portada).
// Nada se envía a la API hasta llamar a `sincronizar`, así que cancelar el formulario no cambia nada.
// `servicio` es `hoteles.imagenes` o `habitaciones.imagenes`.
export function useFotos(guardadas, servicio) {
  const [items, setItems] = useState(() => guardadas.map(desdeGuardada));
  const [errores, setErrores] = useState([]);
  const itemsRef = useRef(items);
  const porBorrarRef = useRef([]);
  const ordenEnServidorRef = useRef(guardadas.map((foto) => foto.publicId));

  const actualizar = (siguientes) => {
    itemsRef.current = siguientes;
    setItems(siguientes);
  };

  useEffect(
    () => () =>
      itemsRef.current.forEach((item) => {
        if (item.vista) URL.revokeObjectURL(item.vista);
      }),
    [],
  );

  const agregar = (archivos) => {
    const nuevas = [];
    const rechazos = [];
    for (const archivo of archivos) {
      const motivo = validarFoto(archivo);
      if (motivo) rechazos.push(motivo);
      else if (itemsRef.current.length + nuevas.length >= MAX_FOTOS) rechazos.push(`Máximo ${MAX_FOTOS} fotos: "${archivo.name}" no se agregó`);
      else nuevas.push({ id: `nueva-${consecutivo++}`, tipo: 'nueva', archivo, vista: URL.createObjectURL(archivo) });
    }
    setErrores(rechazos);
    if (nuevas.length) actualizar([...itemsRef.current, ...nuevas]);
  };

  const quitar = (id) => {
    const item = itemsRef.current.find((candidato) => candidato.id === id);
    if (item.tipo === 'guardada') porBorrarRef.current = [...porBorrarRef.current, item.publicId];
    else URL.revokeObjectURL(item.vista);
    setErrores([]);
    actualizar(itemsRef.current.filter((candidato) => candidato.id !== id));
  };

  const mover = (desde, hasta) => {
    if (desde === hasta || desde == null || hasta == null) return;
    const siguientes = [...itemsRef.current];
    const [movida] = siguientes.splice(desde, 1);
    siguientes.splice(hasta, 0, movida);
    actualizar(siguientes);
  };

  // Aplica los cambios al registro ya guardado: borra las quitadas, sube las nuevas y fija el orden.
  // Si algo falla, lo que ya se hizo queda registrado y un nuevo intento continúa desde ahí.
  const sincronizar = async (idRegistro) => {
    for (const publicId of [...porBorrarRef.current]) {
      await servicio.eliminar(idRegistro, publicId);
      porBorrarRef.current = porBorrarRef.current.filter((pendiente) => pendiente !== publicId);
      ordenEnServidorRef.current = ordenEnServidorRef.current.filter((enServidor) => enServidor !== publicId);
    }

    const nuevas = itemsRef.current.filter((item) => item.tipo === 'nueva');
    if (nuevas.length) {
      const registro = await servicio.subir(idRegistro, nuevas.map((item) => item.archivo));
      const subidas = registro.imagenes.slice(-nuevas.length);
      ordenEnServidorRef.current = registro.imagenes.map((foto) => foto.publicId);
      actualizar(
        itemsRef.current.map((item) => {
          const posicion = nuevas.findIndex((nueva) => nueva.id === item.id);
          if (posicion === -1) return item;
          URL.revokeObjectURL(item.vista);
          return { ...desdeGuardada(subidas[posicion]), id: item.id };
        }),
      );
    }

    const orden = itemsRef.current.map((item) => item.publicId);
    if (orden.length > 1 && orden.join() !== ordenEnServidorRef.current.join()) {
      await servicio.ordenar(idRegistro, orden);
      ordenEnServidorRef.current = orden;
    }
  };

  return { items, errores, agregar, quitar, mover, sincronizar, llena: items.length >= MAX_FOTOS };
}
