import { useState } from 'react';
import { describirError } from '../api/errores.js';

const obtenerRuta = (objeto, ruta) => ruta.split('.').reduce((actual, clave) => actual?.[clave], objeto);

function asignarRuta(objeto, ruta, valor) {
  const [clave, ...resto] = ruta.split('.');
  return { ...objeto, [clave]: resto.length ? asignarRuta(objeto[clave] ?? {}, resto.join('.'), valor) : valor };
}

// Estado de un formulario: valores (admite rutas como "direccion.ciudad"), validación local y errores de la API.
export function useFormulario({ valores: iniciales, validar, alEnviar }) {
  const [valores, setValores] = useState(iniciales);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (nombre, valor) => {
    setValores((actuales) => asignarRuta(actuales, nombre, valor));
    setErrores((actuales) => ({ ...actuales, [nombre]: undefined }));
  };

  const campo = (nombre) => ({
    nombre,
    valor: obtenerRuta(valores, nombre) ?? '',
    error: errores[nombre],
    alCambiar: (valor) => cambiar(nombre, valor),
  });

  const enviar = async (evento) => {
    evento?.preventDefault();
    const problemas = validar(valores);
    setErrores(problemas);
    setErrorGeneral(null);
    if (Object.keys(problemas).length) return;

    setEnviando(true);
    try {
      await alEnviar(valores);
    } catch (error) {
      const descripcion = describirError(error);
      setErrores(descripcion.campos);
      setErrorGeneral(descripcion);
    } finally {
      setEnviando(false);
    }
  };

  return { valores, errores, errorGeneral, enviando, campo, cambiar, enviar };
}
