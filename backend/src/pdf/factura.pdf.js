import { readFileSync } from 'node:fs';
import PDFDocument from 'pdfkit';
import {
  describirHuespedes,
  describirPeriodo,
  etiquetaEstado,
  etiquetaMetodo,
  etiquetaTipo,
  formatearDiaCorto,
  formatearDinero,
} from '../utils/formatoFactura.js';

// El diseño (docs/formato-factura.html) está en píxeles CSS de una hoja A4 a 96 ppp; el PDF trabaja en puntos (0,75 pt por px).
const PT_POR_PX = 0.75;
const ANCHO = 793.7;
const ALTO = 1122.5;
const MARGEN_X = 40;
const MARGEN_SUPERIOR = 40;
const MARGEN_INFERIOR = 40;
const ANCHO_CONTENIDO = ANCHO - 2 * MARGEN_X;
const SEPARACION = 28;
const INTERLINEA = 1.5;

const COLOR = {
  tinta: '#1E1A16',
  suave: '#6B6054',
  borde: '#E4DACB',
  oro: '#C9A365',
  negro: '#17140F',
  blanco: '#FFFFFF',
  franja: '#FBF8F2',
  verde: '#2E6B3A',
  verdeClaro: '#E6F2E8',
  grisCabecera: '#B9B0A2',
  grisTitulo: '#D9D2C5',
};

const leerFuente = (archivo) => readFileSync(new URL(`../../assets/fonts/${archivo}`, import.meta.url));
const FUENTES = {
  texto: leerFuente('Inter-Regular.woff'),
  negrita: leerFuente('Inter-SemiBold.woff'),
  titulo: leerFuente('CormorantGaramond-SemiBold.woff'),
  logo: leerFuente('CormorantGaramond-BoldItalic.woff'),
};

const ESTILO = {
  etiqueta: { fuente: 'negrita', tam: 10.5, color: COLOR.suave, espaciado: 0.1 },
  texto: { fuente: 'texto', tam: 13, color: COLOR.tinta },
  suave: { fuente: 'texto', tam: 13, color: COLOR.suave },
  negrita: { fuente: 'negrita', tam: 13, color: COLOR.tinta },
  subtitulo: { fuente: 'titulo', tam: 20, color: COLOR.tinta, alto: 30 },
};

const pt = (px) => px * PT_POR_PX;

// Dibuja con coordenadas en px. Un texto se coloca dentro de una "caja de línea" como en CSS: la altura de línea reparte el espacio sobrante arriba y abajo.
class Lienzo {
  constructor(doc) {
    this.doc = doc;
    this.y = 0;
    Object.entries(FUENTES).forEach(([nombre, datos]) => doc.registerFont(nombre, datos));
  }

  asegurarEspacio(alto) {
    if (this.y + alto <= ALTO - MARGEN_INFERIOR) return;
    this.doc.addPage();
    this.y = MARGEN_SUPERIOR;
  }

  rectangulo(x, y, ancho, alto, { relleno, borde, radio = 0 }) {
    this.doc.roundedRect(pt(x), pt(y), pt(ancho), pt(alto), pt(radio));
    if (relleno && borde) this.doc.lineWidth(pt(1)).fillAndStroke(relleno, borde);
    else this.doc.fill(relleno);
  }

  linea(x, y, ancho, grosor, color) {
    this.doc.rect(pt(x), pt(y), pt(ancho), pt(grosor)).fill(color);
  }

  preparar({ fuente, tam }) {
    this.doc.font(fuente).fontSize(pt(tam));
  }

  medir(cadena, estilo) {
    this.preparar(estilo);
    return this.doc.widthOfString(cadena, { characterSpacing: pt((estilo.espaciado ?? 0) * estilo.tam) }) / PT_POR_PX;
  }

  contarLineas(cadena, estilo, ancho) {
    if (ancho === undefined) return 1;
    this.preparar(estilo);
    const opciones = { width: pt(ancho) };
    return Math.max(1, Math.round(this.doc.heightOfString(cadena, opciones) / this.doc.heightOfString('X', opciones)));
  }

  altoDe(cadena, estilo, ancho) {
    return this.contarLineas(cadena, estilo, ancho) * (estilo.alto ?? estilo.tam * INTERLINEA);
  }

  // Escribe el texto desde `y` (borde superior de la caja de línea) y devuelve el alto que ocupa, en px.
  texto(cadena, x, y, estilo, { ancho, alinear = 'left' } = {}) {
    const { doc } = this;
    const alto = estilo.alto ?? estilo.tam * INTERLINEA;
    this.preparar(estilo);
    const contenido = doc.currentLineHeight();
    doc.fillColor(estilo.color).text(cadena, pt(x), pt(y) + (pt(alto) - contenido) / 2, {
      width: ancho === undefined ? undefined : pt(ancho),
      lineBreak: ancho !== undefined,
      align: alinear,
      lineGap: pt(alto) - doc.currentLineHeight(true),
      characterSpacing: pt((estilo.espaciado ?? 0) * estilo.tam),
    });
    return this.contarLineas(cadena, estilo, ancho) * alto;
  }
}

function dibujarEncabezado(lienzo, numero) {
  const ALTO_ENCABEZADO = 122.5;
  lienzo.rectangulo(0, 0, ANCHO, ALTO_ENCABEZADO, { relleno: COLOR.negro });

  const logo = { fuente: 'logo', tam: 34, alto: 34 };
  const anchoStay = lienzo.medir('Stay', logo);
  lienzo.texto('Stay', MARGEN_X, 38, { ...logo, color: COLOR.oro });
  lienzo.texto('Hub', MARGEN_X + anchoStay, 38, { ...logo, color: COLOR.blanco });
  lienzo.texto('RED DE HOTELES', MARGEN_X, 78, { fuente: 'texto', tam: 11, color: COLOR.grisCabecera, espaciado: 0.12 });

  const derecha = { ancho: ANCHO_CONTENIDO, alinear: 'right' };
  lienzo.texto('Factura de estadía', MARGEN_X, 28, { fuente: 'titulo', tam: 30, alto: 45, color: COLOR.blanco }, derecha);
  lienzo.texto(`N.º ${numero}`, MARGEN_X, 75, { ...ESTILO.texto, color: COLOR.grisTitulo }, derecha);
  lienzo.y = ALTO_ENCABEZADO + 32;
}

function dibujarFranja(lienzo, { factura, reserva }) {
  const ALTO_FRANJA = 74;
  const SEPARACION_COLUMNAS = 16;
  const RELLENO = { x: 21, y: 17 };
  const ancho = (ANCHO_CONTENIDO - 2 * RELLENO.x - 3 * SEPARACION_COLUMNAS) / 4;

  lienzo.rectangulo(MARGEN_X, lienzo.y, ANCHO_CONTENIDO, ALTO_FRANJA, { relleno: COLOR.franja, borde: COLOR.borde, radio: 10 });
  const campos = [
    ['Fecha de emisión', formatearDiaCorto(factura.fechaEmision)],
    ['Reserva', reserva.codigo],
    ['Estado de la reserva', etiquetaEstado(reserva.estado)],
    ['Estado de pago', null],
  ];

  campos.forEach(([etiqueta, valor], i) => {
    const x = MARGEN_X + RELLENO.x + i * (ancho + SEPARACION_COLUMNAS);
    const y = lienzo.y + RELLENO.y;
    lienzo.texto(etiqueta.toUpperCase(), x, y, ESTILO.etiqueta);
    if (valor !== null) {
      lienzo.texto(valor, x, y + 17.75, ESTILO.negrita);
      return;
    }

    const pagada = { fuente: 'negrita', tam: 12, color: COLOR.verde };
    const anchoPildora = lienzo.medir('Pagada', pagada) + 20;
    lienzo.rectangulo(x, y + 17.75, anchoPildora, 22, { relleno: COLOR.verdeClaro, radio: 11 });
    lienzo.texto('Pagada', x + 10, y + 17.75 + 2, { ...pagada, alto: 18 });
  });
  lienzo.y += ALTO_FRANJA + SEPARACION;
}

function bloquePersona(lienzo, x, ancho, { etiqueta, nombre, lineas, contacto }) {
  let y = lienzo.y;
  y += lienzo.texto(etiqueta.toUpperCase(), x, y, ESTILO.etiqueta);
  y += lienzo.texto(nombre, x, y, ESTILO.subtitulo, { ancho }) + 8;
  lineas.forEach((linea) => {
    y += lienzo.texto(linea, x, y, ESTILO.texto, { ancho });
  });
  y += lienzo.texto(contacto, x, y, ESTILO.suave, { ancho });
  return y - lienzo.y;
}

function dibujarPartes(lienzo, { factura }) {
  const { emisor, cliente } = factura;
  const ancho = (ANCHO_CONTENIDO - SEPARACION) / 2;
  lienzo.asegurarEspacio(130);

  const altoEmisor = bloquePersona(lienzo, MARGEN_X, ancho, {
    etiqueta: 'Emitida por',
    nombre: emisor.nombre,
    lineas: [emisor.direccion.calle, `${emisor.direccion.ciudad}, ${emisor.direccion.pais}`],
    contacto: `${emisor.contacto.telefono} · ${emisor.contacto.email}`,
  });
  const altoCliente = bloquePersona(lienzo, MARGEN_X + ancho + SEPARACION, ancho, {
    etiqueta: 'Facturado a',
    nombre: cliente.nombre,
    lineas: [`${cliente.documento.tipo} ${cliente.documento.numero}`, cliente.ciudadOrigen],
    contacto: `${cliente.telefono} · ${cliente.email}`,
  });
  lienzo.y += Math.max(altoEmisor, altoCliente) + SEPARACION;
}

// Cada celda es un texto o una lista de líneas { texto, estilo }; las columnas sin ancho se reparten lo que sobra.
function dibujarTabla(lienzo, columnas, filas) {
  const PADDING_X = 10;
  const fijo = columnas.reduce((suma, columna) => suma + (columna.ancho ?? 0), 0);
  const flexibles = columnas.filter((columna) => columna.ancho === undefined).length;
  let x = MARGEN_X;
  const celdas = columnas.map((columna) => {
    const ancho = columna.ancho ?? (ANCHO_CONTENIDO - fijo) / flexibles;
    const celda = { ...columna, x: x + PADDING_X, ancho: ancho - 2 * PADDING_X };
    x += ancho;
    return celda;
  });
  const alinear = (columna) => (columna.derecha ? 'right' : 'left');

  lienzo.asegurarEspacio(110);
  celdas.forEach((columna) => {
    lienzo.texto(columna.titulo.toUpperCase(), columna.x, lienzo.y + 8, ESTILO.etiqueta, { ancho: columna.ancho, alinear: alinear(columna) });
  });
  lienzo.linea(MARGEN_X, lienzo.y + 8 + 15.75 + 8, ANCHO_CONTENIDO, 1.5, COLOR.tinta);
  lienzo.y += 8 + 15.75 + 8 + 1.5;

  filas.forEach((fila) => {
    const lineasDe = (valor) => (typeof valor === 'string' ? [{ texto: valor, estilo: ESTILO.texto }] : valor);
    const altoFila = Math.max(
      ...celdas.map((columna, i) =>
        lineasDe(fila[i]).reduce((suma, { texto, estilo }) => suma + lienzo.altoDe(texto, estilo, columna.ancho), 0),
      ),
    );
    lienzo.asegurarEspacio(altoFila + 25);
    celdas.forEach((columna, i) => {
      let y = lienzo.y + 12;
      lineasDe(fila[i]).forEach(({ texto, estilo }) => {
        y += lienzo.texto(texto, columna.x, y, estilo, { ancho: columna.ancho, alinear: alinear(columna) });
      });
    });
    lienzo.linea(MARGEN_X, lienzo.y + 12 + altoFila + 12, ANCHO_CONTENIDO, 1, COLOR.borde);
    lienzo.y += 12 + altoFila + 12 + 1;
  });
}

// Totales alineados a la derecha. `destacado` es la fila grande con línea superior; `verde` pinta el valor de saldo.
function dibujarTotales(lienzo, filas) {
  const ANCHO_TOTALES = 300;
  const x = MARGEN_X + ANCHO_CONTENIDO - ANCHO_TOTALES;
  lienzo.y += 12;
  lienzo.asegurarEspacio(60);

  filas.forEach(({ etiqueta, valor, destacado, verde }) => {
    const interior = { ancho: ANCHO_TOTALES - 20 };
    if (destacado) {
      lienzo.linea(x, lienzo.y, ANCHO_TOTALES, 1.5, COLOR.tinta);
      const y = lienzo.y + 1.5 + 10;
      lienzo.texto(etiqueta, x + 10, y, { fuente: 'negrita', tam: 16, color: COLOR.tinta }, interior);
      lienzo.texto(valor, x + 10, y, { fuente: 'titulo', tam: 24, color: COLOR.tinta }, { ...interior, alinear: 'right' });
      lienzo.y += 1.5 + 10 + 36 + 6;
      return;
    }
    const estilo = verde ? { ...ESTILO.negrita, color: COLOR.verde } : ESTILO.texto;
    lienzo.texto(etiqueta, x + 10, lienzo.y + 6, ESTILO.texto, interior);
    lienzo.texto(valor, x + 10, lienzo.y + 6, estilo, { ...interior, alinear: 'right' });
    lienzo.y += 6 + 19.5 + 6;
  });
}

function dibujarSubtitulo(lienzo, titulo) {
  lienzo.asegurarEspacio(110);
  lienzo.y += lienzo.texto(titulo, MARGEN_X, lienzo.y, ESTILO.subtitulo) + 8;
}

function dibujarDetalle(lienzo, { reserva }) {
  const { habitacion } = reserva;
  dibujarSubtitulo(lienzo, 'Detalle de la estadía');
  dibujarTabla(
    lienzo,
    [
      { titulo: 'Concepto' },
      { titulo: 'Noches', ancho: 85, derecha: true },
      { titulo: 'Valor por noche', ancho: 160, derecha: true },
      { titulo: 'Total', ancho: 100, derecha: true },
    ],
    [
      [
        [
          { texto: `Alojamiento · Habitación ${habitacion.numero} (${etiquetaTipo(habitacion.tipo)})`, estilo: ESTILO.negrita },
          {
            texto: `${describirPeriodo(reserva.fechaEntrada, reserva.fechaSalida)} · ${describirHuespedes(reserva.numHuespedes)}`,
            estilo: ESTILO.suave,
          },
        ],
        String(reserva.noches),
        formatearDinero(habitacion.precioNoche),
        formatearDinero(reserva.total),
      ],
    ],
  );
  dibujarTotales(lienzo, [{ etiqueta: 'Total', valor: formatearDinero(reserva.total), destacado: true }]);
  lienzo.y += SEPARACION;
}

function dibujarPagos(lienzo, { reserva }) {
  const totalPagado = reserva.pagos.reduce((suma, pago) => suma + pago.monto, 0);
  dibujarSubtitulo(lienzo, 'Pagos recibidos');
  dibujarTabla(
    lienzo,
    [{ titulo: 'Fecha', ancho: 233 }, { titulo: 'Método' }, { titulo: 'Monto', ancho: 213, derecha: true }],
    reserva.pagos.map((pago) => [formatearDiaCorto(pago.fecha), etiquetaMetodo(pago.metodo), formatearDinero(pago.monto)]),
  );
  dibujarTotales(lienzo, [
    { etiqueta: 'Total pagado', valor: formatearDinero(totalPagado) },
    { etiqueta: 'Saldo pendiente', valor: formatearDinero(reserva.total - totalPagado), verde: true },
  ]);
  lienzo.y += SEPARACION;
}

function dibujarPie(lienzo) {
  const PIE = { fuente: 'texto', tam: 11.5, color: COLOR.suave };
  const agradecimiento = 'Gracias por hospedarse con nosotros.';
  const nota = 'Documento generado por StayHub. No reemplaza la factura electrónica de la DIAN.';
  const cabenJuntas = lienzo.medir(agradecimiento, PIE) + 24 + lienzo.medir(nota, PIE) <= ANCHO_CONTENIDO;

  lienzo.asegurarEspacio(70);
  lienzo.linea(MARGEN_X, lienzo.y, ANCHO_CONTENIDO, 1, COLOR.borde);
  const y = lienzo.y + 1 + 16;
  lienzo.texto(agradecimiento, MARGEN_X, y, PIE, { ancho: ANCHO_CONTENIDO });
  lienzo.texto(nota, MARGEN_X, cabenJuntas ? y : y + PIE.tam * INTERLINEA, PIE, {
    ancho: ANCHO_CONTENIDO,
    alinear: cabenJuntas ? 'right' : 'left',
  });
}

// Devuelve el PDF de la factura. Con `fechaEmision` como fecha de creación, dos impresiones de la misma factura salen idénticas.
export function generarPdfFactura(datos) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 0,
      info: {
        Title: `Factura ${datos.factura.numero}`,
        Author: 'StayHub',
        Creator: 'StayHub',
        Producer: 'StayHub',
        CreationDate: datos.factura.fechaEmision,
      },
    });
    const partes = [];
    doc.on('data', (parte) => partes.push(parte));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);

    const lienzo = new Lienzo(doc);
    dibujarEncabezado(lienzo, datos.factura.numero);
    dibujarFranja(lienzo, datos);
    dibujarPartes(lienzo, datos);
    dibujarDetalle(lienzo, datos);
    dibujarPagos(lienzo, datos);
    dibujarPie(lienzo);
    doc.end();
  });
}
