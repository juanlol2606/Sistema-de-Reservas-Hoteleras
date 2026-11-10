import * as imagenes from '../services/imagenes.service.js';

export function crearControlador(recurso) {
  return {
    async subir(req, res) {
      res.status(201).json(await imagenes.agregarImagenes(recurso, req.validado.params.id, req.files));
    },

    async reordenar(req, res) {
      res.json(await imagenes.reordenarImagenes(recurso, req.validado.params.id, req.validado.body.orden));
    },

    async eliminar(req, res) {
      const { id, publicId } = req.validado.params;
      res.json(await imagenes.eliminarImagen(recurso, id, publicId));
    },
  };
}
