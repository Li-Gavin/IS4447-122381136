import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { db } from '@/db/client';
import { habits, categories } from '@/db/schema';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/hooks/useTheme';

export default function AddHabit() {
  const router = useRouter();
  const { theme } = useTheme();

  const bgColor = theme === 'dark' ? '#111' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryList, setCategoryList] = useState<any[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await db.select().from(categories);
    setCategoryList(result);

    if (result.length > 0) {
      setCategoryId(result[0].id);
    }
  };

  const saveHabit = async () => {
    if (!name.trim() || !categoryId) return;

    await db.insert(habits).values({
      name,
      categoryId,
    });

    router.back();
  };

  return (
    <View style={{ padding: 20, backgroundColor: bgColor, flex: 1 }}>
      <Text style={{ fontSize: 22, color: textColor }}>
        Add Habit
      </Text>

      {/* 🔹 Habit Name */}
      <TextInput
        placeholder="Habit name"
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

      {/* 🔹 Category */}
      <Text style={{ marginTop: 15, color: textColor }}>
        Select Category:
      </Text>

      <Picker
        selectedValue={categoryId}
        onValueChange={(itemValue) => setCategoryId(itemValue)}
        style={{
          color: textColor,
          backgroundColor: theme === 'dark' ? '#222' : '#fff',
        }}
      >
        {categoryList.map((cat) => (
          <Picker.Item
            key={cat.id}
            label={cat.name}
            value={cat.id}
            color={textColor}
          />
        ))}
      </Picker>

      {/* ➕ Add Category */}
      <View style={{ marginTop: 10 }}>
        <Button
          title="Add New Category"
          onPress={() => router.push('/add-category')}
        />
      </View>

      {/* 💾 Save */}
      <View style={{ marginTop: 10 }}>
        <Button title="Save Habit" onPress={saveHabit} />
      </View>

      {/* ❌ Cancel */}
      <View style={{ marginTop: 10 }}>
        <Button title="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}