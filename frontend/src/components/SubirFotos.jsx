import { useState } from 'react';
import { MAX_FOTOS, TAMANO_MAXIMO_MB, urlDeFoto } from '../utils/imagenes.js';
import { IconoCerrar, IconoFlecha, IconoSubir } from './Iconos.jsx';
import MarcoFoto from './MarcoFoto.jsx';

const TIPOS_ACEPTADOS = 'image/jpeg,image/png,image/webp';

// Zona "Subir fotos": varias a la vez, vista previa, quitar y reordenar (arrastrando o con las flechas).
// La primera foto es la portada. `fotos` viene de useFotos.
export default function SubirFotos({ fotos, etiquetaPortada, icono }) {
  const [arrastrada, setArrastrada] = useState(null);
  const { items } = fotos;

  const alElegir = (evento) => {
    fotos.agregar([...evento.target.files]);
    evento.target.value = '';
  };

  return (
    <div className="subir-fotos campo-completo">
      <div className="fotos-rejilla">
        {items.length === 0 && (
          <div className="foto-item foto-portada">
            <MarcoFoto relacion="16 / 9" icono={icono} etiqueta={etiquetaPortada}>
              <span className="foto-insignia">Portada</span>
            </MarcoFoto>
          </div>
        )}

        {items.map((item, indice) => (
          <div
            key={item.id}
            className={`foto-item${indice === 0 ? ' foto-portada' : ''}${arrastrada === indice ? ' foto-arrastrada' : ''}`}
            draggable
            onDragStart={() => setArrastrada(indice)}
            onDragOver={(evento) => evento.preventDefault()}
            onDrop={(evento) => {
              evento.preventDefault();
              fotos.mover(arrastrada, indice);
              setArrastrada(null);
            }}
            onDragEnd={() => setArrastrada(null)}
          >
            <MarcoFoto
              relacion={indice === 0 ? '16 / 9' : '1 / 1'}
              imagen={item.tipo === 'nueva' ? item.vista : urlDeFoto(item.url, indice === 0 ? 'portadaFormulario' : 'miniaturaFormulario')}
              alt={`Foto ${indice + 1}${indice === 0 ? ' (portada)' : ''}`}
            >
              {indice === 0 && <span className="foto-insignia">Portada</span>}
            </MarcoFoto>
            <div className="foto-controles">
              <button type="button" aria-label={`Mover la foto ${indice + 1} antes`} disabled={indice === 0} onClick={() => fotos.mover(indice, indice - 1)}>
                <IconoFlecha direccion="izquierda" width={14} height={14} />
              </button>
              <button type="button" aria-label={`Mover la foto ${indice + 1} después`} disabled={indice === items.length - 1} onClick={() => fotos.mover(indice, indice + 1)}>
                <IconoFlecha width={14} height={14} />
              </button>
              <button type="button" className="foto-quitar" aria-label={`Quitar la foto ${indice + 1}`} onClick={() => fotos.quitar(item.id)}>
                <IconoCerrar width={14} height={14} />
              </button>
            </div>
          </div>
        ))}

        {!fotos.llena && (
          <label className="foto-subir">
            <IconoSubir width={22} height={22} strokeWidth={1.6} />
            Subir fotos
            <input type="file" accept={TIPOS_ACEPTADOS} multiple className="visualmente-oculto" onChange={alElegir} />
          </label>
        )}
      </div>

      <p className="campo-ayuda">
        JPG, PNG o WEBP, hasta {TAMANO_MAXIMO_MB} MB cada una. Arrastra para cambiar el orden; la primera es la portada.
        {fotos.llena && ` Llegaste al máximo de ${MAX_FOTOS} fotos.`}
      </p>
      {fotos.errores.length > 0 && (
        <ul className="campo-error lista-errores" role="alert">
          {fotos.errores.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
