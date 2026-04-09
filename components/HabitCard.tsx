import { Text, View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function HabitCard({ habit }: any) {
  const router = useRouter();

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/habit/[id]',
          params: { id: habit.id.toString() },
        })
      }
      style={styles.card}
    >
      <Text style={styles.title}>{habit.name}</Text>
      <Text style={styles.subtitle}>
        Category ID: {habit.categoryId}
    </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: '#6B7280',
  },
});