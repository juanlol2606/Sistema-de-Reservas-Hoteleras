// Generador pseudoaleatorio con semilla (mulberry32): el seed produce siempre los mismos datos.
export function crearAleatorio(semilla) {
  let estado = semilla;

  const numero = () => {
    estado = (estado + 0x6d2b79f5) | 0;
    let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const entero = (minimo, maximo) => Math.floor(numero() * (maximo - minimo + 1)) + minimo;
  const decimal = (minimo, maximo) => minimo + numero() * (maximo - minimo);
  const probabilidad = (p) => numero() < p;
  const elegir = (lista) => lista[Math.floor(numero() * lista.length)];

  // Favorece los primeros elementos: simula clientes que repiten y otros que casi no reservan.
  const elegirSesgado = (lista) => lista[Math.floor(numero() ** 1.7 * lista.length)];

  const elegirPonderado = (opciones) => {
    const pesoTotal = opciones.reduce((suma, [, peso]) => suma + peso, 0);
    let punto = numero() * pesoTotal;
    for (const [valor, peso] of opciones) {
      punto -= peso;
      if (punto < 0) return valor;
    }
    return opciones.at(-1)[0];
  };

  return { numero, entero, decimal, probabilidad, elegir, elegirSesgado, elegirPonderado };
}
