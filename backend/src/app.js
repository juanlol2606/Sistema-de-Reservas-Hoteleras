import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import rutas from './routes/index.js';
import { rutaNoEncontrada, manejarErrores } from './middlewares/errorHandler.js';

const app = express();

app.use(cors({ origin: config.origenesPermitidos }));
app.use(express.json());

app.use('/api', rutas);

app.use(rutaNoEncontrada);
app.use(manejarErrores);

export default app;
