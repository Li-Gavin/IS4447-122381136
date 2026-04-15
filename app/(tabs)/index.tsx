import { useState, useCallback } from 'react';
import {
  Text,
  View,
  Dimensions,
  TextInput,
  Button,
  ScrollView,
} from 'react-native';

import { db } from '@/db/client';
import { habits, habitLogs, users, categories } from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';
import HabitCard from '@/components/HabitCard';
import { useRouter, useFocusEffect } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';
import { eq } from 'drizzle-orm';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/hooks/useTheme';

export default function IndexScreen() {
  const { theme, toggleTheme } = useTheme();

  const bgColor = theme === 'dark' ? '#111' : '#fff';
  const textColor = theme === 'dark' ? '#fff' : '#000';

  const [data, setData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [categoryList, setCategoryList] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const [chartData, setChartData] = useState({
    labels: [] as string[],
    datasets: [{ data: [] as number[] }],
  });

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      init();
    }, [view])
  );

  const init = async () => {
    await seedIfEmpty();
    await loadHabits();
    await loadChartData();
    await loadCategories();
  };

  const loadCategories = async () => {
    const result = await db.select().from(categories);
    setCategoryList(result);
  };

  const loadHabits = async () => {
    const rows = await db.select().from(habits);
    setData(rows);
    setFilteredData(rows);
  };

  const loadChartData = async () => {
    const habitList = await db.select().from(habits);
    const allLogs = await db.select().from(habitLogs);

    const today = new Date().toISOString().split('T')[0];

    const labels: string[] = [];
    const values: number[] = [];

    for (const habit of habitList) {
      const logs = allLogs.filter(l => l.habitId === habit.id);

      const filteredLogs = logs.filter((l) => {
        if (view === 'daily') return l.date === today;
        if (view === 'weekly') return true;
        if (view === 'monthly') return true;
      });

      const total = filteredLogs.reduce((sum, l) => sum + l.count, 0);

      labels.push(habit.name);
      values.push(total);
    }

    setChartData({
      labels,
      datasets: [{ data: values }],
    });
  };

  const filterByCategory = (categoryId: number | null) => {
    setSelectedCategory(categoryId);

    if (!categoryId) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(
      (habit) => habit.categoryId === categoryId
    );

    setFilteredData(filtered);
  };

  const handleSearch = (text: string) => {
    setSearch(text);

    const filtered = data.filter((habit) =>
      habit.name.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredData(filtered);
  };

  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    setFilteredData(data);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, backgroundColor: bgColor }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={{ fontSize: 22, marginBottom: 10, color: textColor }}>
        Habits
      </Text>

      <Button
        title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        onPress={toggleTheme}
      />

      <Button
        title="Manage Categories"
        onPress={() => router.push('/categories')}
      />

      <Button title="Logout" onPress={() => router.replace('/login')} />

      <Button
        title="Delete Account"
        onPress={async () => {
          await db.delete(users);
          router.replace('/login');
        }}
      />

      <Text style={{ color: textColor }}>Search</Text>
      <TextInput
        placeholder="Search habits..."
        value={search}
        onChangeText={handleSearch}
        style={{
          borderWidth: 1,
          borderColor: theme === 'dark' ? '#555' : '#ccc',
          backgroundColor: theme === 'dark' ? '#222' : '#fff',
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
          color: textColor,
        }}
        placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
      />

      <Text style={{ color: textColor }}>Filter by Date</Text>
      <TextInput
        placeholder="YYYY-MM-DD"
        value={selectedDate}
        onChangeText={handleDateFilter}
        style={{
          borderWidth: 1,
          borderColor: theme === 'dark' ? '#555' : '#ccc',
          backgroundColor: theme === 'dark' ? '#222' : '#fff',
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
          color: textColor,
        }}
        placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
      />

      <Text style={{ color: textColor }}>Category</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(value) => filterByCategory(value)}
        dropdownIconColor={textColor} // ✅ fixes arrow visibility
        style={{
          color: textColor,
          backgroundColor: theme === 'dark' ? '#222' : '#fff',
        }}
      >
        <Picker.Item
          label="All Categories"
          value={null}
          color={theme === 'dark' ? '#000' : '#000'} // ✅ FORCE BLACK
        />

        {categoryList.map((cat) => (
          <Picker.Item
            key={cat.id}
            label={cat.name}
            value={cat.id}
            color="#000" // ✅ ALWAYS BLACK for dropdown list
          />
        ))}
      </Picker>

      <Text style={{ color: textColor }}>View</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
        <Button title="Daily" onPress={() => setView('daily')} />
        <Button title="Weekly" onPress={() => setView('weekly')} />
        <Button title="Monthly" onPress={() => setView('monthly')} />
      </View>

      {chartData.labels.length > 0 && (
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          fromZero
          yAxisLabel=""
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: bgColor,
            backgroundGradientTo: bgColor,
            decimalPlaces: 0,
            color: (opacity = 1) =>
              theme === 'dark'
                ? `rgba(255,255,255,${opacity})`
                : `rgba(0,0,0,${opacity})`,
            labelColor: () => textColor,
          }}
        />
      )}

      <Text
        style={{
          backgroundColor: '#0F766E',
          color: '#fff',
          padding: 12,
          borderRadius: 8,
          textAlign: 'center',
        }}
        onPress={() => router.push('/add-habit')}
      >
        + Add Habit
      </Text>

      {filteredData.length === 0 ? (
        <Text style={{ color: textColor }}>No habits found.</Text>
      ) : (
        filteredData.map((habit) => (
          <HabitCard key={habit.id} habit={habit} />
        ))
      )}
    </ScrollView>
  );
}