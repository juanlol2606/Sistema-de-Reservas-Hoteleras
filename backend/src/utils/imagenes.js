const FIRMA_PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const esJpg = (datos) => datos[0] === 0xff && datos[1] === 0xd8 && datos[2] === 0xff;
const esPng = (datos) => datos.subarray(0, 8).equals(FIRMA_PNG);
const esWebp = (datos) => datos.toString('ascii', 0, 4) === 'RIFF' && datos.toString('ascii', 8, 12) === 'WEBP';

// Se mira el contenido y no el tipo MIME declarado, porque el cliente puede mentir.
export const esImagenPermitida = (datos) => esJpg(datos) || esPng(datos) || esWebp(datos);
