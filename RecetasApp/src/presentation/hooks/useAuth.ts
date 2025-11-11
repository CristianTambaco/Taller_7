import { useEffect, useState } from "react";
import { Usuario } from "../../domain/models/Usuario";
import { AuthUseCase } from "../../domain/useCases/auth/AuthUseCase";

const authUseCase = new AuthUseCase();

export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar si hay sesión activa al cargar
    verificarSesion();

    // Escuchar cambios de autenticación
    const { data: subscription } = authUseCase.onAuthStateChange((user) => {
      setUsuario(user);
      setCargando(false);
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  const verificarSesion = async () => {
    const user = await authUseCase.obtenerUsuarioActual();
    setUsuario(user);
    setCargando(false);
  };

  const registrar = async (
    email: string,
    password: string,
    rol: "chef" | "usuario"
  ) => {
    return await authUseCase.registrar(email, password, rol);
  };

  const iniciarSesion = async (email: string, password: string) => {
    return await authUseCase.iniciarSesion(email, password);
  };

  const cerrarSesion = async () => {
    return await authUseCase.cerrarSesion();
  };

  return {
    usuario,
    cargando,
    registrar,
    iniciarSesion,
    cerrarSesion,
    esChef: usuario?.rol === "chef",
  };
}
