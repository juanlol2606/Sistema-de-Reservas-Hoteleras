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

  const terminar = (aviso, tipo) => {
    mostrarAviso(aviso, tipo);
    recargar();
  };

  // `despues(registro)` es opcional: se ejecuta con el registro ya guardado (por ejemplo, para subir sus fotos).
  // Si falla, el formulario sigue abierto y ya apunta al registro guardado, para que reintentar no lo duplique.
  const guardar = async (datos, despues) => {
    const registro = edicion === 'nuevo' ? await api.crear(datos) : await api.reemplazar(edicion._id, datos);
    if (despues) {
      try {
        await despues(registro);
      } catch (error) {
        setEdicion(registro);
        terminar(`${mensajes.guardado}, pero no se pudieron subir todas las fotos`, 'error');
        throw error;
      }
    }
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
