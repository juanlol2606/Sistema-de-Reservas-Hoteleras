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

export const hoteles = crearRecurso('/hoteles');
export const huespedes = crearRecurso('/huespedes');

export const habitaciones = {
  ...crearRecurso('/habitaciones'),
  disponibles: (params) => cliente.get('/habitaciones/disponibles', { params }).then(datos),
};

export const reservas = {
  ...crearRecurso('/reservas'),
  cambiarEstado: (id, estado) => cliente.patch(`/reservas/${id}/estado`, { estado }).then(datos),
  registrarPago: (id, pago) => cliente.post(`/reservas/${id}/pagos`, pago).then(datos),
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
