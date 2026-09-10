import { NavLink, Route, Routes } from 'react-router-dom';
import UsuariosPage from './pages/UsuariosPage.jsx';
import NuevoUsuarioPage from './pages/NuevoUsuarioPage.jsx';
import EditarUsuarioPage from './pages/EditarUsuarioPage.jsx';

export default function App() {
  return (
    <div className="app">
      <header className="encabezado">
        <div className="contenedor encabezado__interno">
          <div className="marca">
            <span className="marca__logo">MP</span>
            <div>
              <h1 className="marca__titulo">Usuarios internos</h1>
              <p className="marca__subtitulo">Panel de Recursos Humanos</p>
            </div>
          </div>

          <nav className="navegacion">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link nav-link--activo' : 'nav-link')}>
              Listado
            </NavLink>
            <NavLink
              to="/usuarios/nuevo"
              className={({ isActive }) => (isActive ? 'nav-link nav-link--activo' : 'nav-link')}
            >
              Nuevo ingreso
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="contenedor principal">
        <Routes>
          <Route path="/" element={<UsuariosPage />} />
          <Route path="/usuarios/nuevo" element={<NuevoUsuarioPage />} />
          <Route path="/usuarios/:id/editar" element={<EditarUsuarioPage />} />
          <Route path="*" element={<p className="estado">La página que buscás no existe.</p>} />
        </Routes>
      </main>

      <footer className="pie">
        <div className="contenedor">
          <p>Marketplace · Gestión de personal interno · React + Express + Sequelize</p>
        </div>
      </footer>
    </div>
  );
}
