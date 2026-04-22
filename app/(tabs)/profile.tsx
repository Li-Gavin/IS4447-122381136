import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { db } from '@/db/client';
import { users } from '@/db/schema';

export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const bgColor = theme === 'dark' ? '#0B0B0B' : '#F8F9FB';
  const textColor = theme === 'dark' ? '#fff' : '#000';

  const ButtonUI = ({ title, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#2563EB',
        padding: 14,
        borderRadius: 10,
        marginBottom: 12,
      }}
    >
      <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: bgColor }}>
      <Text style={{ fontSize: 26, fontWeight: 'bold', color: textColor, marginBottom: 20 }}>
        Profile
      </Text>

      <ButtonUI
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        onPress={toggleTheme}
      />

      <ButtonUI title="Logout" onPress={() => router.replace('/login')} />

      <ButtonUI
        title="Delete Account"
        onPress={async () => {
          await db.delete(users);
          router.replace('/login');
        }}
      />
    </View>
  );
}