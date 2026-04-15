import { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';
import { useTheme } from '@/hooks/useTheme';

export default function CategoryList() {
  const { theme } = useTheme();

  const [data, setData] = useState<any[]>([]);
  const router = useRouter();

  const bgColor = theme === 'dark' ? '#111' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';
  const cardColor = theme === 'dark' ? '#222' : '#f9f9f9';

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
    <View style={{ padding: 20, backgroundColor: bgColor, flex: 1 }}>
      <Text style={{ fontSize: 22, color: textColor }}>
        Categories
      </Text>

      {data.length === 0 ? (
        <Text style={{ marginTop: 20, color: textColor }}>
          No categories yet.
        </Text>
      ) : (
        data.map((cat) => (
          <View
            key={cat.id}
            style={{
              marginTop: 10,
              padding: 10,
              borderRadius: 8,
              backgroundColor: cardColor,
            }}
          >
            <Text style={{ color: textColor, fontSize: 16 }}>
              {cat.name}
            </Text>

            <View style={{ marginTop: 5 }}>
              <Button
                title="Edit"
                onPress={() =>
                  router.push(`/edit-category?id=${cat.id}`)
                }
              />
            </View>

            <View style={{ marginTop: 5 }}>
              <Button
                title="Delete"
                onPress={() => deleteCategory(cat.id)}
              />
            </View>
          </View>
        ))
      )}

      <View style={{ marginTop: 20 }}>
        <Button
          title="Add Category"
          onPress={() => router.push('/add-category')}
        />
      </View>
    </View>
  );
}