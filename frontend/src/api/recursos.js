import cliente from './cliente.js';

const datos = (respuesta) => respuesta.data;

const crearRecurso = (ruta) => ({
  listar: (params) => cliente.get(ruta, { params }).then(datos),
  obtener: (id) => cliente.get(`${ruta}/${id}`).then(datos),
  crear: (cuerpo) => cliente.post(ruta, cuerpo).then(datos),
  reemplazar: (id, cuerpo) => cliente.put(`${ruta}/${id}`, cuerpo).then(datos),
  modificar: (id, cuerpo) => cliente.patch(`${ruta}/${id}`, cuerpo).then(datos),
  eliminar: (id) => cliente.delete(`${ruta}/${id}`),
});

// Fotos de un hotel o una habitación. Devuelven el registro completo, con su arreglo `imagenes`.
const crearImagenes = (ruta) => ({
  subir: (id, archivos) => {
    const formulario = new FormData();
    archivos.forEach((archivo) => formulario.append('imagenes', archivo));
    return cliente.post(`${ruta}/${id}/imagenes`, formulario).then(datos);
  },
  ordenar: (id, orden) => cliente.put(`${ruta}/${id}/imagenes/orden`, { orden }).then(datos),
  eliminar: (id, publicId) => cliente.delete(`${ruta}/${id}/imagenes/${publicId}`).then(datos),
});

export const hoteles = { ...crearRecurso('/hoteles'), imagenes: crearImagenes('/hoteles') };
export const huespedes = crearRecurso('/huespedes');

export const habitaciones = {
  ...crearRecurso('/habitaciones'),
  imagenes: crearImagenes('/habitaciones'),
  disponibles: (params) => cliente.get('/habitaciones/disponibles', { params }).then(datos),
};

const nombreDeArchivo = (contentDisposition, respaldo) => /filename="?([^";]+)"?/.exec(contentDisposition ?? '')?.[1] ?? respaldo;

// Pide el PDF de la factura (la API lo emite si es la primera vez). Va por Axios porque la ruta exige el token.
async function pedirFactura(id) {
  try {
    const respuesta = await cliente.get(`/reservas/${id}/factura`, { responseType: 'blob' });
    return { archivo: respuesta.data, nombre: nombreDeArchivo(respuesta.headers['content-disposition'], `factura-${id}.pdf`) };
  } catch (error) {
    // Con responseType 'blob' hasta el cuerpo de un error llega como blob: se convierte a JSON para que describirError lo lea.
    if (error.response?.data instanceof Blob) {
      error.response.data = await error.response.data.text().then(JSON.parse, () => null);
    }
    throw error;
  }
}

export const reservas = {
  ...crearRecurso('/reservas'),
  cambiarEstado: (id, estado) => cliente.patch(`/reservas/${id}/estado`, { estado }).then(datos),
  registrarPago: (id, pago) => cliente.post(`/reservas/${id}/pagos`, pago).then(datos),
  factura: pedirFactura,
};

export const calendario = {
  obtener: (params) => cliente.get('/calendario', { params }).then(datos),
};

export const resenas = {
  listar: (params) => cliente.get('/resenas', { params }).then(datos),
  crear: (cuerpo) => cliente.post('/resenas', cuerpo).then(datos),
  eliminar: (id) => cliente.delete(`/resenas/${id}`),
};

export const reportes = {
  obtener: (nombre, params) => cliente.get(`/reportes/${nombre}`, { params }).then(datos),
};

export const autenticacion = {
  iniciarSesion: (credenciales) => cliente.post('/auth/login', credenciales).then(datos),
};
