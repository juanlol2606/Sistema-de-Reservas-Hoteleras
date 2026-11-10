// Cabecera oscura de cada pantalla (etiqueta, título, descripción, cifras y acciones) y el contenido que se monta sobre ella.
// `cifras`: [{ valor, etiqueta, resaltada }]; un valor `null` se muestra como "—" mientras carga.
export default function Pagina({ etiqueta, titulo, descripcion, cifras = [], acciones, superior, inferior, compacta = false, children }) {
  return (
    <>
      <section className={`hero${compacta ? ' hero-compacto' : ''}`}>
        <div className="hero-interior">
          {superior}
          <div className="hero-fila">
            <div className="hero-texto">
              {etiqueta && <span className="etiqueta-dorada">{etiqueta}</span>}
              <h1 className="hero-titulo">{titulo}</h1>
              {descripcion && <p className="hero-descripcion">{descripcion}</p>}
            </div>
            {(cifras.length > 0 || acciones) && (
              <div className="hero-lado">
                {cifras.map(({ valor, etiqueta: textoCifra, resaltada }) => (
                  <div key={textoCifra} className="cifra-hero">
                    <span className={`cifra-hero-valor${resaltada ? ' cifra-hero-resaltada' : ''}`}>{valor ?? '—'}</span>
                    <span className="cifra-hero-etiqueta">{textoCifra}</span>
                  </div>
                ))}
                {acciones}
              </div>
            )}
          </div>
          {inferior}
        </div>
      </section>
      <main className={`principal${compacta ? ' principal-compacto' : ''}`}>{children}</main>
    </>
  );
}
