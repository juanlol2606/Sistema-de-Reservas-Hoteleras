import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import AlertaError from '../components/AlertaError.jsx';
import Boton from '../components/Boton.jsx';
import Campo from '../components/Campo.jsx';
import { IconoImagen } from '../components/Iconos.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useFormulario } from '../hooks/useFormulario.js';
import { conErrores, email, requerido } from '../utils/validaciones.js';

export default function Login() {
  const { usuario, aviso, iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const ubicacion = useLocation();
  const [foto, setFoto] = useState('cargando');
  const [verClave, setVerClave] = useState(false);

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
      <div className={`login-lado-foto${foto === 'lista' ? ' con-foto' : ''}`}>
        {/* La foto es fija: se carga desde frontend/public/login.jpg y, si no existe, se queda el placeholder. */}
        <img className="login-foto" src="/login.jpg" alt="" onLoad={() => setFoto('lista')} onError={() => setFoto('ausente')} />
        {foto !== 'lista' && (
          <div className="login-foto-vacia">
            <IconoImagen width={28} height={28} strokeWidth={1.5} />
            <span>Foto principal · lobby o habitación</span>
          </div>
        )}
        <div className="login-lema">
          <span className="linea-dorada" />
          <p className="login-lema-titulo">Toda tu red de hoteles en un solo lugar.</p>
          <p className="login-lema-texto">Hoteles, habitaciones, huéspedes, reservas y reportes.</p>
        </div>
      </div>

      <div className="login-lado-formulario">
        <div className="login-contenido">
          <div className="login-encabezado">
            <span className="marca marca-grande">
              <span>Stay</span>Hub
            </span>
            <h1>Bienvenido de nuevo</h1>
            <p>Inicia sesión para administrar tus hoteles.</p>
          </div>
          {aviso && <div className="alerta alerta-info">{aviso}</div>}
          <form className="formulario formulario-login" onSubmit={formulario.enviar} noValidate>
            <AlertaError error={formulario.errorGeneral} />
            <Campo etiqueta="Correo electrónico" tipo="email" autoComplete="username" autoFocus placeholder="nombre@correo.com" {...formulario.campo('email')} />
            <Campo
              etiqueta="Contraseña"
              tipo={verClave ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              accion={
                <button type="button" className="campo-accion" aria-pressed={verClave} onClick={() => setVerClave((visible) => !visible)}>
                  {verClave ? 'Ocultar' : 'Mostrar'}
                </button>
              }
              {...formulario.campo('password')}
            />
            <Boton type="submit" variante="oscuro" bloque disabled={formulario.enviando}>
              {formulario.enviando ? 'Ingresando…' : 'Ingresar'}
            </Boton>
          </form>
          <p className="login-pie">StayHub · Panel de administración</p>
        </div>
      </div>
    </div>
  );
}
