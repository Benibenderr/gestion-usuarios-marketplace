import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Sequelize } from 'sequelize';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carpeta raiz del backend (backend/), usada como base para el archivo .sqlite
const RAIZ_BACKEND = path.resolve(__dirname, '..', '..');

const storage = path.resolve(RAIZ_BACKEND, process.env.DB_STORAGE || './database.sqlite');

/**
 * Instancia única de Sequelize apuntando a SQLite.
 * El archivo de base de datos se crea solo la primera vez que se levanta el servidor.
 */
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false
});

export const rutaBaseDeDatos = storage;
