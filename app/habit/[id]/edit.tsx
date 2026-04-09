import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, TextInput, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { db } from '@/db/client';
import { habits } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default function EditHabit() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [name, setName] = useState('');

  useEffect(() => {
    loadHabit();
  }, []);

  const loadHabit = async () => {
    const result = await db
      .select()
      .from(habits)
      .where(eq(habits.id, Number(id)));

    setName(result[0].name);
  };

  const saveChanges = async () => {
    await db
      .update(habits)
      .set({ name })
      .where(eq(habits.id, Number(id)));

    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10 }}
      />

      <Button title="Save" onPress={saveChanges} />
    </View>
  );
}