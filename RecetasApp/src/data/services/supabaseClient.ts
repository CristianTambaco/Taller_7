import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage"; //

// Obtenemos las credenciales desde las variables de entorno
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Validamos que las variables de entorno estén configuradas
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Faltan las variables de entorno EXPO_PUBLIC_SUPABASE_URL o EXPO_PUBLIC_SUPABASE_ANON_KEY. " +
    "Asegúrate de tener un archivo .env con estas variables configuradas."
  );
}

// Definimos el objeto de almacenamiento personalizado
const supabaseStorage = {
  getItem: (key: string) => {
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    return AsyncStorage.removeItem(key);
  },
};


// Creamos el cliente de Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // No usamos AsyncStorage 
    storage: supabaseStorage,
    // Refrescar token automáticamente cuando expire
    autoRefreshToken: true,
    // NO persistir sesión (se pierde al cerrar app)
    persistSession: true,
    // NO detectar sesión en URL (para web)
    detectSessionInUrl: true,
  },
});
