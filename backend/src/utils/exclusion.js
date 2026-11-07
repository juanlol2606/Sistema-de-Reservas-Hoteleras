const colas = new Map();

// Ejecuta de una en una las tareas que comparten clave (dentro de este proceso), en orden de llegada.
export async function enExclusion(clave, tarea) {
  const anterior = colas.get(clave) ?? Promise.resolve();
  const actual = anterior.then(tarea);
  const cola = actual.catch(() => {});
  colas.set(clave, cola);

  try {
    return await actual;
  } finally {
    if (colas.get(clave) === cola) colas.delete(clave);
  }
}
