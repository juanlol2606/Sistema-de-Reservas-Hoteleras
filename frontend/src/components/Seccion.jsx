// Grupo de campos con título dentro de un formulario (por ejemplo "Información" o "Contacto").
export default function Seccion({ titulo, children }) {
  return (
    <fieldset className="seccion">
      <legend>{titulo}</legend>
      <div className="rejilla-formulario">{children}</div>
    </fieldset>
  );
}
