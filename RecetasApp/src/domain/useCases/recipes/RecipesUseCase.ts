// FILE: RecetasApp/src/domain/useCases/recipes/RecipesUseCase.ts
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera"; // Importar Camera
import * as FileSystem from 'expo-file-system/legacy'; // Importar FileSystem
import { supabase } from "../../../data/services/supabaseClient";
import { Receta } from "../../models/Receta";

// ❌ Elimina esta línea
// import { MediaType } from "expo-image-picker"; // Importar MediaType explícitamente

export class RecipesUseCase {
  // Obtener todas las recetas
  async obtenerRecetas(): Promise<Receta[]> {
    try {
      const { data, error } = await supabase
        .from("recetas")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.log("Error al obtener recetas:", error);
      return [];
    }
  }

  // Buscar recetas por ingrediente
  async buscarPorIngrediente(ingrediente: string): Promise<Receta[]> {
    try {
      const { data, error } = await supabase
        .from("recetas")
        .select("*")
        .contains("ingredientes", [ingrediente])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.log("Error en búsqueda:", error);
      return [];
    }
  }

  // Crear nueva receta
  async crearReceta(
    titulo: string,
    descripcion: string,
    ingredientes: string[],
    chefId: string,
    imagenUri?: string
  ) {
    try {
      let imagenUrl = null;

      // Si hay imagen, la subimos primero
      if (imagenUri) {
        imagenUrl = await this.subirImagen(imagenUri);
      }

      const { data, error } = await supabase
        .from("recetas")
        .insert({
          titulo,
          descripcion,
          ingredientes,
          chef_id: chefId,
          imagen_url: imagenUrl,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, receta: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Actualizar receta existente
  async actualizarReceta(
    id: string,
    titulo: string,
    descripcion: string,
    ingredientes: string[]
  ) {
    try {
      const { data, error } = await supabase
        .from("recetas")
        .update({
          titulo,
          descripcion,
          ingredientes,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, receta: data };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Eliminar receta
  async eliminarReceta(id: string) {
    try {
      const { error } = await supabase.from("recetas").delete().eq("id", id);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Subir imagen a Supabase Storage
// Subir imagen a Supabase Storage (versión con FileSystem)
  private async subirImagen(uri: string): Promise<string | null> {
    try {
      // Obtener la extensión del archivo
      const extension = uri.split(".").pop();
      if (!extension) {
        throw new Error("No se pudo determinar la extensión del archivo");
      }
      const nombreArchivo = `${Date.now()}.${extension}`;

      // Leer el archivo como base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64', // ✅ CORREGIDO: Usa 'base64' en lugar de FileSystem.EncodingType.Base64
      });

      // Crear un blob a partir del base64
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `image/${extension}` });

      // Subir a Supabase Storage
      const { data, error } = await supabase.storage
        .from("recetas-fotos")
        .upload(nombreArchivo, blob, {
          contentType: `image/${extension}`,
        });
      if (error) throw error;

      // Obtener la URL pública
      const { data: urlData } = supabase.storage
        .from("recetas-fotos")
        .getPublicUrl(nombreArchivo);
      return urlData.publicUrl;
    } catch (error) {
      console.log("Error al subir imagen:", error);
      return null;
    }
  }

  // Seleccionar imagen de la galería
  async seleccionarImagen(): Promise<string | null> {
    try {
      // Pedir permisos
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Necesitamos permisos para acceder a tus fotos");
        return null;
      }

      // Abrir selector de imágenes
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], // ✅ CORREGIDO: Usa ['image']
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      // Verificar si se canceló y si hay assets
      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        return resultado.assets[0].uri; // ✅ CORREGIDO: Accede a assets[0]
      }
      return null;
    } catch (error) {
      console.log("Error al seleccionar imagen:", error);
      return null;
    }
  }

  // NUEVA FUNCIÓN: Tomar una foto con la cámara
  async tomarFoto(): Promise<string | null> {
    try {
      // Pedir permisos para la cámara
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      if (cameraPermission.status !== "granted") {
        alert("Necesitamos permisos para usar la cámara");
        return null;
      }

      // Abrir la aplicación de cámara
    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], // ✅ CORREGIDO: Usa ['image']
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

      // Verificar si se canceló y si hay assets
      if (!resultado.canceled && resultado.assets && resultado.assets.length > 0) {
        return resultado.assets[0].uri; // ✅ CORREGIDO: Accede a assets[0]
      }
      return null;
    } catch (error) {
      console.log("Error al tomar foto:", error);
      return null;
    }
  }
}