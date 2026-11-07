import { useFormulario } from '../hooks/useFormulario.js';
import { OPCIONES_METODO_PAGO } from '../utils/catalogos.js';
import { formatearPesos } from '../utils/formato.js';
import { conErrores, entero, requerido } from '../utils/validaciones.js';
import Campo from './Campo.jsx';
import Formulario from './Formulario.jsx';

// El monto sugerido es el saldo pendiente; el padre lo remonta (key) cada vez que el saldo cambia.
export default function FormularioPago({ saldo, alRegistrar }) {
  const formulario = useFormulario({
    valores: { monto: String(saldo), metodo: 'tarjeta' },
    validar: (v) => {
      const errores = { monto: entero(v.monto, 1, saldo), metodo: requerido(v.metodo) };
      if (errores.monto?.startsWith('Máximo')) errores.monto = `No puede superar el saldo (${formatearPesos(saldo)})`;
      return conErrores(errores);
    },
    alEnviar: (v) => alRegistrar({ monto: Number(v.monto), metodo: v.metodo }),
  });

  return (
    <Formulario formulario={formulario} textoEnviar="Registrar pago">
      <Campo etiqueta="Monto (COP)" tipo="number" min="1" max={saldo} {...formulario.campo('monto')} />
      <Campo etiqueta="Método de pago" opciones={OPCIONES_METODO_PAGO} {...formulario.campo('metodo')} />
    </Formulario>
  );
}
