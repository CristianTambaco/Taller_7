import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image, // <-- Importar Image
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../src/presentation/hooks/useAuth";
import { useRecipes } from "../../src/presentation/hooks/useRecipes";
import { globalStyles } from "../../src/styles/globalStyles";
import { colors, fontSize, spacing, borderRadius } from "../../src/styles/theme";

export default function EditarRecetaScreen() {
  const { id } = useLocalSearchParams();
  const { usuario } = useAuth();
  // --- EXTRAER LAS FUNCIONES DE useRecipes DIRECTAMENTE ---
  const { recetas, actualizar, seleccionarImagen, tomarFoto } = useRecipes();
  // --- FIN EXTRACCIÓN ---
  const router = useRouter();
  const receta = recetas.find((r) => r.id === id);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [ingrediente, setIngrediente] = useState("");
  const [ingredientes, setIngredientes] = useState<string[]>([]);
  // --- NUEVO ESTADO PARA IMAGEN ---
  const [imagenActual, setImagenActual] = useState<string | null>(null); // URL actual
  const [nuevaImagenUri, setNuevaImagenUri] = useState<string | null>(null); // URI de la nueva imagen
  // --- FIN NUEVO ESTADO ---
  const [cargando, setCargando] = useState(false);

  // Cargar datos de la receta al iniciar
  useEffect(() => {
    if (receta) {
      setTitulo(receta.titulo);
      setDescripcion(receta.descripcion);
      setIngredientes(receta.ingredientes);
      setImagenActual(receta.imagen_url || null); // Establece la imagen actual
    }
  }, [receta]);

  // Validar que el usuario es el dueño
  if (!receta) {
    return (
      <View style={globalStyles.containerCentered}>
        <Text style={globalStyles.textSecondary}>Receta no encontrada</Text>
      </View>
    );
  }
  if (receta.chef_id !== usuario?.id) {
    return (
      <View style={globalStyles.containerCentered}>
        <Text style={styles.textoError}>
          No tienes permiso para editar esta receta
        </Text>
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonPrimary]}
          onPress={() => router.back()}
        >
          <Text style={globalStyles.buttonText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const agregarIngrediente = () => {
    if (ingrediente.trim()) {
      setIngredientes([...ingredientes, ingrediente.trim()]);
      setIngrediente("");
    }
  };

  const quitarIngrediente = (index: number) => {
    setIngredientes(ingredientes.filter((_, i) => i !== index));
  };

  // --- FUNCIÓN PARA SELECCIONAR NUEVA IMAGEN ---
  const handleSeleccionarImagen = async () => {
    Alert.alert(
      "Cambiar Foto",
      "¿De dónde deseas obtener la nueva imagen?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Galería",
          onPress: async () => {
            const uri = await seleccionarImagen(); // ✅ Ahora usamos la función extraída
            if (uri) {
              setNuevaImagenUri(uri);
            }
          }
        },
        {
          text: "Cámara",
          onPress: async () => {
            const uri = await tomarFoto(); // ✅ Ahora usamos la función extraída
            if (uri) {
              setNuevaImagenUri(uri);
            }
          }
        }
      ]
    );
  };
  // --- FIN FUNCIÓN ---

  const handleGuardar = async () => {
    if (!titulo || !descripcion || ingredientes.length === 0) {
      Alert.alert("Error", "Completa todos los campos");
      return;
    }

    setCargando(true);
    // Determinar qué imagen enviar
    const imagenParaActualizar = nuevaImagenUri || (nuevaImagenUri === null ? null : imagenActual); // Si se quitó la imagen, enviar null

    const resultado = await actualizar(
      receta.id,
      titulo,
      descripcion,
      ingredientes,
      imagenParaActualizar // <-- Pasar la imagen al caso de uso
    );
    setCargando(false);

    if (resultado.success) {
      Alert.alert("Éxito", "Receta actualizada correctamente", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } else {
      Alert.alert("Error", resultado.error || "No se pudo actualizar");
    }
  };

  return (
    <ScrollView style={globalStyles.container}>
      <View style={globalStyles.contentPadding}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.botonVolver}>← Cancelar</Text>
          </TouchableOpacity>
          <Text style={globalStyles.title}>Editar Receta</Text>
        </View>
        <TextInput
          style={globalStyles.input}
          placeholder="Título de la receta"
          value={titulo}
          onChangeText={setTitulo}
        />
        <TextInput
          style={[globalStyles.input, globalStyles.inputMultiline]}
          placeholder="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          numberOfLines={4}
        />
        <Text style={globalStyles.subtitle}>Ingredientes:</Text>
        <View style={styles.contenedorIngrediente}>
          <TextInput
            style={[globalStyles.input, styles.inputIngrediente]}
            placeholder="Ej: Tomate"
            value={ingrediente}
            onChangeText={setIngrediente}
            onSubmitEditing={agregarIngrediente}
          />
          <TouchableOpacity
            style={[
              globalStyles.button,
              globalStyles.buttonPrimary,
              styles.botonAgregar,
            ]}
            onPress={agregarIngrediente}
          >
            <Text style={styles.textoAgregar}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.listaIngredientes}>
          {ingredientes.map((ing, index) => (
            <View key={index} style={globalStyles.chip}>
              <Text style={globalStyles.chipText}>{ing}</Text>
              <TouchableOpacity onPress={() => quitarIngrediente(index)}>
                <Text style={styles.textoEliminar}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* --- MOSTRAR IMAGEN ACTUAL Y PERMITIR CAMBIARLA --- */}
        {(imagenActual || nuevaImagenUri) && (
          <Image source={{ uri: nuevaImagenUri || imagenActual! }} style={styles.vistaPrevia} />
        )}
        <TouchableOpacity
          style={[globalStyles.button, globalStyles.buttonSecondary]}
          onPress={handleSeleccionarImagen}
        >
          <Text style={globalStyles.buttonText}>
            {imagenActual || nuevaImagenUri ? "📷 Cambiar Foto" : "📷 Agregar Foto"}
          </Text>
        </TouchableOpacity>
        {imagenActual && nuevaImagenUri && ( // Mostrar botón para quitar la nueva selección si hay una actual
          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonDanger, styles.botonQuitarImagen]}
            onPress={() => setNuevaImagenUri(null)} // Volver a la imagen original
          >
            <Text style={globalStyles.buttonText}>🗑️ Quitar Nueva Foto</Text>
          </TouchableOpacity>
        )}
        {/* --- FIN IMAGEN --- */}

        <TouchableOpacity
          style={[
            globalStyles.button,
            globalStyles.buttonPrimary,
            styles.botonGuardar,
          ]}
          onPress={handleGuardar}
          disabled={cargando}
        >
          {cargando ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={globalStyles.buttonText}>Guardar Cambios</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: spacing.lg,
  },
  botonVolver: {
    fontSize: fontSize.md,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  textoError: {
    fontSize: fontSize.lg,
    color: colors.danger,
    textAlign: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  contenedorIngrediente: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  inputIngrediente: {
    flex: 1,
    marginBottom: 0,
  },
  botonAgregar: {
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  textoAgregar: {
    color: colors.white,
    fontSize: fontSize.xl,
    fontWeight: "bold",
  },
  listaIngredientes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  textoEliminar: {
    color: colors.primary,
    fontSize: fontSize.lg,
    fontWeight: "bold",
  },
  vistaPrevia: { // <-- Estilo para la vista previa de la imagen
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
    marginVertical: spacing.md,
  },
  botonQuitarImagen: { // <-- Estilo para el botón de quitar imagen
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  botonGuardar: {
    padding: spacing.lg,
  },
});