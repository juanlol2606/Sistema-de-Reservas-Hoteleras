import { useState } from 'react';
import { Link } from 'react-router-dom';
import { urlDeFoto } from '../utils/imagenes.js';
import AccionesFila from './AccionesFila.jsx';
import { Estrellas } from './Estrellas.jsx';
import { IconoFlecha } from './Iconos.jsx';
import { InsigniaActivo } from './Insignia.jsx';
import MarcoFoto from './MarcoFoto.jsx';
import Tarjeta from './Tarjeta.jsx';

export default function TarjetaHotel({ hotel, alEditar, alAlternarActivo, alEliminar }) {
  const [indice, setIndice] = useState(0);
  const fotos = hotel.imagenes ?? [];
  const actual = Math.min(indice, Math.max(fotos.length - 1, 0));
  const pasar = (paso) => setIndice((actual + paso + fotos.length) % fotos.length);

  return (
    <Tarjeta como="article" elevable className="tarjeta-hotel">
      <MarcoFoto
        relacion="16 / 10"
        etiqueta="Foto del hotel"
        inactivo={!hotel.activo}
        imagen={fotos[actual] && urlDeFoto(fotos[actual].url, 'tarjetaHotel')}
        alt={`Foto ${actual + 1} de ${hotel.nombre}`}
      >
        <span className="marco-esquina marco-esquina-izquierda">
          <InsigniaActivo activo={hotel.activo} />
        </span>
        <Estrellas cantidad={hotel.estrellas} className="estrellas-pildora marco-esquina marco-esquina-derecha" />
        {fotos.length > 1 && (
          <>
            <button type="button" className="carrusel-boton carrusel-anterior" aria-label="Foto anterior" onClick={() => pasar(-1)}>
              <IconoFlecha direccion="izquierda" />
            </button>
            <button type="button" className="carrusel-boton carrusel-siguiente" aria-label="Foto siguiente" onClick={() => pasar(1)}>
              <IconoFlecha />
            </button>
          </>
        )}
        {fotos.length > 0 && (
          <span className="contador-fotos">
            {actual + 1} / {fotos.length} {fotos.length === 1 ? 'foto' : 'fotos'}
          </span>
        )}
      </MarcoFoto>
      <div className="tarjeta-cuerpo">
        <div className="tarjeta-hotel-fila">
          <div className="tarjeta-hotel-datos">
            <span className="etiqueta-ciudad">{hotel.direccion.ciudad}</span>
            <h3>{hotel.nombre}</h3>
            <span className="texto-suave">{hotel.direccion.calle}</span>
          </div>
          <div className="calificacion">
            {hotel.calificacionPromedio ? (
              <>
                <strong>{hotel.calificacionPromedio.toFixed(2)}</strong>
                <span>de 5</span>
              </>
            ) : (
              <span>Sin reseñas</span>
            )}
          </div>
        </div>
        <Link to="/habitaciones" className="enlace-fuerte">
          Ver habitaciones →
        </Link>
      </div>
      <div className="tarjeta-pie">
        <AccionesFila activo={hotel.activo} alEditar={alEditar} alAlternarActivo={alAlternarActivo} alEliminar={alEliminar} />
      </div>
    </Tarjeta>
  );
}
