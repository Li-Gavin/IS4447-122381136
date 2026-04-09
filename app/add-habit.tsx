import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { db } from '@/db/client';
import { habits, categories } from '@/db/schema';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function AddHabit() {
  const router = useRouter();

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
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Add Habit</Text>

      {/* 🔹 Name */}
      <TextInput
        placeholder="Habit name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
        }}
      />

      {/* Category Dropdown */}
      <Text style={{ marginTop: 15 }}>Select Category:</Text>

      <Picker
        selectedValue={categoryId}
        onValueChange={(itemValue) => setCategoryId(itemValue)}
      >
        {categoryList.map((cat) => (
          <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
        ))}
      </Picker>

      <Button
        title="Add New Category"
        onPress={() => router.push('/add-category')}
    />

      {/* Save */}
      <Button title="Save Habit" onPress={saveHabit} />

      <View style={{ marginTop: 10 }}>
        <Button title="Cancel" onPress={() => router.back()} />
      </View>
    </View>
  );
}