import { useEffect, useState } from "react";
import { Usuario } from "../../domain/models/Usuario";
import { AuthUseCase } from "../../domain/useCases/auth/AuthUseCase";

// Crear UNA SOLA instancia del UseCase
// Esto es importante para no crear múltiples suscripciones
const authUseCase = new AuthUseCase();

/**
 * useAuth - Hook de Autenticación
 *
 * Este hook es el puente entre la UI y la lógica de negocio.
 * Maneja el estado de autenticación de forma reactiva.
 *
 * ESTADOS:
 * - usuario: Usuario actual o null
 * - cargando: true mientras verifica sesión inicial
 *
 * MÉTODOS:
 * - registrar: Crear nuevo usuario
 * - iniciarSesion: Login
 * - cerrarSesion: Logout
 *
 * HELPERS:
 * - esChef: Boolean para validaciones rápidas
 */
export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // AL MONTAR: Verificar si hay sesión activa
    verificarSesion();

    // SUSCRIBIRSE: Escuchar cambios de autenticación
    const { data: subscription } = authUseCase.onAuthStateChange((user) => {
      setUsuario(user);
      setCargando(false);
    });

    // LIMPIAR: Cancelar suscripción al desmontar
    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  /**
   * Verificar sesión actual
   */
  const verificarSesion = async () => {
    const user = await authUseCase.obtenerUsuarioActual();
    setUsuario(user);
    setCargando(false);
  };

  /**
   * Registrar nuevo usuario
   */
  const registrar = async (
    email: string,
    password: string,
    rol: "chef" | "usuario"
  ) => {
    return await authUseCase.registrar(email, password, rol);
  };

  /**
   * Iniciar sesión
   */
  const iniciarSesion = async (email: string, password: string) => {
    return await authUseCase.iniciarSesion(email, password);
  };

  /**
   * Cerrar sesión
   */
  const cerrarSesion = async () => {
    return await authUseCase.cerrarSesion();
  };

  // Retornar estado y métodos
  return {
    usuario,              // Usuario actual o null
    cargando,            // Boolean de carga
    registrar,           // Función
    iniciarSesion,       // Función
    cerrarSesion,        // Función
    esChef: usuario?.rol === "chef", // Helper
  };
}
