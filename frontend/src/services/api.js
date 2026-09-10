// En desarrollo se usa /api y el proxy de Vite reenvía al backend (ver vite.config.js).
// Si se define VITE_API_URL en un archivo .env, se usa esa URL.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Envoltorio de fetch: arma la URL, parsea el JSON y transforma
 * las respuestas de error en excepciones con mensaje y detalles.
 */
async function pedir(ruta, opciones = {}) {
  let respuesta;

  try {
    respuesta = await fetch(`${BASE_URL}${ruta}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor. ¿Está levantado el backend?');
  }

  const texto = await respuesta.text();
  let cuerpo = null;
  if (texto) {
    try {
      cuerpo = JSON.parse(texto);
    } catch {
      cuerpo = null;
    }
  }

  if (!respuesta.ok) {
    const error = new Error(cuerpo?.error || `Error ${respuesta.status}`);
    error.status = respuesta.status;
    error.detalles = cuerpo?.detalles || [];
    throw error;
  }

  return cuerpo;
}

export const usuariosApi = {
  listar: () => pedir('/usuarios'),
  obtener: (id) => pedir(`/usuarios/${id}`),
  crear: (datos) => pedir('/usuarios', { method: 'POST', body: JSON.stringify(datos) }),
  actualizar: (id, datos) => pedir(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(datos) }),
  eliminar: (id) => pedir(`/usuarios/${id}`, { method: 'DELETE' })
};
