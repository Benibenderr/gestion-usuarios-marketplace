import { useState } from 'react';
import Mensaje from './Mensaje.jsx';

const VALORES_VACIOS = {
  nombre: '',
  apellido: '',
  documento: '',
  legajo: '',
  email: '',
  domicilio: ''
};

const CAMPOS = [
  { nombre: 'nombre', etiqueta: 'Nombre', placeholder: 'Lucía' },
  { nombre: 'apellido', etiqueta: 'Apellido', placeholder: 'Giménez' },
  {
    nombre: 'documento',
    etiqueta: 'Documento (DNI / Pasaporte)',
    placeholder: '34567890',
    soloEnAlta: true,
    ayuda: 'No se modifica una vez dado de alta'
  },
  {
    nombre: 'legajo',
    etiqueta: 'Legajo',
    placeholder: 'MKT-001',
    soloEnAlta: true,
    ayuda: 'Identificador único de empleado'
  },
  { nombre: 'email', etiqueta: 'Email', tipo: 'email', placeholder: 'nombre.apellido@marketplace.com' },
  { nombre: 'domicilio', etiqueta: 'Domicilio', placeholder: 'Av. Argentina 1250, Neuquén' }
];

const EXPRESION_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EXPRESION_DOCUMENTO = /^[A-Za-z0-9.\-]{6,20}$/;
const EXPRESION_LEGAJO = /^[A-Za-z0-9\-]{2,20}$/;

/** Validaciones del lado del cliente (el backend vuelve a validar todo). */
function validar(valores, modo) {
  const errores = {};
  const texto = (campo) => (valores[campo] || '').trim();

  if (texto('nombre').length < 2) errores.nombre = 'Ingresá un nombre de al menos 2 caracteres';
  if (texto('apellido').length < 2) errores.apellido = 'Ingresá un apellido de al menos 2 caracteres';
  if (!EXPRESION_EMAIL.test(texto('email'))) errores.email = 'Ingresá un email válido';
  if (texto('domicilio').length < 5) errores.domicilio = 'Ingresá un domicilio de al menos 5 caracteres';

  if (modo === 'crear') {
    if (!EXPRESION_DOCUMENTO.test(texto('documento'))) {
      errores.documento = 'Entre 6 y 20 caracteres: letras, números, punto o guion';
    }
    if (!EXPRESION_LEGAJO.test(texto('legajo'))) {
      errores.legajo = 'Entre 2 y 20 caracteres: letras, números o guion';
    }
  }

  return errores;
}

/**
 * Formulario reutilizable para el alta y la edición de un usuario.
 *
 * @param {'crear' | 'editar'} modo
 * @param {object} valoresIniciales datos del usuario cuando se edita
 * @param {(datos: object) => Promise<void>} onGuardar debe lanzar el error si la API falla
 * @param {() => void} onCancelar
 */
export default function UsuarioForm({ modo, valoresIniciales, onGuardar, onCancelar }) {
  const [valores, setValores] = useState({ ...VALORES_VACIOS, ...valoresIniciales });
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const editando = modo === 'editar';

  function manejarCambio(evento) {
    const { name, value } = evento.target;
    setValores((actuales) => ({ ...actuales, [name]: value }));
    // Limpia el error del campo apenas el usuario lo corrige
    setErrores((actuales) => ({ ...actuales, [name]: undefined }));
  }

  async function manejarSubmit(evento) {
    evento.preventDefault();
    setErrorGeneral(null);

    const nuevosErrores = validar(valores, modo);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const datos = Object.fromEntries(
      Object.entries(valores).map(([clave, valor]) => [clave, typeof valor === 'string' ? valor.trim() : valor])
    );

    setGuardando(true);
    try {
      await onGuardar(datos);
    } catch (error) {
      // Los errores por campo que devuelve la API (email duplicado, legajo repetido, etc.)
      const porCampo = {};
      (error.detalles || []).forEach((detalle) => {
        if (detalle.campo && detalle.campo !== 'general') porCampo[detalle.campo] = detalle.mensaje;
      });
      setErrores(porCampo);
      setErrorGeneral(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <form className="formulario" onSubmit={manejarSubmit} noValidate>
      <Mensaje tipo="error" texto={errorGeneral} onCerrar={() => setErrorGeneral(null)} />

      <div className="formulario__grilla">
        {CAMPOS.map((campo) => {
          const bloqueado = editando && campo.soloEnAlta;
          const idCampo = `campo-${campo.nombre}`;
          const error = errores[campo.nombre];

          return (
            <div className="campo" key={campo.nombre}>
              <label className="campo__etiqueta" htmlFor={idCampo}>
                {campo.etiqueta}
                {!bloqueado && <span className="campo__requerido"> *</span>}
              </label>
              <input
                id={idCampo}
                name={campo.nombre}
                type={campo.tipo || 'text'}
                className={`campo__input ${error ? 'campo__input--error' : ''}`}
                value={valores[campo.nombre] ?? ''}
                onChange={manejarCambio}
                placeholder={campo.placeholder}
                disabled={bloqueado || guardando}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${idCampo}-error` : undefined}
              />
              {error ? (
                <p className="campo__error" id={`${idCampo}-error`}>
                  {error}
                </p>
              ) : (
                campo.ayuda && <p className="campo__ayuda">{campo.ayuda}</p>
              )}
            </div>
          );
        })}
      </div>

      {editando && (
        <p className="nota">
          El documento y el legajo identifican al empleado, por eso no se editan. Podés actualizar nombre, apellido,
          email y domicilio.
        </p>
      )}

      <div className="formulario__acciones">
        <button type="button" className="boton boton--secundario" onClick={onCancelar} disabled={guardando}>
          Cancelar
        </button>
        <button type="submit" className="boton boton--primario" disabled={guardando}>
          {guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Dar de alta'}
        </button>
      </div>
    </form>
  );
}
