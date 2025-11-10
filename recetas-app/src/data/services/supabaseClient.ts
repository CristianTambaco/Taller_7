import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

/**
 * Cliente de Supabase
 *
 * Este es el ÚNICO lugar donde configuramos la conexión a Supabase.
 * Todas las demás partes de la app importan este cliente.
 *
 * IMPORTANTE: El polyfill DEBE importarse ANTES de createClient
 */

// Obtener credenciales de variables de entorno
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validar que las credenciales existan
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "❌ ERROR: Faltan variables de entorno.\n\n" +
    "Asegúrate de tener un archivo .env con:\n" +
    "- EXPO_PUBLIC_SUPABASE_URL\n" +
    "- EXPO_PUBLIC_SUPABASE_ANON_KEY\n\n" +
    "Revisa .env.example para ver el formato correcto."
  );
}

/**
 * Crear cliente de Supabase con configuración personalizada
 */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    
    storage: undefined,

    // Refrescar token automáticamente cuando expire
    autoRefreshToken: true,

    // NO persistir sesión (se pierde al cerrar app)
    persistSession: false,

    // NO detectar sesión en URL (para web)
    detectSessionInUrl: false,
  },
});
