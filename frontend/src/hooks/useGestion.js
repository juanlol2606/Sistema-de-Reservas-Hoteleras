import { useState } from 'react';
import { describirError } from '../api/errores.js';
import { useAvisos } from '../context/AvisosContext.jsx';

// Crear, editar, eliminar y activar/desactivar registros de un recurso CRUD, con sus avisos.
// `mensajes`: { guardado, eliminado, activado, desactivado }.
export function useGestion({ api, mensajes, recargar }) {
  const { mostrarAviso } = useAvisos();
  const [edicion, setEdicion] = useState(null);
  const [aEliminar, setAEliminar] = useState(null);
  const [errorAccion, setErrorAccion] = useState(null);

  const terminar = (aviso) => {
    mostrarAviso(aviso);
    recargar();
  };

  const guardar = async (datos) => {
    if (edicion === 'nuevo') await api.crear(datos);
    else await api.reemplazar(edicion._id, datos);
    setEdicion(null);
    terminar(mensajes.guardado);
  };

  const eliminar = async () => {
    await api.eliminar(aEliminar._id);
    setAEliminar(null);
    terminar(mensajes.eliminado);
  };

  const desactivarEnLugarDeEliminar = async () => {
    await api.modificar(aEliminar._id, { activo: false });
    setAEliminar(null);
    terminar(mensajes.desactivado);
  };

  const alternarActivo = async (registro) => {
    setErrorAccion(null);
    try {
      await api.modificar(registro._id, { activo: !registro.activo });
      terminar(registro.activo ? mensajes.desactivado : mensajes.activado);
    } catch (error) {
      setErrorAccion(describirError(error));
    }
  };

  return {
    edicion,
    aEliminar,
    errorAccion,
    abrirNuevo: () => setEdicion('nuevo'),
    abrirEdicion: setEdicion,
    cerrarEdicion: () => setEdicion(null),
    pedirEliminar: setAEliminar,
    cancelarEliminar: () => setAEliminar(null),
    guardar,
    eliminar,
    desactivarEnLugarDeEliminar,
    alternarActivo,
  };
}
