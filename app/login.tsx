import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { db } from '@/db/client';
import { users } from '@/db/schema';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (result.length === 0) {
      alert('User not found');
      return;
    }

    if (result[0].password !== password) {
      alert('Incorrect password');
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginTop: 10, padding: 10 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginTop: 10, padding: 10 }}
      />

      <Button title="Login" onPress={handleLogin} />

      <Button title="Register" onPress={() => router.push('/register')} />
    </View>
  );
}