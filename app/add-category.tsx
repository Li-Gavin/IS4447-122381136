import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { useRouter } from 'expo-router';

export default function AddCategory() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  const saveCategory = async () => {
    if (!name.trim() || !color.trim()) return;

    await db.insert(categories).values({
      name,
      color,
    });

    router.back();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Add Category</Text>

      {/* Category Name */}
      <TextInput
        placeholder="Category name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
        }}
      />

      {/* Color */}
      <TextInput
        placeholder="Color (e.g. #22C55E)"
        value={color}
        onChangeText={setColor}
        style={{
          borderWidth: 1,
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
        }}
      />

      {/* Save */}
      <Button title="Save Category" onPress={saveCategory} />

      {/* Cancel */}
      <View style={{ marginTop: 10 }}>
        <Button title="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}