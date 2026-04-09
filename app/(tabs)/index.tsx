import { useState, useCallback } from 'react';
import { Text, View, Dimensions, TextInput, Button } from 'react-native';
import { db } from '@/db/client';
import { habits, habitLogs, users } from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';
import HabitCard from '@/components/HabitCard';
import { useRouter, useFocusEffect } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';
import { eq } from 'drizzle-orm';

export default function IndexScreen() {
  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [{ data: [] as number[] }],
  });

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      init();
    }, [])
  );

  const init = async () => {
    await seedIfEmpty();
    await loadHabits();
    await loadChartData();
  };

  const loadHabits = async () => {
    const rows = await db.select().from(habits);
    setData(rows);
    setFilteredData(rows);
  };

  const loadChartData = async () => {
    const habitList = await db.select().from(habits);

    const labels: string[] = [];
    const values: number[] = [];

    for (const habit of habitList) {
      const logs = await db
        .select()
        .from(habitLogs)
        .where(eq(habitLogs.habitId, habit.id));

      const total = logs.reduce((sum, l) => sum + l.count, 0);

      labels.push(habit.name);
      values.push(total);
    }

    setChartData({
      labels,
      datasets: [{ data: values }],
    });
  };

  // 🔍 SEARCH
  const handleSearch = (text: string) => {
    setSearch(text);

    const filtered = data.filter((habit) =>
      habit.name.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredData(filtered);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 10 }}>Habits</Text>

      {/* 🔐 AUTH BUTTONS */}
      <Button title="Logout" onPress={() => router.replace('/login')} />

      <Button
        title="Delete Account"
        onPress={async () => {
          await db.delete(users);
          router.replace('/login');
        }}
      />

      {/* 🔍 SEARCH */}
      <TextInput
        placeholder="Search habits..."
        value={search}
        onChangeText={handleSearch}
        style={{
          borderWidth: 1,
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
        }}
      />

      {/* 📊 CHART */}
      {chartData.labels.length > 0 && (
        <>
          {/* @ts-ignore */}
          <BarChart
            data={chartData}
            width={Dimensions.get('window').width - 40}
            height={220}
            fromZero
            chartConfig={{
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(15, 118, 110, ${opacity})`,
              labelColor: () => '#000',
            }}
            style={{
              marginBottom: 20,
              borderRadius: 10,
            }}
          />
        </>
      )}

      {/* ➕ Add Habit */}
      <Text
        style={{
          backgroundColor: '#0F766E',
          color: '#fff',
          padding: 10,
          borderRadius: 8,
          textAlign: 'center',
          marginBottom: 10,
        }}
        onPress={() => router.push('/add-habit')}
      >
        + Add Habit
      </Text>

      {/* 📋 LIST */}
      {filteredData.map((habit) => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </View>
  );
}