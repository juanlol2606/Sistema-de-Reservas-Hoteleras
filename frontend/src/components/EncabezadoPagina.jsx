export default function EncabezadoPagina({ titulo, descripcion, children }) {
  return (
    <div className="encabezado-pagina">
      <div>
        <h1>{titulo}</h1>
        {descripcion && <p className="descripcion">{descripcion}</p>}
      </div>
      {children && <div className="encabezado-acciones">{children}</div>}
    </div>
  );
}
