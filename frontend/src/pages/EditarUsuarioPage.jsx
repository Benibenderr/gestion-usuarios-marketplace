import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import UsuarioForm from '../components/UsuarioForm.jsx';
import { usuariosApi } from '../services/api.js';

export default function EditarUsuarioPage() {
  const { id } = useParams();
  const navegar = useNavigate();

  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;

    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const datos = await usuariosApi.obtener(id);
        if (!cancelado) setUsuario(datos);
      } catch (e) {
        if (!cancelado) setError(e.message);
      } finally {
        if (!cancelado) setCargando(false);
      }
    }

    cargar();
    return () => {
      cancelado = true;
    };
  }, [id]);

  async function guardar(datos) {
    // El documento y el legajo no se envían: son datos fijos del empleado.
    const actualizado = await usuariosApi.actualizar(id, {
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      domicilio: datos.domicilio
    });

    navegar('/', {
      state: { mensaje: `Se actualizaron los datos de ${actualizado.apellido}, ${actualizado.nombre}.` }
    });
  }

  if (cargando) return <p className="estado">Cargando usuario…</p>;

  if (error) {
    return (
      <div className="estado estado--error">
        <p>{error}</p>
        <button type="button" className="boton boton--secundario" onClick={() => navegar('/')}>
          Volver al listado
        </button>
      </div>
    );
  }

  return (
    <section>
      <div className="seccion__encabezado">
        <div>
          <h2 className="seccion__titulo">
            Editar a {usuario.apellido}, {usuario.nombre}
          </h2>
          <p className="seccion__descripcion">Legajo {usuario.legajo} · ID interno {usuario.id}</p>
        </div>
      </div>

      <div className="tarjeta">
        <UsuarioForm modo="editar" valoresIniciales={usuario} onGuardar={guardar} onCancelar={() => navegar('/')} />
      </div>
    </section>
  );
}
