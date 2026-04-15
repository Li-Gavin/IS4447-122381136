import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Button, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import { db } from '@/db/client';
import { habits, habitLogs, targets } from '@/db/schema';
import { eq } from 'drizzle-orm';

export default function HabitDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [habit, setHabit] = useState<any>(null);
  const [count, setCount] = useState('');
  const [logs, setLogs] = useState<any[]>([]);
  const [target, setTarget] = useState<any>(null);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    await loadHabit();
    await loadLogs();
    await loadTarget();
  };

  // Load habit
  const loadHabit = async () => {
    const result = await db
      .select()
      .from(habits)
      .where(eq(habits.id, Number(id)));

    setHabit(result[0]);
  };

  // Load logs
  const loadLogs = async () => {
    const result = await db
      .select()
      .from(habitLogs)
      .where(eq(habitLogs.habitId, Number(id)));

    setLogs(result);
  };

  // Load target
  const loadTarget = async () => {
    const result = await db
      .select()
      .from(targets)
      .where(eq(targets.habitId, Number(id)));

    setTarget(result[0]);
  };

  // Delete habit
  const deleteHabit = async () => {
    await db.delete(habits).where(eq(habits.id, Number(id)));
    router.back();
  };

  // Log habit
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

  // Calculate progress
  const totalCount = logs.reduce((sum, log) => sum + log.count, 0);

  if (!habit) return null;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22 }}>{habit.name}</Text>

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
          marginTop: 20,
          padding: 10,
          borderRadius: 8,
        }}
      />

      <Button title="Log Habit" onPress={logHabit} />

      {/* Logs */}
      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>
        Logs:
      </Text>

      {logs.map((log) => (
        <Text key={log.id}>
          {log.date} - {log.count}
        </Text>
      ))}

      {/* target progress feature */}
      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>
        Target Progress:
      </Text>

      {target ? (
        <>
          <Text>
            {totalCount} / {target.value} completed
          </Text>

          <Text>
            Remaining: {Math.max(target.value - totalCount, 0)}
          </Text>

          <Text style={{ marginTop: 5 }}>
            {totalCount >= target.value
              ? ' Goal reached!'
              : ` ${target.value - totalCount} to go`}
          </Text>
        </>
      ) : (
        <Text>No target set</Text>
      )}
    </View>
  );
}