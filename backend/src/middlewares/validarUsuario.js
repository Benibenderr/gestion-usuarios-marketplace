const CAMPOS_OBLIGATORIOS = ['nombre', 'apellido', 'documento', 'legajo', 'email', 'domicilio'];

// Campos que NO se pueden modificar una vez creado el usuario.
// La consigna pide poder actualizar domicilio o email; documento y legajo
// identifican al empleado, por eso quedan fijos.
const CAMPOS_NO_EDITABLES = ['documento', 'legajo'];

function limpiar(valor) {
  return typeof valor === 'string' ? valor.trim() : valor;
}

/**
 * Normaliza el body (recorta espacios, pasa el email a minúsculas) y valida
 * que los campos obligatorios estén presentes antes de llegar a la base de datos.
 *
 * @param {{ modo: 'crear' | 'actualizar' }} opciones
 */
export function validarUsuario({ modo }) {
  return (req, res, next) => {
    const body = req.body || {};
    const datos = {};
    const errores = [];

    for (const campo of CAMPOS_OBLIGATORIOS) {
      if (modo === 'actualizar' && CAMPOS_NO_EDITABLES.includes(campo)) {
        continue; // se ignora silenciosamente si el cliente lo manda
      }

      const valor = limpiar(body[campo]);
      const vieneEnElBody = Object.hasOwn(body, campo);

      if (modo === 'crear' && (!vieneEnElBody || valor === '' || valor === undefined || valor === null)) {
        errores.push({ campo, mensaje: `El campo ${campo} es obligatorio` });
        continue;
      }

      if (modo === 'actualizar' && vieneEnElBody && (valor === '' || valor === null)) {
        errores.push({ campo, mensaje: `El campo ${campo} no puede quedar vacío` });
        continue;
      }

      if (vieneEnElBody && valor !== undefined) {
        datos[campo] = campo === 'email' ? String(valor).toLowerCase() : valor;
      }
    }

    if (modo === 'actualizar' && Object.keys(datos).length === 0) {
      errores.push({ campo: 'general', mensaje: 'No se enviaron campos para actualizar' });
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: 'Datos inválidos', detalles: errores });
    }

    req.datosUsuario = datos;
    return next();
  };
}
