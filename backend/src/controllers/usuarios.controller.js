import { Op } from 'sequelize';
import { Usuario } from '../models/Usuario.js';

/** Busca un usuario por id o devuelve null. */
async function buscarPorId(id) {
  const numero = Number(id);
  if (!Number.isInteger(numero) || numero <= 0) return null;
  return Usuario.findByPk(numero);
}

/**
 * GET /api/usuarios
 * Devuelve el listado completo. Acepta ?q= para filtrar por texto.
 */
export async function listarUsuarios(req, res, next) {
  try {
    const { q } = req.query;

    const where = q
      ? {
          [Op.or]: [
            { nombre: { [Op.like]: `%${q}%` } },
            { apellido: { [Op.like]: `%${q}%` } },
            { documento: { [Op.like]: `%${q}%` } },
            { legajo: { [Op.like]: `%${q}%` } },
            { email: { [Op.like]: `%${q}%` } }
          ]
        }
      : undefined;

    const usuarios = await Usuario.findAll({ where, order: [['apellido', 'ASC'], ['nombre', 'ASC']] });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
}

/** GET /api/usuarios/:id */
export async function obtenerUsuario(req, res, next) {
  try {
    const usuario = await buscarPorId(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

/** POST /api/usuarios */
export async function crearUsuario(req, res, next) {
  try {
    const usuario = await Usuario.create(req.datosUsuario);
    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
}

/** PUT /api/usuarios/:id */
export async function actualizarUsuario(req, res, next) {
  try {
    const usuario = await buscarPorId(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.update(req.datosUsuario);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/usuarios/:id */
export async function eliminarUsuario(req, res, next) {
  try {
    const usuario = await buscarPorId(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuario.destroy();
    res.json({ mensaje: 'Usuario eliminado', id: usuario.id });
  } catch (error) {
    next(error);
  }
}
