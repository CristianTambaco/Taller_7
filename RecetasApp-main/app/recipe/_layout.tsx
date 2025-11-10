import { Stack } from "expo-router";

export default function RecipeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="crear"
        options={{
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="editar"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
