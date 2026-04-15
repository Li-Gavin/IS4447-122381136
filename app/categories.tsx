import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

export default function CategoryList() {
  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await db.select().from(categories);
    setData(result);
  };

  const deleteCategory = async (id: number) => {
    await db.delete(categories).where(eq(categories.id, id));
    loadCategories();
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>Categories</Text>

      {data.map((cat) => (
        <View key={cat.id} style={{ marginTop: 10 }}>
          <Text>{cat.name}</Text>

          <Button
            title="Edit"
            onPress={() =>
              router.push(`/edit-category?id=${cat.id}`)
            }
          />

          <Button
            title="Delete"
            onPress={() => deleteCategory(cat.id)}
          />
        </View>
      ))}

      <Button title="Add Category" onPress={() => router.push('/add-category')} />
    </View>
  );
}