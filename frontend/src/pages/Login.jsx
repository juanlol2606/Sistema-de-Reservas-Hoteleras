import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AlertaError from '../components/AlertaError.jsx';
import Campo from '../components/Campo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFormulario } from '../hooks/useFormulario.js';
import { conErrores, email, requerido } from '../utils/validaciones.js';

export default function Login() {
  const { usuario, aviso, iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();

  const formulario = useFormulario({
    valores: { email: '', password: '' },
    validar: (v) => conErrores({ email: email(v.email), password: requerido(v.password) }),
    alEnviar: async (v) => {
      await iniciarSesion({ email: v.email.trim(), password: v.password });
      navegar(ubicacion.state?.desde?.pathname ?? '/', { replace: true });
    },
  });

  if (usuario) return <Navigate to="/" replace />;

  return (
    <div className="pagina-login">
      <div className="tarjeta-login">
        <span className="marca">StayHub</span>
        <p className="descripcion">Inicia sesión para administrar tus hoteles.</p>
        {aviso && <div className="alerta alerta-info">{aviso}</div>}
        <form className="formulario" onSubmit={formulario.enviar} noValidate>
          <AlertaError error={formulario.errorGeneral} />
          <Campo etiqueta="Correo electrónico" tipo="email" autoComplete="username" autoFocus {...formulario.campo('email')} />
          <Campo etiqueta="Contraseña" tipo="password" autoComplete="current-password" {...formulario.campo('password')} />
          <div className="acciones">
            <button type="submit" className="boton boton-primario" disabled={formulario.enviando}>
              {formulario.enviando ? 'Ingresando…' : 'Ingresar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
