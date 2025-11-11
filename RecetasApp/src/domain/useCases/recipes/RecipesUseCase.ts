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

  // Actualizar receta existente - MODIFICADO para manejar imagen
  // Actualizar receta existente - MODIFICADO para manejar imagen y errores mejor
  async actualizarReceta(
    id: string,
    titulo: string,
    descripcion: string,
    ingredientes: string[],
    nuevaImagenUri?: string | null // <-- Nueva imagen, puede ser una URI o null para quitarla
  ) {
    try {
      let imagenUrlActual = null;
      let imagenUrlNueva = null;

      console.log("🔄 Iniciando actualización de receta con ID:", id);
      console.log("🖼️ Nueva imagen URI proporcionada:", nuevaImagenUri);

      // 1. Obtener la URL actual de la imagen desde la base de datos
      const { data: recetaActual, error: errorSelect } = await supabase
        .from("recetas")
        .select("imagen_url")
        .eq("id", id)
        .single();

      if (errorSelect) {
        console.error("❌ Error al obtener receta actual para actualizar imagen:", errorSelect);
        throw new Error(`Error al obtener receta: ${errorSelect.message}`);
      }

      imagenUrlActual = recetaActual.imagen_url; // Puede ser null
      console.log("📄 Imagen URL actual en BD:", imagenUrlActual);

      // 2. Manejar la nueva imagen si se proporciona
      if (nuevaImagenUri) {
        console.log("📤 Subiendo nueva imagen...");
        // Subir la nueva imagen
        imagenUrlNueva = await this.subirImagen(nuevaImagenUri);
        if (!imagenUrlNueva) {
          throw new Error("Error al subir la nueva imagen.");
        }
        console.log("✅ Nueva imagen subida exitosamente. URL:", imagenUrlNueva);
      } else if (nuevaImagenUri === null && imagenUrlActual) {
        // Si nuevaImagenUri es null y había una imagen anterior, se eliminará
        console.log("🗑️ Se ha solicitado eliminar la imagen actual.");
        // No se asigna nada a imagenUrlNueva, quedará como undefined o null
        // Se manejará la eliminación después del update
      } else {
        // Si nuevaImagenUri no es null ni undefined, mantener la URL actual
        imagenUrlNueva = imagenUrlActual;
        console.log("🔁 Manteniendo la imagen actual.");
      }

      // 3. Actualizar los campos de la receta (menos la imagen por ahora)
      const { data: recetaActualizada, error: errorUpdate } = await supabase
        .from("recetas")
        .update({
          titulo,
          descripcion,
          ingredientes,
          // No actualizamos imagen_url aquí todavía
        })
        .eq("id", id)
        .select()
        .single();

      if (errorUpdate) {
        console.error("❌ Error al actualizar receta (sin imagen):", errorUpdate);
        throw new Error(`Error al actualizar receta: ${errorUpdate.message}`);
      }

      console.log("✅ Receta actualizada sin imagen. Datos:", recetaActualizada);

      // 4. Si se subió una nueva imagen o se quitó una existente, actualizar la imagen_url por separado
      if (imagenUrlNueva !== imagenUrlActual) {
        console.log("🖼️ Actualizando campo 'imagen_url' en la base de datos...");
        const { error: errorUpdateImage } = await supabase
          .from("recetas")
          .update({
            imagen_url: imagenUrlNueva // Será la nueva URL, o null si se quitó
          })
          .eq("id", id);

        if (errorUpdateImage) {
          console.error("❌ Error al actualizar URL de imagen:", errorUpdateImage);
          // Si falla actualizar la URL, podrías querer deshacer el update anterior o manejarlo
          throw new Error(`Error al actualizar URL de imagen: ${errorUpdateImage.message}`);
        }

        console.log("✅ Campo 'imagen_url' actualizado en la base de datos.");

        // 5. Si se subió una nueva imagen y existía una anterior, eliminar la anterior
        if (imagenUrlNueva && imagenUrlActual) {
          console.log("🗑️ Eliminando imagen anterior del almacenamiento...");
          const eliminacionExitosa = await this.eliminarImagen(imagenUrlActual); // Nueva función para eliminar
          if (!eliminacionExitosa) {
            console.warn("⚠️ No se pudo eliminar la imagen anterior, pero la actualización continúa.");
            // No lanzamos error aquí porque la receta ya está actualizada.
          } else {
            console.log("✅ Imagen anterior eliminada del almacenamiento.");
          }
        }
      }

      return { success: true, receta: recetaActualizada };

    } catch (error: any) {
      console.error("🚨 Error FATAL en actualizarReceta:", error);
      return { success: false, error: error.message || "Error desconocido al actualizar la receta." };
    }
  }

  // --- NUEVA FUNCIÓN PARA ELIMINAR IMAGEN ANTERIOR ---
  private async eliminarImagen(url: string): Promise<boolean> {
    try {
      console.log("🔎 Intentando eliminar imagen con URL:", url);

      // Extraer el nombre del archivo de la URL
      // Suponiendo que la URL es algo como 'https://...supabase.co/storage/v1/object/public/recetas-fotos/nombre-archivo.jpg'
      const partes = url.split('/');
      // El nombre del archivo debería ser el último segmento
      const nombreArchivo = partes[partes.length - 1];

      if (!nombreArchivo) {
        console.error("❌ No se pudo extraer el nombre del archivo de la URL:", url);
        return false;
      }

      console.log("📁 Nombre del archivo a eliminar:", nombreArchivo);

      const { error } = await supabase
        .storage
        .from("recetas-fotos") // Asegúrate que el bucket sea correcto
        .remove([nombreArchivo]);

      if (error) {
        console.error("❌ Error al eliminar imagen anterior:", error);
        return false;
      }

      console.log("✅ Imagen anterior eliminada exitosamente:", nombreArchivo);
      return true;

    } catch (error) {
      console.error("❌ Error inesperado al eliminar imagen anterior:", error);
      return false;
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
    console.log("📥 Iniciando proceso de subida de imagen desde URI:", uri);

    // Verificar que la URI no esté vacía
    if (!uri) {
      throw new Error("La URI de la imagen no puede estar vacía.");
    }

    // Obtener la extensión del archivo
    const extension = uri.split(".").pop();
    if (!extension) {
      throw new Error("No se pudo determinar la extensión del archivo a partir de la URI.");
    }

    const nombreArchivo = `${Date.now()}.${extension}`;
    console.log("🏷️ Nombre de archivo generado:", nombreArchivo);

    // Leer el archivo como base64
    console.log("📄 Leyendo archivo como base64...");
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: 'base64',
    });

    if (!base64) {
      throw new Error("No se pudo leer el contenido del archivo.");
    }

    // Crear un buffer a partir del base64 (esto es compatible)
    // Supabase Storage espera un ArrayBuffer o una cadena base64
    // Podemos enviarlo directamente como una cadena base64
    const fileData = base64; // Esto ya es una cadena base64

    // Subir a Supabase Storage
    console.log("📤 Subiendo archivo a Supabase Storage en el bucket 'recetas-fotos'...");

    // ⚠️ IMPORTANTE: Usamos el método upload de Supabase Storage
    // que acepta una cadena base64 si le pasamos el tipo de contenido adecuado.
    const { data, error } = await supabase.storage
      .from("recetas-fotos")
      .upload(nombreArchivo, fileData, {
        contentType: `image/${extension}`,
        upsert: true, // Opcional: sobrescribe si ya existe
      });

    if (error) {
      console.error("❌ Error durante la subida a Supabase Storage:", error);
      throw new Error(`Error de Supabase: ${error.message}`);
    }

    // Obtener la URL pública
    console.log("🔗 Obteniendo URL pública...");
    const { data: urlData } = supabase.storage
      .from("recetas-fotos")
      .getPublicUrl(nombreArchivo);

    if (!urlData?.publicUrl) {
      console.error("❌ No se pudo generar la URL pública para la imagen.");
      throw new Error("No se pudo generar la URL pública.");
    }

    console.log("✅ Imagen subida exitosamente. URL pública:", urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error("❌ Error FATAL al subir la imagen:", error);
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