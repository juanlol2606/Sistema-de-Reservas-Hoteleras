export function Estrellas({ cantidad, maximo = 5 }) {
  return (
    <span className="estrellas" role="img" aria-label={`${cantidad} de ${maximo} estrellas`}>
      {'★'.repeat(cantidad)}
      <span className="estrellas-vacias">{'★'.repeat(maximo - cantidad)}</span>
    </span>
  );
}

export function SelectorEstrellas({ valor, alCambiar }) {
  return (
    <div className="selector-estrellas" role="radiogroup" aria-label="Puntuación">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={valor === n}
          aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
          className={n <= valor ? 'activa' : ''}
          onClick={() => alCambiar(n)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
