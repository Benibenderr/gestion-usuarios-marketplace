import 'dotenv/config';
import { app } from './app.js';
import { sequelize, rutaBaseDeDatos } from './config/database.js';

const PORT = process.env.PORT || 3001;

async function iniciar() {
  try {
    await sequelize.authenticate();
    // sync() crea la tabla "usuarios" si todavía no existe
    await sequelize.sync();

    console.log(`Base de datos SQLite lista en: ${rutaBaseDeDatos}`);

    app.listen(PORT, () => {
      console.log(`API escuchando en http://localhost:${PORT}`);
      console.log(`Endpoints: http://localhost:${PORT}/api/usuarios`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciar();
