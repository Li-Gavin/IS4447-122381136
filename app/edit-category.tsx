import { useState, useEffect } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { eq } from 'drizzle-orm';
import { useTheme } from '@/hooks/useTheme';

export default function EditCategory() {
  const { theme } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [name, setName] = useState('');
  const [color, setColor] = useState('');

  const bgColor = theme === 'dark' ? '#111' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';

  useEffect(() => {
    loadCategory();
  }, []);

  const loadCategory = async () => {
    const result = await db
      .select()
      .from(categories)
      .where(eq(categories.id, Number(id)));

    if (result.length > 0) {
      setName(result[0].name);
      setColor(result[0].color);
    }
  };

  const saveCategory = async () => {
    await db
      .update(categories)
      .set({ name, color })
      .where(eq(categories.id, Number(id)));

    router.back();
  };

  return (
    <View style={{ padding: 20, backgroundColor: bgColor, flex: 1 }}>
      <Text style={{ fontSize: 22, color: textColor }}>Edit Category</Text>

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
        }}
        placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
      />

      <Button title="Save Changes" onPress={saveCategory} />

      <Button title="Cancel" onPress={() => router.back()} />
    </View>
  );
}