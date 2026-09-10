/**
 * Modal de confirmación para dar de baja a un usuario.
 * Se usa en lugar de window.confirm para no bloquear el navegador.
 */
export default function ConfirmarBaja({ usuario, procesando, onCancelar, onConfirmar }) {
  if (!usuario) return null;

  return (
    <div className="modal-fondo" role="dialog" aria-modal="true" aria-labelledby="titulo-baja">
      <div className="modal">
        <h2 id="titulo-baja" className="modal__titulo">Dar de baja</h2>
        <p className="modal__texto">
          ¿Confirmás la baja de <strong>{usuario.apellido}, {usuario.nombre}</strong> (legajo {usuario.legajo})?
          Esta acción elimina el registro del sistema y no se puede deshacer.
        </p>
        <div className="modal__acciones">
          <button type="button" className="boton boton--secundario" onClick={onCancelar} disabled={procesando}>
            Cancelar
          </button>
          <button type="button" className="boton boton--peligro" onClick={onConfirmar} disabled={procesando}>
            {procesando ? 'Eliminando…' : 'Sí, dar de baja'}
          </button>
        </div>
      </div>
    </div>
  );
}
