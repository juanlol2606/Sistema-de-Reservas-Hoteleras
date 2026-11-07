import { solicitudInvalida } from '../utils/errores.js';

const quitarVacios = (consulta) => Object.fromEntries(Object.entries(consulta).filter(([, valor]) => valor !== ''));

// Valida params, query y body con esquemas zod. Los datos limpios quedan en req.validado.
export const validar = (esquemas) => (req, res, next) => {
  const validado = {};
  const problemas = [];

  for (const [parte, esquema] of Object.entries(esquemas)) {
    const entrada = parte === 'query' ? quitarVacios(req.query) : req[parte];
    const resultado = esquema.safeParse(entrada);

    if (resultado.success) {
      validado[parte] = resultado.data;
    } else {
      for (const problema of resultado.error.issues) {
        problemas.push({ campo: problema.path.join('.') || parte, mensaje: problema.message });
      }
    }
  }

  if (problemas.length) throw solicitudInvalida('Datos inválidos', problemas);
  req.validado = validado;
  next();
};
