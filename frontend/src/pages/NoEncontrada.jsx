import Boton from '../components/Boton.jsx';
import Pagina from '../components/Pagina.jsx';

export default function NoEncontrada() {
  return (
    <Pagina titulo="Página no encontrada" descripcion="La dirección que buscas no existe." compacta>
      <Boton a="/" variante="dorado">
        Volver al inicio
      </Boton>
    </Pagina>
  );
}
