import { useCallback, useEffect, useState } from 'react';
import { usuariosApi } from '../services/api.js';

/**
 * Hook con el estado del listado de usuarios.
 * Se encarga de cargar los datos y de mantener la lista sincronizada
 * cuando se elimina un usuario, sin recargar la página.
 */
export function useUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const datos = await usuariosApi.listar();
      setUsuarios(datos);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const eliminar = useCallback(async (id) => {
    await usuariosApi.eliminar(id);
    // Actualiza el estado local: la tabla se refresca sola.
    setUsuarios((actuales) => actuales.filter((usuario) => usuario.id !== id));
  }, []);

  return { usuarios, cargando, error, recargar: cargar, eliminar };
}
