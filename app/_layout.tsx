import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: true }}>
      {/* Auth screens */}
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />

      {/* Main app */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}