import Boton from './Boton.jsx';

export default function AccionesFila({ activo, alEditar, alAlternarActivo, alEliminar }) {
  return (
    <div className="acciones-registro">
      <Boton variante="accion" onClick={alEditar}>
        Editar
      </Boton>
      <Boton variante={activo ? 'accion-dorado' : 'accion-exito'} onClick={alAlternarActivo}>
        {activo ? 'Desactivar' : 'Activar'}
      </Boton>
      <Boton variante="accion-peligro" onClick={alEliminar}>
        Eliminar
      </Boton>
    </div>
  );
}
