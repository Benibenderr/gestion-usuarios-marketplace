import { useNavigate } from 'react-router-dom';
import UsuarioForm from '../components/UsuarioForm.jsx';
import { usuariosApi } from '../services/api.js';

export default function NuevoUsuarioPage() {
  const navegar = useNavigate();

  async function guardar(datos) {
    const creado = await usuariosApi.crear(datos);
    navegar('/', {
      state: { mensaje: `Se dio de alta a ${creado.apellido}, ${creado.nombre} (legajo ${creado.legajo}).` }
    });
  }

  return (
    <section>
      <div className="seccion__encabezado">
        <div>
          <h2 className="seccion__titulo">Nuevo ingreso</h2>
          <p className="seccion__descripcion">Todos los campos son obligatorios.</p>
        </div>
      </div>

      <div className="tarjeta">
        <UsuarioForm modo="crear" onGuardar={guardar} onCancelar={() => navegar('/')} />
      </div>
    </section>
  );
}
