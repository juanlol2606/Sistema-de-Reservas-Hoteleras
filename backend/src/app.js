import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import rutas from './routes/index.js';
import { rutaNoEncontrada, manejarErrores } from './middlewares/errorHandler.js';

const app = express();

// Content-Disposition lleva el nombre del PDF de la factura; sin exponerlo, el navegador no deja leerlo desde otro origen.
app.use(cors({ origin: config.origenesPermitidos, exposedHeaders: ['Content-Disposition'] }));
app.use(express.json());

app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
