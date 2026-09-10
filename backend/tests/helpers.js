import { sequelize } from '../src/config/database.js';

/** Usuario de referencia, válido según todas las reglas del modelo. */
export const USUARIO_VALIDO = {
  nombre: 'Ana',
  apellido: 'Ruiz',
  documento: '33111222',
  legajo: 'MKT-010',
  email: 'ana.ruiz@marketplace.com',
  domicilio: 'Alberdi 120, Neuquén'
};

/**
 * Devuelve un usuario distinto del de referencia, para no chocar con
 * las restricciones de unicidad. Se le pueden pisar campos puntuales.
 */
export function otroUsuario(cambios = {}) {
  return {
    ...USUARIO_VALIDO,
    nombre: 'Pedro',
    apellido: 'Lopez',
    documento: '39999888',
    legajo: 'MKT-020',
    email: 'pedro.lopez@marketplace.com',
    domicilio: 'Roca 55, Cipolletti',
    ...cambios
  };
}

/** Deja la tabla vacía y recién creada antes de cada test. */
export async function reiniciarBase() {
  await sequelize.sync({ force: true });
}
