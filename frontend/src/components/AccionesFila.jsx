export default function AccionesFila({ activo, alEditar, alAlternarActivo, alEliminar }) {
  return (
    <>
      <button type="button" className="boton boton-pequeno boton-enlace" onClick={alEditar}>
        Editar
      </button>
      <button type="button" className="boton boton-pequeno boton-enlace" onClick={alAlternarActivo}>
        {activo ? 'Desactivar' : 'Activar'}
      </button>
      <button type="button" className="boton boton-pequeno boton-enlace peligro" onClick={alEliminar}>
        Eliminar
      </button>
    </>
  );
}
