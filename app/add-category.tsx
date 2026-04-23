import { useState } from 'react';
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
import { categories } from '@/db/schema';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

const PRESET_COLORS = [
  '#5B4FE9', '#0EA875', '#F59E0B', '#EF4444',
  '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6',
];

export default function AddCategory() {
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0A0A0F' : '#F4F3EF';
  const cardColor = isDark ? '#16161E' : '#FFFFFF';
  const textColor = isDark ? '#F0EFE9' : '#1A1916';
  const subTextColor = isDark ? '#7A7A8A' : '#8A8880';
  const borderColor = isDark ? '#2A2A3A' : '#E2E0DC';
  const accentColor = '#5B4FE9';
  const accent2Color = '#0EA875';

  const selectedColor = color || accentColor;

  const saveCategory = async () => {
    if (!name.trim() || !color.trim()) return;
    await db.insert(categories).values({ name, color });
    router.back();
  };

  const inputStyle = (field: string) => ({
    backgroundColor: isDark
      ? focusedField === field ? '#1C1C28' : '#141420'
      : focusedField === field ? '#F8F7FF' : cardColor,
    borderWidth: 1.5,
    borderColor: focusedField === field ? accentColor : borderColor,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: textColor,
    fontSize: 15,
    marginBottom: 14,
  });

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
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 24,
              alignSelf: 'flex-start',
            }}
          >
            <Text style={{ fontSize: 18, color: subTextColor, marginRight: 6 }}>‹</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: subTextColor }}>Back</Text>
          </TouchableOpacity>

          <Text style={{ fontSize: 13, fontWeight: '600', color: subTextColor, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
            New
          </Text>
          <Text style={{ fontSize: 32, fontWeight: '800', color: textColor, letterSpacing: -1 }}>
            Add Category
          </Text>
        </View>

        {/* Form */}
        <View style={{ paddingHorizontal: 24, flex: 1 }}>

          {/* Name */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: subTextColor, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Category Name
          </Text>
          <TextInput
            placeholder="e.g. Fitness, Reading..."
            value={name}
            onChangeText={setName}
            onFocus={() => setFocusedField('name')}
            onBlur={() => setFocusedField(null)}
            placeholderTextColor={isDark ? '#3A3A4A' : '#B0AEA8'}
            style={inputStyle('name')}
          />

          {/* Color */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: subTextColor, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Colour
          </Text>

          {/* Preset swatches */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
            {PRESET_COLORS.map(c => (
              <TouchableOpacity
                key={c}
                onPress={() => setColor(c)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: c,
                  borderWidth: color === c ? 2.5 : 0,
                  borderColor: '#fff',
                  shadowColor: c,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: color === c ? 0.5 : 0,
                  shadowRadius: 6,
                  elevation: color === c ? 4 : 0,
                }}
              />
            ))}
          </View>

          {/* Manual hex input */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDark
              ? focusedField === 'color' ? '#1C1C28' : '#141420'
              : focusedField === 'color' ? '#F8F7FF' : cardColor,
            borderWidth: 1.5,
            borderColor: focusedField === 'color' ? accentColor : borderColor,
            borderRadius: 14,
            paddingHorizontal: 14,
            marginBottom: 28,
          }}>
            {/* Live preview dot */}
            <View style={{
              width: 22,
              height: 22,
              borderRadius: 7,
              backgroundColor: selectedColor,
              marginRight: 12,
              borderWidth: 1,
              borderColor: borderColor,
            }} />
            <TextInput
              placeholder="#22C55E"
              value={color}
              onChangeText={setColor}
              onFocus={() => setFocusedField('color')}
              onBlur={() => setFocusedField(null)}
              autoCapitalize="none"
              placeholderTextColor={isDark ? '#3A3A4A' : '#B0AEA8'}
              style={{ flex: 1, paddingVertical: 15, color: textColor, fontSize: 15 }}
            />
          </View>

          {/* Preview card */}
          {name.trim() !== '' && (
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
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: selectedColor + '33',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}>
                <View style={{ width: 16, height: 16, borderRadius: 5, backgroundColor: selectedColor }} />
              </View>
              <View>
                <Text style={{ fontSize: 11, color: subTextColor, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 }}>Preview</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: textColor }}>{name}</Text>
              </View>
            </View>
          )}

          {/* Save button */}
          <TouchableOpacity
            onPress={saveCategory}
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
              opacity: !name.trim() || !color.trim() ? 0.5 : 1,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 }}>
              Save Category
            </Text>
          </TouchableOpacity>

          {/* Cancel */}
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