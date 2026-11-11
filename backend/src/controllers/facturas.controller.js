import * as facturas from '../services/facturas.service.js';

export async function descargar(req, res) {
  const { numero, pdf } = await facturas.generarFactura(req.validado.params.id);
  res
    .type('application/pdf')
    .set('Content-Disposition', `attachment; filename="${numero}.pdf"`)
    .send(pdf);
}
