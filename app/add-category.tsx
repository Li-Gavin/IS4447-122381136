import { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

export default function AddCategory() {
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  const bgColor = theme === 'dark' ? '#111' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';

  const saveCategory = async () => {
    if (!name.trim() || !color.trim()) return;

    await db.insert(categories).values({
      name,
      color,
    });

    router.back();
  };

  return (
    <View style={{ padding: 20, backgroundColor: bgColor, flex: 1 }}>
      <Text style={{ fontSize: 22, color: textColor }}>Add Category</Text>

      <TextInput
        placeholder="Category name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: theme === 'dark' ? '#555' : '#ccc',
          backgroundColor: theme === 'dark' ? '#222' : '#fff',
          color: textColor,
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
        }}
        placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
      />

      <TextInput
        placeholder="Color (e.g. #22C55E)"
        value={color}
        onChangeText={setColor}
        style={{
          borderWidth: 1,
          borderColor: theme === 'dark' ? '#555' : '#ccc',
          backgroundColor: theme === 'dark' ? '#222' : '#fff',
          color: textColor,
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
        }}
        placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
      />

      <Button title="Save Category" onPress={saveCategory} />

      <View style={{ marginTop: 10 }}>
        <Button title="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}