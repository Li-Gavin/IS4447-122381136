import { View, Text, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import { db } from '@/db/client';
import { users } from '@/db/schema';


// following code has been modified from the claude conversation linked below.
// https://claude.ai/share/74bf0489-2821-4003-b8d9-a738845692c7
// This code defines a ProfileScreen component that displays user profile information and settings. It includes a header with an avatar and profile title, a preferences card for toggling between light and dark themes, and an account card with options to log out or delete the account. The delete account option prompts the user for confirmation before permanently deleting their data from the database. The screen also adapts its colors based on the current theme.
export default function ProfileScreen() {
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0A0A0F' : '#F4F3EF';
  const cardColor = isDark ? '#16161E' : '#FFFFFF';
  const surfaceColor = isDark ? '#1E1E2A' : '#EEECEA';
  const textColor = isDark ? '#F0EFE9' : '#1A1916';
  const subTextColor = isDark ? '#7A7A8A' : '#8A8880';
  const borderColor = isDark ? '#2A2A3A' : '#E2E0DC';
  const accentColor = '#5B4FE9';

  // Confirm before deleting account and all data
  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await db.delete(users);
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/*header */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 64,
        paddingBottom: 32,
        alignItems: 'center',
      }}>
  
        <View style={{
          width: 84,
          height: 84,
          borderRadius: 26,
          backgroundColor: isDark ? '#1A1A2E' : '#EDE9FE',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
          borderWidth: 1.5,
          borderColor: accentColor + '44',
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 12,
          elevation: 5,
        }}>
          <Text style={{ fontSize: 38 }}>🌱</Text>
        </View>

        <Text style={{ fontSize: 22, fontWeight: '800', color: textColor, letterSpacing: -0.5 }}>
          My Profile
        </Text>
        <Text style={{ fontSize: 13, color: subTextColor, marginTop: 4 }}>
          Manage your account & preferences
        </Text>
      </View>

      <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: subTextColor, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 10 }}>
          Preferences
        </Text>
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
          <TouchableOpacity
            onPress={toggleTheme}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 18,
              paddingVertical: 16,
            }}
          >
            <View style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: isDark ? '#2A2A3A' : '#F0EDFF',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}>
              <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: textColor }}>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Text>
              <Text style={{ fontSize: 12, color: subTextColor, marginTop: 1 }}>
                Currently {isDark ? 'dark' : 'light'} theme
              </Text>
            </View>
            <Text style={{ color: subTextColor, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: subTextColor, letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 10 }}>
          Account
        </Text>
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

          <TouchableOpacity
            onPress={() => router.replace('/login')}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 18,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: borderColor,
            }}
          >
            <View style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: isDark ? '#2A2A3A' : '#FFF4E6',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}>
              <Text style={{ fontSize: 18 }}>🚪</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: textColor }}>
                Log Out
              </Text>
              <Text style={{ fontSize: 12, color: subTextColor, marginTop: 1 }}>
                Sign out of your account
              </Text>
            </View>
            <Text style={{ color: subTextColor, fontSize: 18 }}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={confirmDeleteAccount}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 18,
              paddingVertical: 16,
            }}
          >
            <View style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: '#2D1515',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}>
              <Text style={{ fontSize: 18 }}>🗑️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#EF4444' }}>
                Delete Account
              </Text>
              <Text style={{ fontSize: 12, color: subTextColor, marginTop: 1 }}>
                Permanently remove all your data
              </Text>
            </View>
            <Text style={{ color: subTextColor, fontSize: 18 }}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ alignItems: 'center', marginTop: 'auto', paddingBottom: 36 }}>
        <Text style={{ fontSize: 13, color: subTextColor }}>🌱 Bloom</Text>
        <Text style={{ fontSize: 11, color: borderColor, marginTop: 3 }}>v1.0.0</Text>
      </View>
    </View>
  );
}