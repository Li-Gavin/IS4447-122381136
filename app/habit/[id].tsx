import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Button, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { db } from '@/db/client';
import { habits, habitLogs, targets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useTheme } from '@/hooks/useTheme';

export default function HabitDetail() {
  const { theme } = useTheme();

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [habit, setHabit] = useState<any>(null);
  const [count, setCount] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [target, setTarget] = useState<any>(null);

  const bgColor = theme === 'dark' ? '#111' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await loadHabit();
    await loadLogs();
    await loadTarget();
  };

  const loadHabit = async () => {
    const result = await db
      .select()
      .from(habits)
      .where(eq(habits.id, Number(id)));

    setHabit(result[0]);
  };

  const loadLogs = async () => {
    const result = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.habitId, Number(id)));

    setLogs(result);
  };

  const loadTarget = async () => {
    const result = await db
      .select()
      .from(targets)
      .where(eq(targets.habitId, Number(id)));

    setTarget(result[0]);
  };

  const deleteHabit = async () => {
    await db.delete(habits).where(eq(habits.id, Number(id)));
    router.back();
  };

  const logHabit = async () => {
    if (!count) return;

    const today = new Date().toISOString().split('T')[0];

    await db.insert(habitLogs).values({
      habitId: Number(id),
      date: today,
      count: Number(count),
    });

    setCount('');
    await loadLogs();
  };

  const totalCount = logs.reduce((sum, log) => sum + log.count, 0);

  if (!habit) return null;

  return (
    <View style={{ padding: 20, backgroundColor: bgColor, flex: 1 }}>
      <Text style={{ fontSize: 22, color: textColor }}>{habit.name}</Text>

      {/* Edit */}
      <Button
        title="Edit"
        onPress={() =>
          router.push({
            pathname: '/habit/[id]/edit',
            params: { id: id },
          })
        }
      />

      {/* Delete */}
      <Button title="Delete" onPress={deleteHabit} />

      {/* Log Habit */}
      <TextInput
        placeholder="Enter count"
        value={count}
        onChangeText={setCount}
        style={{
          borderWidth: 1,
          borderColor: theme === 'dark' ? '#555' : '#ccc',
          backgroundColor: theme === 'dark' ? '#222' : '#fff',
          color: textColor,
          marginTop: 20,
          padding: 10,
          borderRadius: 8,
        }}
        placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
      />

      <Button title="Log Habit" onPress={logHabit} />

      {/* Logs */}
      <Text style={{ marginTop: 20, fontWeight: 'bold', color: textColor }}>
        Logs:
      </Text>

      {logs.map((log) => (
        <Text key={log.id} style={{ color: textColor }}>
          {log.date} - {log.count}
        </Text>
      ))}

      {/* Target Progress */}
      <Text style={{ marginTop: 20, fontWeight: 'bold', color: textColor }}>
        Target Progress:
      </Text>

      {target ? (
        <>
          <Text style={{ color: textColor }}>
            {totalCount} / {target.value} completed
          </Text>

          <Text style={{ color: textColor }}>
            Remaining: {Math.max(target.value - totalCount, 0)}
          </Text>

          <Text style={{ marginTop: 5, color: textColor }}>
            {totalCount >= target.value
              ? 'Goal reached!'
              : `${target.value - totalCount} to go`}
          </Text>
        </>
      ) : (
        <Text style={{ color: textColor }}>No target set</Text>
      )}
    </View>
  );
}