export default function Tarjeta({ como: Etiqueta = 'section', elevable = false, className = '', ...resto }) {
  return <Etiqueta className={`tarjeta${elevable ? ' tarjeta-elevable' : ''} ${className}`.trim()} {...resto} />;
}
