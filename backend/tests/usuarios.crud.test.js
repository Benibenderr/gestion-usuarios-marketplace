import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { sequelize } from '../src/config/database.js';
import { Usuario } from '../src/models/Usuario.js';
import { USUARIO_VALIDO, otroUsuario, reiniciarBase } from './helpers.js';

beforeEach(reiniciarBase);
afterAll(async () => {
  await sequelize.close();
});

/** Crea un usuario por la API y devuelve el cuerpo de la respuesta. */
async function crearUsuario(datos = USUARIO_VALIDO) {
  const respuesta = await request(app).post('/api/usuarios').send(datos);
  expect(respuesta.status).toBe(201);
  return respuesta.body;
}

describe('GET /api/usuarios', () => {
  it('devuelve una lista vacía cuando no hay usuarios cargados', async () => {
    const respuesta = await request(app).get('/api/usuarios');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toEqual([]);
  });

  it('devuelve todos los usuarios cargados', async () => {
    await crearUsuario();
    await crearUsuario(otroUsuario());

    const respuesta = await request(app).get('/api/usuarios');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(2);
  });

  it('ordena el listado por apellido y nombre', async () => {
    await crearUsuario(otroUsuario({ apellido: 'Zarate', legajo: 'MKT-030', documento: '30111222', email: 'z@marketplace.com' }));
    await crearUsuario(otroUsuario({ apellido: 'Acosta', legajo: 'MKT-031', documento: '30111333', email: 'a@marketplace.com' }));

    const respuesta = await request(app).get('/api/usuarios');

    expect(respuesta.body.map((u) => u.apellido)).toEqual(['Acosta', 'Zarate']);
  });

  it('filtra por texto con el parámetro q', async () => {
    await crearUsuario();
    await crearUsuario(otroUsuario());

    const respuesta = await request(app).get('/api/usuarios').query({ q: 'ruiz' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body).toHaveLength(1);
    expect(respuesta.body[0].apellido).toBe('Ruiz');
  });
});

describe('POST /api/usuarios', () => {
  it('crea un usuario, responde 201 y le asigna un id automático', async () => {
    const respuesta = await request(app).post('/api/usuarios').send(USUARIO_VALIDO);

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.id).toEqual(expect.any(Number));
    expect(respuesta.body).toMatchObject({
      nombre: 'Ana',
      apellido: 'Ruiz',
      documento: '33111222',
      legajo: 'MKT-010',
      email: 'ana.ruiz@marketplace.com',
      domicilio: 'Alberdi 120, Neuquén'
    });
  });

  it('persiste el usuario en la base, no sólo en la respuesta', async () => {
    const creado = await crearUsuario();

    const enLaBase = await Usuario.findByPk(creado.id);

    expect(enLaBase).not.toBeNull();
    expect(enLaBase.legajo).toBe('MKT-010');
  });

  it('genera ids distintos para cada usuario', async () => {
    const primero = await crearUsuario();
    const segundo = await crearUsuario(otroUsuario());

    expect(segundo.id).not.toBe(primero.id);
  });
});

describe('GET /api/usuarios/:id', () => {
  it('devuelve el usuario pedido', async () => {
    const creado = await crearUsuario();

    const respuesta = await request(app).get(`/api/usuarios/${creado.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.id).toBe(creado.id);
    expect(respuesta.body.email).toBe('ana.ruiz@marketplace.com');
  });
});

describe('PUT /api/usuarios/:id', () => {
  it('actualiza el email y el domicilio', async () => {
    const creado = await crearUsuario();

    const respuesta = await request(app)
      .put(`/api/usuarios/${creado.id}`)
      .send({ email: 'ana.nueva@marketplace.com', domicilio: 'Mitre 900, Neuquén' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.email).toBe('ana.nueva@marketplace.com');
    expect(respuesta.body.domicilio).toBe('Mitre 900, Neuquén');
  });

  it('deja los cambios guardados en la base', async () => {
    const creado = await crearUsuario();

    await request(app).put(`/api/usuarios/${creado.id}`).send({ domicilio: 'Mitre 900, Neuquén' });
    const enLaBase = await Usuario.findByPk(creado.id);

    expect(enLaBase.domicilio).toBe('Mitre 900, Neuquén');
  });

  it('permite corregir el nombre y el apellido', async () => {
    const creado = await crearUsuario();

    const respuesta = await request(app)
      .put(`/api/usuarios/${creado.id}`)
      .send({ nombre: 'Ana María', apellido: 'Ruiz Diaz' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.nombre).toBe('Ana María');
    expect(respuesta.body.apellido).toBe('Ruiz Diaz');
  });
});

describe('DELETE /api/usuarios/:id', () => {
  it('elimina el usuario y responde 200', async () => {
    const creado = await crearUsuario();

    const respuesta = await request(app).delete(`/api/usuarios/${creado.id}`);

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.id).toBe(creado.id);
  });

  it('el usuario eliminado ya no está en la base ni en el listado', async () => {
    const creado = await crearUsuario();
    await request(app).delete(`/api/usuarios/${creado.id}`);

    const enLaBase = await Usuario.findByPk(creado.id);
    const listado = await request(app).get('/api/usuarios');

    expect(enLaBase).toBeNull();
    expect(listado.body).toEqual([]);
  });
});

describe('GET /api/health', () => {
  it('responde que la API está viva', async () => {
    const respuesta = await request(app).get('/api/health');

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.estado).toBe('ok');
  });
});
