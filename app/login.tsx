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
import { users } from '@/db/schema';
import { useRouter } from 'expo-router';
import { eq } from 'drizzle-orm';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (result.length === 0) {
      alert('User not found');
      return;
    }

    if (result[0].password !== password) {
      alert('Incorrect password');
      return;
    }

    router.replace('/(tabs)');
  };

  const inputStyle = (field: string) => ({
    backgroundColor: focusedField === field ? '#1C1C28' : '#141420',
    borderWidth: 1.5,
    borderColor: focusedField === field ? '#5B4FE9' : '#2A2A3A',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: '#F0EFE9',
    fontSize: 15,
    marginBottom: 14,
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#0A0A0F' }}
    >
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Top decorative area */}
        <View style={{
          height: 260,
          backgroundColor: '#0A0A0F',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 32,
          overflow: 'hidden',
        }}>
          {/* Glow blob */}
          <View style={{
            position: 'absolute',
            top: -60,
            left: '50%',
            marginLeft: -120,
            width: 240,
            height: 240,
            borderRadius: 120,
            backgroundColor: '#5B4FE9',
            opacity: 0.15,
          }} />
          <View style={{
            position: 'absolute',
            top: 20,
            left: '50%',
            marginLeft: -80,
            width: 160,
            height: 160,
            borderRadius: 80,
            backgroundColor: '#0EA875',
            opacity: 0.08,
          }} />

          {/* Logo */}
          <View style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            backgroundColor: '#16161E',
            borderWidth: 1.5,
            borderColor: '#2A2A3A',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
            shadowColor: '#5B4FE9',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 8,
          }}>
            <Text style={{ fontSize: 34 }}>🌱</Text>
          </View>

          <Text style={{
            fontSize: 32,
            fontWeight: '800',
            color: '#F0EFE9',
            letterSpacing: -1,
          }}>
            Bloom
          </Text>
          <Text style={{
            fontSize: 13,
            color: '#5A5A6A',
            marginTop: 4,
            letterSpacing: 0.3,
          }}>
            Build habits. Grow daily.
          </Text>
        </View>

        {/* Form card */}
        <View style={{
          flex: 1,
          backgroundColor: '#0E0E18',
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          paddingHorizontal: 28,
          paddingTop: 36,
          paddingBottom: 40,
          borderTopWidth: 1,
          borderTopColor: '#1E1E2A',
        }}>
          <Text style={{
            fontSize: 22,
            fontWeight: '700',
            color: '#F0EFE9',
            marginBottom: 6,
            letterSpacing: -0.5,
          }}>
            Welcome back
          </Text>
          <Text style={{
            fontSize: 14,
            color: '#5A5A6A',
            marginBottom: 28,
          }}>
            Sign in to continue your streak
          </Text>

          {/* Email */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#7A7A8A', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Email
          </Text>
          <TextInput
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#3A3A4A"
            style={inputStyle('email')}
          />

          {/* Password */}
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#7A7A8A', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
            Password
          </Text>
          <View style={{ position: 'relative', marginBottom: 8 }}>
            <TextInput
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              secureTextEntry={!showPassword}
              placeholderTextColor="#3A3A4A"
              style={[inputStyle('password'), { paddingRight: 52 }]}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 16,
                top: 0,
                bottom: 14,
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            onPress={handleLogin}
            style={{
              backgroundColor: '#5B4FE9',
              borderRadius: 14,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 20,
              marginBottom: 12,
              shadowColor: '#5B4FE9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.45,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 }}>
              Sign In
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: '#1E1E2A' }} />
            <Text style={{ color: '#3A3A4A', marginHorizontal: 14, fontSize: 12 }}>or</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: '#1E1E2A' }} />
          </View>

          {/* Register button */}
          <TouchableOpacity
            onPress={() => router.push('/register')}
            style={{
              backgroundColor: 'transparent',
              borderRadius: 14,
              paddingVertical: 15,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: '#2A2A3A',
            }}
          >
            <Text style={{ color: '#7A7A8A', fontWeight: '700', fontSize: 15 }}>
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}