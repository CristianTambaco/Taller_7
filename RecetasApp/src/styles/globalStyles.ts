import { StyleSheet } from "react-native";
import { borderRadius, colors, fontSize, shadows, spacing } from "./theme";

// Estilos que se usan en toda la app
export const globalStyles = StyleSheet.create({
  // Contenedores
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  containerCentered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  contentPadding: {
    padding: spacing.lg,
  },

  // Inputs
  input: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    fontSize: fontSize.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },

  inputMultiline: {
    height: 100,
    textAlignVertical: "top",
  },

  // Botones
  button: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonPrimary: {
    backgroundColor: colors.primary,
  },

  buttonSecondary: {
    backgroundColor: colors.secondary,
  },

  buttonDanger: {
    backgroundColor: colors.danger,
  },

  buttonText: {
    color: colors.white,
    fontSize: fontSize.md,
    fontWeight: "bold",
  },

  // Tarjetas
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },

  cardImage: {
    width: "100%",
    height: 200,
    borderRadius: borderRadius.md,
  },

  // Textos
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "bold",
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },

  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.textPrimary,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },

  textPrimary: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },

  textSecondary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  textTertiary: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
  },

  // Headers
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  // Chips/Tags
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 3,
    borderRadius: borderRadius.xl,
    gap: spacing.xs + 3,
  },

  chipText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },

  // Mensajes vacíos
  emptyState: {
    textAlign: "center",
    marginTop: spacing.xxl + 10,
    fontSize: fontSize.md,
    color: colors.textTertiary,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
});
