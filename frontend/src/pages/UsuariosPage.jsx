import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUsuarios } from '../hooks/useUsuarios.js';
import ConfirmarBaja from '../components/ConfirmarBaja.jsx';
import Mensaje from '../components/Mensaje.jsx';

export default function UsuariosPage() {
  const { usuarios, cargando, error, recargar, eliminar } = useUsuarios();
  const navegar = useNavigate();
  const location = useLocation();

  const [busqueda, setBusqueda] = useState('');
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [mensaje, setMensaje] = useState(location.state?.mensaje || null);
  const [errorAccion, setErrorAccion] = useState(null);

  // Limpia el state de navegación para que el cartel no reaparezca al refrescar
  useEffect(() => {
    if (location.state?.mensaje) {
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const usuariosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    const filtrados = termino
      ? usuarios.filter((usuario) =>
          [usuario.nombre, usuario.apellido, usuario.documento, usuario.legajo, usuario.email, usuario.domicilio]
            .join(' ')
            .toLowerCase()
            .includes(termino)
        )
      : usuarios;

    // Orden alfabético respetando acentos y eñes
    return [...filtrados].sort(
      (a, b) =>
        a.apellido.localeCompare(b.apellido, 'es', { sensitivity: 'base' }) ||
        a.nombre.localeCompare(b.nombre, 'es', { sensitivity: 'base' })
    );
  }, [usuarios, busqueda]);

  async function confirmarBaja() {
    setEliminando(true);
    setErrorAccion(null);
    try {
      await eliminar(usuarioAEliminar.id);
      setMensaje(`Se dio de baja a ${usuarioAEliminar.apellido}, ${usuarioAEliminar.nombre}.`);
      setUsuarioAEliminar(null);
    } catch (e) {
      setErrorAccion(e.message);
      setUsuarioAEliminar(null);
    } finally {
      setEliminando(false);
    }
  }

  return (
    <section>
      <div className="seccion__encabezado">
        <div>
          <h2 className="seccion__titulo">Usuarios registrados</h2>
          <p className="seccion__descripcion">
            {cargando ? 'Cargando…' : `${usuarios.length} usuario${usuarios.length === 1 ? '' : 's'} en el sistema`}
          </p>
        </div>
        <Link className="boton boton--primario" to="/usuarios/nuevo">
          + Nuevo ingreso
        </Link>
      </div>

      <Mensaje tipo="exito" texto={mensaje} onCerrar={() => setMensaje(null)} />
      <Mensaje tipo="error" texto={errorAccion} onCerrar={() => setErrorAccion(null)} />

      <div className="barra-herramientas">
        <input
          type="search"
          className="buscador"
          placeholder="Buscar por nombre, legajo, documento o email…"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          aria-label="Buscar usuarios"
        />
        <button type="button" className="boton boton--secundario" onClick={recargar} disabled={cargando}>
          Actualizar
        </button>
      </div>

      {error && (
        <div className="estado estado--error">
          <p>{error}</p>
          <button type="button" className="boton boton--secundario" onClick={recargar}>
            Reintentar
          </button>
        </div>
      )}

      {!error && cargando && <p className="estado">Cargando usuarios…</p>}

      {!error && !cargando && usuarios.length === 0 && (
        <div className="estado">
          <p>Todavía no hay usuarios cargados.</p>
          <Link className="boton boton--primario" to="/usuarios/nuevo">
            Dar de alta al primero
          </Link>
        </div>
      )}

      {!error && !cargando && usuarios.length > 0 && (
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr>
                <th>Legajo</th>
                <th>Apellido y nombre</th>
                <th>Documento</th>
                <th>Email</th>
                <th>Domicilio</th>
                <th className="tabla__acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map((usuario) => (
                <tr key={usuario.id}>
                  <td data-titulo="Legajo">
                    <span className="etiqueta-legajo">{usuario.legajo}</span>
                  </td>
                  <td data-titulo="Apellido y nombre">
                    <strong>
                      {usuario.apellido}, {usuario.nombre}
                    </strong>
                  </td>
                  <td data-titulo="Documento">{usuario.documento}</td>
                  <td data-titulo="Email">{usuario.email}</td>
                  <td data-titulo="Domicilio">{usuario.domicilio}</td>
                  <td data-titulo="Acciones" className="tabla__acciones">
                    <div className="acciones-fila">
                      <button
                        type="button"
                        className="boton boton--chico"
                        onClick={() => navegar(`/usuarios/${usuario.id}/editar`)}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="boton boton--chico boton--peligro"
                        onClick={() => setUsuarioAEliminar(usuario)}
                      >
                        Baja
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {usuariosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="tabla__vacia">
                    Ningún usuario coincide con “{busqueda}”.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmarBaja
        usuario={usuarioAEliminar}
        procesando={eliminando}
        onCancelar={() => setUsuarioAEliminar(null)}
        onConfirmar={confirmarBaja}
      />
    </section>
  );
}
