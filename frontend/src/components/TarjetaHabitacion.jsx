import { ETIQUETAS_ESTADO_HABITACION, ETIQUETAS_TIPO_HABITACION } from '../utils/catalogos.js';
import { formatearPesos } from '../utils/formato.js';
import { urlDeFoto } from '../utils/imagenes.js';
import AccionesFila from './AccionesFila.jsx';
import { IconoPersona } from './Iconos.jsx';
import Insignia from './Insignia.jsx';
import MarcoFoto from './MarcoFoto.jsx';
import Tarjeta from './Tarjeta.jsx';

export default function TarjetaHabitacion({ habitacion, alEditar, alAlternarActivo, alEliminar }) {
  const { numero, tipo, capacidad, precioNoche, estado, activo } = habitacion;
  const portada = habitacion.imagenes?.[0];

  return (
    <Tarjeta como="article" elevable className="tarjeta-habitacion">
      <MarcoFoto
        relacion="4 / 3"
        icono="cama"
        etiqueta="Foto de la habitación"
        inactivo={!activo}
        imagen={portada && urlDeFoto(portada.url, 'tarjetaHabitacion')}
        alt={`Habitación ${numero}`}
      >
        <span className="marco-esquina marco-esquina-izquierda etiqueta-oscura">{ETIQUETAS_TIPO_HABITACION[tipo]}</span>
        <span className="marco-esquina marco-esquina-derecha grupo-insignias">
          <Insignia tono={estado === 'disponible' ? 'exito' : 'aviso'}>{ETIQUETAS_ESTADO_HABITACION[estado]}</Insignia>
          {!activo && <Insignia>Inactiva</Insignia>}
        </span>
      </MarcoFoto>
      <div className="tarjeta-cuerpo">
        <h3>Habitación {numero}</h3>
        <span className="dato-con-icono">
          <IconoPersona width={14} height={14} />
          Hasta {capacidad} {capacidad === 1 ? 'persona' : 'personas'}
        </span>
        <div className="precio-noche">
          <strong>{formatearPesos(precioNoche)}</strong>
          <span>/ noche</span>
        </div>
      </div>
      <div className="tarjeta-pie">
        <AccionesFila activo={activo} alEditar={alEditar} alAlternarActivo={alAlternarActivo} alEliminar={alEliminar} />
      </div>
    </Tarjeta>
  );
}
