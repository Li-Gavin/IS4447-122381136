import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { db } from '@/db/client';
import { categories } from '@/db/schema';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';
import { useTheme } from '@/hooks/useTheme';

export default function CategoryList() {
  const { theme } = useTheme();
  const router = useRouter();

  const [data, setData] = useState<any[]>([]);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0A0A0F' : '#F4F3EF';
  const cardColor = isDark ? '#16161E' : '#FFFFFF';
  const textColor = isDark ? '#F0EFE9' : '#1A1916';
  const subTextColor = isDark ? '#7A7A8A' : '#8A8880';
  const borderColor = isDark ? '#2A2A3A' : '#E2E0DC';
  const accentColor = '#5B4FE9';
  const accent2Color = '#0EA875';

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await db.select().from(categories);
    setData(result);
  };

  const confirmDelete = (id: number, name: string) => {
    Alert.alert(
      'Delete Category',
      `Remove "${name}"? Habits in this category won't be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await db.delete(categories).where(eq(categories.id, id));
            loadCategories();
          },
        },
      ]
    );
  };

  // Emoji palette cycled by index for visual variety
  const categoryEmojis = ['📁', '⭐', '💪', '📚', '🧘', '🎯', '🌿', '🔥'];

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* ── Header ── */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 20,
      }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: subTextColor, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
          Organise
        </Text>
        <Text style={{ fontSize: 32, fontWeight: '800', color: textColor, letterSpacing: -1 }}>
          Categories
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section label + count ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 11, fontWeight: '700', color: subTextColor, letterSpacing: 1.3, textTransform: 'uppercase' }}>
            All Categories
          </Text>
          <View style={{ backgroundColor: accentColor + '22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: accentColor }}>{data.length}</Text>
          </View>
        </View>

        {/* ── Empty state ── */}
        {data.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🗂️</Text>
            <Text style={{ color: textColor, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>
              No categories yet
            </Text>
            <Text style={{ color: subTextColor, fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
              Create categories to organise{'\n'}your habits more easily.
            </Text>
          </View>
        ) : (
          <View style={{
            backgroundColor: cardColor,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: borderColor,
            overflow: 'hidden',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.05,
            shadowRadius: 8,
            elevation: 3,
          }}>
            {data.map((cat, index) => (
              <View
                key={cat.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  borderBottomWidth: index < data.length - 1 ? 1 : 0,
                  borderBottomColor: borderColor,
                }}
              >
                {/* Icon */}
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: isDark ? '#2A2A3A' : '#F0EDFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}>
                  <Text style={{ fontSize: 18 }}>
                    {categoryEmojis[index % categoryEmojis.length]}
                  </Text>
                </View>

                {/* Name */}
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: textColor }}>
                  {cat.name}
                </Text>

                {/* Edit */}
                <TouchableOpacity
                  onPress={() => router.push(`/edit-category?id=${cat.id}`)}
                  style={{
                    backgroundColor: isDark ? '#2A2A3A' : '#F0EDFF',
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 10,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: accentColor }}>Edit</Text>
                </TouchableOpacity>

                {/* Delete */}
                <TouchableOpacity
                  onPress={() => confirmDelete(cat.id, cat.name)}
                  style={{
                    backgroundColor: isDark ? '#2D1515' : '#FEE2E2',
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#EF4444' }}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── Add Category FAB ── */}
      <View style={{
        position: 'absolute',
        bottom: 32,
        left: 24,
        right: 24,
      }}>
        <TouchableOpacity
          onPress={() => router.push('/add-category')}
          style={{
            backgroundColor: accent2Color,
            padding: 16,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            shadowColor: accent2Color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 20 }}>＋</Text>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 }}>
            Add Category
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}