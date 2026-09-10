import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import { sequelize } from '../src/config/database.js';
import { USUARIO_VALIDO, otroUsuario, reiniciarBase } from './helpers.js';

beforeEach(reiniciarBase);
afterAll(async () => {
  await sequelize.close();
});

/** Devuelve los nombres de campo que vinieron en los detalles del error. */
function camposConError(respuesta) {
  return (respuesta.body.detalles || []).map((detalle) => detalle.campo);
}

describe('Campos obligatorios', () => {
  it('rechaza un alta sin datos y detalla los seis campos faltantes', async () => {
    const respuesta = await request(app).post('/api/usuarios').send({});

    expect(respuesta.status).toBe(400);
    expect(respuesta.body.error).toBe('Datos inválidos');
    expect(camposConError(respuesta)).toEqual(
      expect.arrayContaining(['nombre', 'apellido', 'documento', 'legajo', 'email', 'domicilio'])
    );
  });

  it('rechaza un alta a la que le falta un solo campo', async () => {
    const { apellido, ...sinApellido } = USUARIO_VALIDO;

    const respuesta = await request(app).post('/api/usuarios').send(sinApellido);

    expect(respuesta.status).toBe(400);
    expect(camposConError(respuesta)).toContain('apellido');
  });

  it('rechaza un campo que sólo tiene espacios', async () => {
    const respuesta = await request(app)
      .post('/api/usuarios')
      .send({ ...USUARIO_VALIDO, domicilio: '   ' });

    expect(respuesta.status).toBe(400);
    expect(camposConError(respuesta)).toContain('domicilio');
  });
});

describe('Formato de los datos', () => {
  it('rechaza un email mal formado', async () => {
    const respuesta = await request(app)
      .post('/api/usuarios')
      .send({ ...USUARIO_VALIDO, email: 'no-es-un-mail' });

    expect(respuesta.status).toBe(400);
    expect(camposConError(respuesta)).toContain('email');
  });

  it('rechaza un documento demasiado corto', async () => {
    const respuesta = await request(app)
      .post('/api/usuarios')
      .send({ ...USUARIO_VALIDO, documento: '123' });

    expect(respuesta.status).toBe(400);
    expect(camposConError(respuesta)).toContain('documento');
  });

  it('acepta un pasaporte alfanumérico como documento', async () => {
    const respuesta = await request(app)
      .post('/api/usuarios')
      .send({ ...USUARIO_VALIDO, documento: 'AAB123456' });

    expect(respuesta.status).toBe(201);
  });

  it('guarda el email en minúsculas y sin espacios sobrantes', async () => {
    const respuesta = await request(app)
      .post('/api/usuarios')
      .send({ ...USUARIO_VALIDO, email: '  ANA.Ruiz@Marketplace.com  ', nombre: '  Ana  ' });

    expect(respuesta.status).toBe(201);
    expect(respuesta.body.email).toBe('ana.ruiz@marketplace.com');
    expect(respuesta.body.nombre).toBe('Ana');
  });
});

describe('Datos únicos', () => {
  it('rechaza con 409 un legajo ya registrado', async () => {
    await request(app).post('/api/usuarios').send(USUARIO_VALIDO);

    const respuesta = await request(app)
      .post('/api/usuarios')
      .send(otroUsuario({ legajo: USUARIO_VALIDO.legajo }));

    expect(respuesta.status).toBe(409);
    expect(camposConError(respuesta)).toContain('legajo');
  });

  it('rechaza con 409 un documento ya registrado', async () => {
    await request(app).post('/api/usuarios').send(USUARIO_VALIDO);

    const respuesta = await request(app)
      .post('/api/usuarios')
      .send(otroUsuario({ documento: USUARIO_VALIDO.documento }));

    expect(respuesta.status).toBe(409);
    expect(camposConError(respuesta)).toContain('documento');
  });

  it('rechaza con 409 un email ya registrado', async () => {
    await request(app).post('/api/usuarios').send(USUARIO_VALIDO);

    const respuesta = await request(app)
      .post('/api/usuarios')
      .send(otroUsuario({ email: USUARIO_VALIDO.email }));

    expect(respuesta.status).toBe(409);
    expect(camposConError(respuesta)).toContain('email');
  });
});

describe('Campos que no se editan', () => {
  it('ignora los intentos de cambiar el documento y el legajo', async () => {
    const creado = (await request(app).post('/api/usuarios').send(USUARIO_VALIDO)).body;

    const respuesta = await request(app)
      .put(`/api/usuarios/${creado.id}`)
      .send({ documento: '99999999', legajo: 'HACK-1', domicilio: 'Mitre 900, Neuquén' });

    expect(respuesta.status).toBe(200);
    expect(respuesta.body.documento).toBe(USUARIO_VALIDO.documento);
    expect(respuesta.body.legajo).toBe(USUARIO_VALIDO.legajo);
    expect(respuesta.body.domicilio).toBe('Mitre 900, Neuquén');
  });

  it('rechaza una edición que no trae ningún campo editable', async () => {
    const creado = (await request(app).post('/api/usuarios').send(USUARIO_VALIDO)).body;

    const respuesta = await request(app).put(`/api/usuarios/${creado.id}`).send({ legajo: 'HACK-1' });

    expect(respuesta.status).toBe(400);
  });

  it('rechaza una edición con email inválido', async () => {
    const creado = (await request(app).post('/api/usuarios').send(USUARIO_VALIDO)).body;

    const respuesta = await request(app).put(`/api/usuarios/${creado.id}`).send({ email: 'roto' });

    expect(respuesta.status).toBe(400);
    expect(camposConError(respuesta)).toContain('email');
  });
});

describe('Recursos inexistentes', () => {
  it('responde 404 al pedir un usuario que no existe', async () => {
    const respuesta = await request(app).get('/api/usuarios/9999');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error).toBe('Usuario no encontrado');
  });

  it('responde 404 al editar un usuario que no existe', async () => {
    const respuesta = await request(app).put('/api/usuarios/9999').send({ domicilio: 'Mitre 900, Neuquén' });

    expect(respuesta.status).toBe(404);
  });

  it('responde 404 al eliminar un usuario que no existe', async () => {
    const respuesta = await request(app).delete('/api/usuarios/9999');

    expect(respuesta.status).toBe(404);
  });

  it('responde 404 si el id no es un número', async () => {
    const respuesta = await request(app).get('/api/usuarios/abc');

    expect(respuesta.status).toBe(404);
  });

  it('responde 404 en JSON ante una ruta que no existe', async () => {
    const respuesta = await request(app).get('/api/otra-cosa');

    expect(respuesta.status).toBe(404);
    expect(respuesta.body.error).toContain('no existe');
  });
});
