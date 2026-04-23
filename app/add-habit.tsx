import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { db } from '@/db/client';
import { habits, categories } from '@/db/schema';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/hooks/useTheme';

export default function AddHabit() {
  const router = useRouter();
  const { theme } = useTheme();

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0A0A0F' : '#F4F3EF';
  const cardColor = isDark ? '#16161E' : '#FFFFFF';
  const textColor = isDark ? '#F0EFE9' : '#1A1916';
  const subTextColor = isDark ? '#7A7A8A' : '#8A8880';
  const borderColor = isDark ? '#2A2A3A' : '#E2E0DC';
  const accentColor = '#5B4FE9';
  const accent2Color = '#0EA875';

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const result = await db.select().from(categories);
    setCategoryList(result);
    if (result.length > 0) setCategoryId(result[0].id);
  };

  const saveHabit = async () => {
    if (!name.trim() || !categoryId) return;
    await db.insert(habits).values({ name, categoryId });
    router.back();
  };

  const selectedCategory = categoryList.find(c => c.id === categoryId);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: bgColor }}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{ paddingHorizontal: 24, paddingTop: 64, paddingBottom: 28 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24, alignSelf: 'flex-start' }}
          >
            <Text style={{ fontSize: 18, color: subTextColor, marginRight: 6 }}>‹</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: subTextColor }}>Back</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 13, fontWeight: '600', color: subTextColor, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            New
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: textColor, letterSpacing: -1 }}>
            Add Habit
          </Text>
        </View>

        <View style={{ paddingHorizontal: 24, flex: 1 }}>

          {/* ── Habit Name ── */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: subTextColor, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Habit Name
          </Text>
          <TextInput
            placeholder="e.g. Morning Run, Read 20 pages..."
            value={name}
            onChangeText={setName}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            placeholderTextColor={isDark ? '#3A3A4A' : '#B0AEA8'}
            style={{
              backgroundColor: isDark
                ? focusedField === 'name' ? '#1C1C28' : '#141420'
                : focusedField === 'name' ? '#F8F7FF' : cardColor,
              borderWidth: 1.5,
              borderColor: focusedField === 'name' ? accentColor : borderColor,
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 15,
              color: textColor,
              fontSize: 15,
              marginBottom: 24,
            }}
          />

          {/* ── Category Picker ── */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: subTextColor, letterSpacing: 1, textTransform: 'uppercase' }}>
              Category
            </Text>
            <TouchableOpacity onPress={() => router.push('/add-category')}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: accentColor }}>＋ New Category</Text>
            </TouchableOpacity>
          </View>

          {categoryList.length === 0 ? (
            <TouchableOpacity
              onPress={() => router.push('/add-category')}
              style={{
                backgroundColor: cardColor,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: borderColor,
                borderStyle: 'dashed',
                padding: 20,
                alignItems: 'center',
                marginBottom: 24,
              }}
            >
              <Text style={{ fontSize: 24, marginBottom: 8 }}>🗂️</Text>
              <Text style={{ fontSize: 14, fontWeight: '600', color: subTextColor }}>No categories yet</Text>
              <Text style={{ fontSize: 12, color: subTextColor, marginTop: 4 }}>Tap to create one first</Text>
            </TouchableOpacity>
          ) : (
            <View style={{
              backgroundColor: cardColor,
              borderRadius: 14,
              borderWidth: 1.5,
              borderColor: borderColor,
              marginBottom: 24,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: isDark ? 0.3 : 0.05,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <Picker
                selectedValue={categoryId}
                onValueChange={(v) => setCategoryId(v)}
                style={{ color: textColor, height: 52 }}
                mode="dropdown"
              >
                {categoryList.map(cat => (
                  <Picker.Item key={cat.id} label={cat.name} value={cat.id} color="#000000" />
                ))}
              </Picker>
            </View>
          )}

          {/* ── Preview card ── */}
          {name.trim() !== '' && selectedCategory && (
            <View style={{
              backgroundColor: cardColor,
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 28,
              borderWidth: 1,
              borderColor: borderColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: isDark ? 0.3 : 0.05,
              shadowRadius: 8,
              elevation: 3,
            }}>
              <View style={{
                width: 44,
                height: 44,
                borderRadius: 13,
                backgroundColor: (selectedCategory.color || accentColor) + '33',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
                <Text style={{ fontSize: 20 }}>🌱</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: subTextColor, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>
                  Preview
                </Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: textColor }}>{name}</Text>
                <Text style={{ fontSize: 12, color: subTextColor, marginTop: 1 }}>{selectedCategory.name}</Text>
              </View>
            </View>
          )}

          {/* ── Save ── */}
          <TouchableOpacity
            onPress={saveHabit}
            style={{
              backgroundColor: accent2Color,
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              marginBottom: 12,
              shadowColor: accent2Color,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 12,
              elevation: 6,
              opacity: !name.trim() || !categoryId ? 0.5 : 1,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 }}>
              Save Habit
            </Text>
          </TouchableOpacity>

          {/* ── Cancel ── */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: borderColor,
              marginBottom: 40,
            }}
          >
            <Text style={{ color: subTextColor, fontWeight: '700', fontSize: 15 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}