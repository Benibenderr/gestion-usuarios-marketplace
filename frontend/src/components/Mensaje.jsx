/**
 * Cartel de feedback (éxito o error) con opción de cerrarlo.
 */
export default function Mensaje({ tipo = 'exito', texto, onCerrar }) {
  if (!texto) return null;

  return (
    <div className={`mensaje mensaje--${tipo}`} role="status">
      <span>{texto}</span>
      {onCerrar && (
        <button type="button" className="mensaje__cerrar" onClick={onCerrar} aria-label="Cerrar mensaje">
          ×
        </button>
      )}
    </div>
  );
}
