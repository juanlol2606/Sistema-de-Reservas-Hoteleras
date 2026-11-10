import { useState } from 'react';
import { IconoCama, IconoImagen } from './Iconos.jsx';

// Marco de una foto. Sin `imagen` (o si la imagen no carga) muestra el placeholder rayado.
// `children` son las etiquetas que se montan encima (estado, categoría, contador…).
export default function MarcoFoto({ imagen, alt = '', relacion = '16 / 10', icono = 'imagen', etiqueta, compacto = false, inactivo = false, className = '', children }) {
  const [fallida, setFallida] = useState(null);
  const Icono = icono === 'cama' ? IconoCama : IconoImagen;
  const conImagen = Boolean(imagen) && fallida !== imagen;

  return (
    <div
      className={`marco-foto${compacto ? ' marco-foto-compacto' : ''}${inactivo ? ' marco-foto-inactivo' : ''} ${className}`.trim()}
      style={{ '--relacion': relacion }}
    >
      {conImagen ? (
        <img className="marco-foto-imagen" src={imagen} alt={alt} loading="lazy" draggable={false} onError={() => setFallida(imagen)} />
      ) : (
        <>
          {!compacto && <Icono width={28} height={28} strokeWidth={1.5} />}
          {etiqueta && <span className="marco-foto-etiqueta">{etiqueta}</span>}
        </>
      )}
      {children}
    </div>
  );
}
