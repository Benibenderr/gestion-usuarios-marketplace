import { Router } from 'express';
import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/usuarios.controller.js';
import { validarUsuario } from '../middlewares/validarUsuario.js';

export const usuariosRouter = Router();

usuariosRouter.get('/', listarUsuarios);
usuariosRouter.get('/:id', obtenerUsuario);
usuariosRouter.post('/', validarUsuario({ modo: 'crear' }), crearUsuario);
usuariosRouter.put('/:id', validarUsuario({ modo: 'actualizar' }), actualizarUsuario);
usuariosRouter.delete('/:id', eliminarUsuario);
