import { useEffect, useState } from "react";
import { Receta } from "../../domain/models/Receta";
import { RecipesUseCase } from "../../domain/useCases/recipes/RecipesUseCase";

// Instancia única del UseCase
const recipesUseCase = new RecipesUseCase();

/**
 * useRecipes - Hook de Gestión de Recetas
 *
 * Maneja el estado de las recetas y proporciona métodos
 * para crear, actualizar, eliminar y buscar.
 *
 * ESTADOS:
 * - recetas: Array de recetas
 * - cargando: Boolean de carga
 *
 * MÉTODOS:
 * - cargarRecetas: Obtiene todas las recetas
 * - buscar: Filtra por ingrediente
 * - crear: Crea nueva receta
 * - actualizar: Modifica receta existente
 * - eliminar: Borra receta
 * - seleccionarImagen: Abre galería
 */
export function useRecipes() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [cargando, setCargando] = useState(true);

  // AL MONTAR: Cargar todas las recetas
  useEffect(() => {
    cargarRecetas();
  }, []);

  /**
   * Cargar todas las recetas
   */
  const cargarRecetas = async () => {
    setCargando(true);
    const data = await recipesUseCase.obtenerRecetas();
    setRecetas(data);
    setCargando(false);
  };

  /**
   * Buscar recetas por ingrediente
   */
  const buscar = async (ingrediente: string) => {
    setCargando(true);
    const data = await recipesUseCase.buscarPorIngrediente(ingrediente);
    setRecetas(data);
    setCargando(false);
  };

  /**
   * Crear nueva receta
   * Al terminar, recarga la lista automáticamente
   */
  const crear = async (
    titulo: string,
    descripcion: string,
    ingredientes: string[],
    chefId: string,
    imagenUri?: string
  ) => {
    const resultado = await recipesUseCase.crearReceta(
      titulo,
      descripcion,
      ingredientes,
      chefId,
      imagenUri
    );

    // Si fue exitoso, recargar lista
    if (resultado.success) {
      await cargarRecetas();
    }

    return resultado;
  };

  /**
   * Actualizar receta existente
   */
  const actualizar = async (
    id: string,
    titulo: string,
    descripcion: string,
    ingredientes: string[]
  ) => {
    const resultado = await recipesUseCase.actualizarReceta(
      id,
      titulo,
      descripcion,
      ingredientes
    );

    if (resultado.success) {
      await cargarRecetas();
    }

    return resultado;
  };

  /**
   * Eliminar receta
   */
  const eliminar = async (id: string) => {
    const resultado = await recipesUseCase.eliminarReceta(id);

    if (resultado.success) {
      await cargarRecetas();
    }

    return resultado;
  };

  /**
   * Seleccionar imagen de galería
   */
  const seleccionarImagen = async () => {
    return await recipesUseCase.seleccionarImagen();
  };

  return {
    recetas,
    cargando,
    cargarRecetas,
    buscar,
    crear,
    actualizar,
    eliminar,
    seleccionarImagen,
  };
}
