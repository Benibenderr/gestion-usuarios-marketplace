import 'dotenv/config';
import { sequelize } from './config/database.js';
import { Usuario } from './models/Usuario.js';

/**
 * Carga usuarios de ejemplo. Solo inserta si la tabla está vacía,
 * así no duplica datos si se ejecuta dos veces.
 *
 * Uso:  npm run seed
 */
const USUARIOS_DE_EJEMPLO = [
  {
    nombre: 'Lucía',
    apellido: 'Giménez',
    documento: '34567890',
    legajo: 'MKT-001',
    email: 'lucia.gimenez@marketplace.com',
    domicilio: 'Av. Argentina 1250, Neuquén'
  },
  {
    nombre: 'Martín',
    apellido: 'Sosa',
    documento: '31245678',
    legajo: 'MKT-002',
    email: 'martin.sosa@marketplace.com',
    domicilio: 'Roca 480, Cipolletti'
  },
  {
    nombre: 'Carolina',
    apellido: 'Paz',
    documento: '38901234',
    legajo: 'MKT-003',
    email: 'carolina.paz@marketplace.com',
    domicilio: 'Belgrano 77, General Roca'
  },
  {
    nombre: 'Diego',
    apellido: 'Álvarez',
    documento: 'AAB123456',
    legajo: 'MKT-004',
    email: 'diego.alvarez@marketplace.com',
    domicilio: 'San Martín 2100, Neuquén'
  },
  {
    nombre: 'Sofía',
    apellido: 'Ferreyra',
    documento: '40123456',
    legajo: 'MKT-005',
    email: 'sofia.ferreyra@marketplace.com',
    domicilio: 'Illia 610, Plottier'
  }
];

async function sembrar() {
  try {
    await sequelize.sync();

    const cantidad = await Usuario.count();
    if (cantidad > 0) {
      console.log(`La tabla ya tiene ${cantidad} usuarios. No se carga nada.`);
      return;
    }

    await Usuario.bulkCreate(USUARIOS_DE_EJEMPLO, { validate: true });
    console.log(`Se cargaron ${USUARIOS_DE_EJEMPLO.length} usuarios de ejemplo.`);
  } catch (error) {
    console.error('Error al cargar los datos de ejemplo:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

sembrar();
