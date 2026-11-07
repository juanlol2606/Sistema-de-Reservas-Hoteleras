import axios from 'axios';
import { leerSesion } from './sesion.js';

const cliente = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

let alExpirarSesion = () => {};

export function registrarAlExpirarSesion(funcion) {
  alExpirarSesion = funcion;
}

cliente.interceptors.request.use((config) => {
  const token = leerSesion()?.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

cliente.interceptors.response.use(
  (respuesta) => respuesta,
  (error) => {
    const esLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !esLogin) alExpirarSesion();
    return Promise.reject(error);
  },
);

export default cliente;
