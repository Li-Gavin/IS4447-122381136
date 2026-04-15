import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { db } from '@/db/client';
import { targets } from '@/db/schema';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function AddTarget() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [value, setValue] = useState('');

  const saveTarget = async () => {
    if (!value) {
      alert('Please enter a target value');
      return;
    }

    await db.insert(targets).values({
      habitId: Number(id),
      type: 'weekly',
      value: Number(value),
    });

    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Set Target</Text>

      <TextInput
        placeholder="Enter weekly target"
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          marginTop: 10,
          padding: 10,
        }}
      />

      <Button title="Save Target" onPress={saveTarget} />

      <View style={{ marginTop: 10 }}>
        <Button title="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}