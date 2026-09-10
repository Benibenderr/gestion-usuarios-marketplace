import { ValidationError, UniqueConstraintError } from 'sequelize';

/** Ruta inexistente: 404 en formato JSON. */
export function noEncontrado(req, res) {
  res.status(404).json({ error: `La ruta ${req.method} ${req.originalUrl} no existe` });
}

/**
 * Manejador central de errores.
 * Traduce los errores de Sequelize a respuestas HTTP claras para el frontend.
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  if (err instanceof UniqueConstraintError) {
    const detalles = err.errors.map((e) => ({
      campo: e.path,
      mensaje: e.message || `Ya existe un usuario con ese ${e.path}`
    }));
    return res.status(409).json({ error: 'El dato ya está registrado', detalles });
  }

  if (err instanceof ValidationError) {
    const detalles = err.errors.map((e) => ({ campo: e.path, mensaje: e.message }));
    return res.status(400).json({ error: 'Datos inválidos', detalles });
  }

  if (err.status && err.mensaje) {
    return res.status(err.status).json({ error: err.mensaje });
  }

  console.error('[error]', err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}
