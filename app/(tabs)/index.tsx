import { useState, useCallback } from 'react';
import {
  Text,
  View,
  Dimensions,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';

import { db } from '@/db/client';
import { habits, habitLogs, categories } from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';
import HabitCard from '@/components/HabitCard';
import { useRouter, useFocusEffect } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/hooks/useTheme';
import Constants from 'expo-constants';

export default function IndexScreen() {
  const { theme, loadTheme } = useTheme();

  const bgColor = theme === 'dark' ? '#111' : '#F8F9FB';
  const cardColor = theme === 'dark' ? '#1E1E1E' : '#fff';
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

  const [advice, setAdvice] = useState('');
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [adviceError, setAdviceError] = useState('');

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadTheme();
      init();
    }, [])
  );

  const init = async () => {
    await seedIfEmpty();
    await loadHabits();
    await loadChartData();
    await loadCategories();
    await loadAdvice();
  };

  const loadAdvice = async () => {
    try {
      setLoadingAdvice(true);
      setAdviceError('');

      const res = await fetch(
        process.env.EXPO_PUBLIC_API_URL! + '?t=' + new Date().getTime()
      );
      const data = await res.json();

      setAdvice(data.slip.advice);
    } catch {
      setAdviceError('Failed to load tip');
    } finally {
      setLoadingAdvice(false);
    }
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
        return true;
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

    setFilteredData(data.filter(h => h.categoryId === categoryId));
  };

  const handleSearch = (text: string) => {
    setSearch(text);

    setFilteredData(
      data.filter(h =>
        h.name.toLowerCase().includes(text.toLowerCase())
      )
    );
  };

  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    setFilteredData(data);
  };

  const exportToCSV = async () => {
    const habitList = await db.select().from(habits);
    const logs = await db.select().from(habitLogs);

    let csv = 'Habit,Date,Count\n';

    for (const habit of habitList) {
      const habitLogsFiltered = logs.filter(l => l.habitId === habit.id);

      for (const log of habitLogsFiltered) {
        csv += `${habit.name},${log.date},${log.count}\n`;
      }
    }

    const fileUri = FileSystem.documentDirectory + 'habits.csv';

    await FileSystem.writeAsStringAsync(fileUri, csv);
    await Sharing.shareAsync(fileUri);
  };

  const scheduleNotification = async () => {
    if (Constants.appOwnership === 'expo') {
      alert('Notifications only work in a development build');
      return;
    }

    const Notifications = await import('expo-notifications');

    await Notifications.requestPermissionsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Habit Reminder',
        body: 'Don’t forget to log your habits today!',
      },
      trigger: {
        hour: 20,
        minute: 0,
        repeats: true,
      } as any,
    });
  };

  // 🔹 Reusable button
  const ActionButton = ({ title, onPress }: any) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#2563EB',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
      }}
    >
      <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600' }}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 20,
        backgroundColor: bgColor,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Title */}
      <Text style={{ fontSize: 26, fontWeight: 'bold', color: textColor }}>
        Habits
      </Text>

      {/* Advice */}
      <View style={{ marginVertical: 15 }}>
        {loadingAdvice ? (
          <Text style={{ color: textColor }}>Loading tip...</Text>
        ) : adviceError ? (
          <Text style={{ color: 'red' }}>{adviceError}</Text>
        ) : (
          <>
            <Text style={{ fontStyle: 'italic', color: textColor }}>
              💡 {advice}
            </Text>
            <View style={{ marginTop: 8 }}>
              <ActionButton title="Refresh Tip" onPress={loadAdvice} />
            </View>
          </>
        )}
      </View>

      {/* Actions */}
      <ActionButton title="Manage Categories" onPress={() => router.push('/categories')} />
      <ActionButton title="Export CSV" onPress={exportToCSV} />
      <ActionButton title="Set Daily Reminder" onPress={scheduleNotification} />

      {/* Search */}
      <Text style={{ color: textColor, marginTop: 10 }}>Search</Text>
      <TextInput
        placeholder="Search habits..."
        value={search}
        onChangeText={handleSearch}
        style={{
          backgroundColor: cardColor,
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
          color: textColor,
        }}
        placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
      />

      {/* Date */}
      <Text style={{ color: textColor }}>Filter by Date</Text>
      <TextInput
        placeholder="YYYY-MM-DD"
        value={selectedDate}
        onChangeText={handleDateFilter}
        style={{
          backgroundColor: cardColor,
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
          color: textColor,
        }}
        placeholderTextColor={theme === 'dark' ? '#aaa' : '#666'}
      />

      {/* Category */}
      <Text style={{ color: textColor }}>Category</Text>
      <View style={{ backgroundColor: cardColor, borderRadius: 10 }}>
        <Picker
          selectedValue={selectedCategory}
          onValueChange={filterByCategory}
          style={{ color: textColor }}
        >
          <Picker.Item
            label="All Categories"
            value={null}
            color={textColor}
          />
          {categoryList.map(cat => (
            <Picker.Item
              key={cat.id}
              label={cat.name}
              value={cat.id}
              color={textColor}
            />
          ))}
        </Picker>
      </View>

      {/* View buttons */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 15,
        }}
      >
        {['daily', 'weekly', 'monthly'].map(v => (
          <TouchableOpacity
            key={v}
            onPress={() => setView(v as any)}
            style={{
              backgroundColor: view === v ? '#2563EB' : cardColor,
              padding: 10,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: view === v ? '#fff' : textColor,
                fontWeight: '600',
              }}
            >
              {v.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart (UNCHANGED LOGIC) */}
      {chartData.labels.length > 0 && (
        <BarChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero
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
          style={{
            borderRadius: 12,
            marginTop: 15,
          }}
        />
      )}

      {/* Add Habit */}
      <TouchableOpacity
        onPress={() => router.push('/add-habit')}
        style={{
          backgroundColor: '#0F766E',
          padding: 14,
          borderRadius: 12,
          marginTop: 15,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
          + Add Habit
        </Text>
      </TouchableOpacity>

      {/* List */}
      {filteredData.map(habit => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
    </ScrollView>
  );
}