import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Sequelize } from 'sequelize';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carpeta raíz del backend (backend/), usada como base para el archivo .sqlite
const RAIZ_BACKEND = path.resolve(__dirname, '..', '..');

const configurado = process.env.DB_STORAGE || './database.sqlite';

// DB_STORAGE=:memory: levanta una base descartable en RAM. La usan los tests.
const enMemoria = configurado === ':memory:';
const storage = enMemoria ? ':memory:' : path.resolve(RAIZ_BACKEND, configurado);

/**
 * Instancia única de Sequelize apuntando a SQLite.
 * El archivo de base de datos se crea solo la primera vez que se levanta el servidor.
 */
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
  // En memoria, cada conexión del pool sería una base distinta:
  // por eso se limita a una sola conexión.
  ...(enMemoria ? { pool: { max: 1, idle: Infinity } } : {})
});

export const rutaBaseDeDatos = storage;
