import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { usuariosRouter } from './routes/usuarios.routes.js';
import { errorHandler, noEncontrado } from './middlewares/errorHandler.js';

export const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('dev'));

// Endpoint simple para verificar que la API está viva
app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', fecha: new Date().toISOString() });
});

app.use('/api/usuarios', usuariosRouter);

app.use(noEncontrado);
app.use(errorHandler);
