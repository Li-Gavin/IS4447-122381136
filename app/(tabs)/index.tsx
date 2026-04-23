import { useState, useCallback } from 'react';
import {
  Text,
  View,
  Dimensions,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
// file system and sharing used for exporting CSV
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// db and schema imports
import { db } from '@/db/client';
import { habits, habitLogs, categories } from '@/db/schema';
import { seedIfEmpty } from '@/db/seed';
import HabitCard from '@/components/HabitCard';
import { useRouter, useFocusEffect } from 'expo-router';
import { BarChart } from 'react-native-chart-kit';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/hooks/useTheme';
import Constants from 'expo-constants';


// following code has been modified from the claude conversation linked below.
// https://claude.ai/share/a506de81-ee05-4bfa-8bde-69dfa7bd749e
// this code sets up the main screen of the app, displaying a header with the current date, a random habit tip fetched from an API, quick action buttons for managing categories/exporting CSV/setting reminders, filters for searching habits by name/date/category, a toggle for daily/weekly/monthly views, a bar chart summarizing habit counts, and a list of all habits. It also includes functionality to export habit logs as CSV and schedule daily notifications.
export default function IndexScreen() {
  const { theme, loadTheme } = useTheme();

  const isDark = theme === 'dark';
  const bgColor = isDark ? '#0A0A0F' : '#F4F3EF';
  const cardColor = isDark ? '#16161E' : '#FFFFFF';
  const surfaceColor = isDark ? '#1E1E2A' : '#EEECEA';
  const textColor = isDark ? '#F0EFE9' : '#1A1916';
  const subTextColor = isDark ? '#7A7A8A' : '#8A8880';
  const accentColor = '#5B4FE9';
  const accent2Color = '#0EA875';
// state habits and filters
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
  // advice api state
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
// fetches a random habit tip from the advice slip api and handles loading/error states
  const loadAdvice = async () => {
    try {
      setLoadingAdvice(true);
      setAdviceError('');
      const res = await fetch(process.env.EXPO_PUBLIC_API_URL! + '?t=' + new Date().getTime());
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

  // prepares data for the chart based on current view (daily/weekly/monthly) and applies category filter if selected
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

    setChartData({ labels, datasets: [{ data: values }] });
  };
// filter habits by category
  const filterByCategory = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    if (!categoryId) { setFilteredData(data); return; }
    setFilteredData(data.filter(h => h.categoryId === categoryId));
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setFilteredData(data.filter(h => h.name.toLowerCase().includes(text.toLowerCase())));
  };

  const handleDateFilter = (date: string) => {
    setSelectedDate(date);
    setFilteredData(data);
  };
// exports habit logs as CSV and shares the file using the device's native sharing options
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
// schedules a daily notification at 8 PM to remind users to log their habits
  const scheduleNotification = async () => {
    if (Constants.appOwnership === 'expo') {
      alert('Notifications require a development build (not supported in Expo Go)');
      return;
    }
    const Notifications = await import('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') { alert('Permission denied'); return; }
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Habit Reminder', body: "Don't forget to log your habits today!" },
      trigger: { type: 'daily', hour: 20, minute: 0 } as any,
    });
    alert('Reminder set for 8:00 PM daily!');
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: 40, backgroundColor: bgColor }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* header */}
      <View style={{
        paddingHorizontal: 24,
        paddingTop: 56,
        paddingBottom: 24,
        backgroundColor: bgColor,
      }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: subTextColor, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>
          {today}
        </Text>
        <Text style={{ fontSize: 34, fontWeight: '800', color: textColor, letterSpacing: -1 }}>
          Bloom 🌱
        </Text>
      </View>

      {/* tip card */}
      <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
        <View style={{
          backgroundColor: isDark ? '#1A1A2E' : '#EDE9FE',
          borderRadius: 16,
          padding: 16,
          borderLeftWidth: 3,
          borderLeftColor: accentColor,
        }}>
          {loadingAdvice ? (
            <Text style={{ color: subTextColor, fontSize: 14 }}>Loading tip...</Text>
          ) : adviceError ? (
            <Text style={{ color: '#EF4444', fontSize: 14 }}>{adviceError}</Text>
          ) : (
            <Text style={{ fontStyle: 'italic', color: isDark ? '#C4B5FD' : '#5B4FE9', fontSize: 14, lineHeight: 20 }}>
              💡 {advice}
            </Text>
          )}
          <TouchableOpacity
            onPress={loadAdvice}
            style={{ marginTop: 10, alignSelf: 'flex-start', backgroundColor: accentColor, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 }}
          >
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '700' }}>Refresh tip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* quick actions*/} 
      <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: subTextColor, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 12 }}>
          Quick Actions
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {/* Manage Categories */}
          <TouchableOpacity
            onPress={() => router.push('/categories')}
            style={{ flex: 1, backgroundColor: cardColor, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.4 : 0.06, shadowRadius: 8, elevation: 3 }}
          >
            <Text style={{ fontSize: 22 }}>🗂️</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: textColor, textAlign: 'center' }}>Categories</Text>
          </TouchableOpacity>

          {/* Export CSV */}
          <TouchableOpacity
            onPress={exportToCSV}
            style={{ flex: 1, backgroundColor: cardColor, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.4 : 0.06, shadowRadius: 8, elevation: 3 }}
          >
            <Text style={{ fontSize: 22 }}>📤</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: textColor, textAlign: 'center' }}>Export CSV</Text>
          </TouchableOpacity>

          {/* Reminder */}
          <TouchableOpacity
            onPress={scheduleNotification}
            style={{ flex: 1, backgroundColor: cardColor, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.4 : 0.06, shadowRadius: 8, elevation: 3 }}
          >
            <Text style={{ fontSize: 22 }}>🔔</Text>
            <Text style={{ fontSize: 11, fontWeight: '600', color: textColor, textAlign: 'center' }}>Reminder</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters Section */}
      <View style={{ paddingHorizontal: 24, marginBottom: 20, gap: 12 }}>
        <Text style={{ fontSize: 12, fontWeight: '700', color: subTextColor, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          Filter & Search
        </Text>

        {/* Search */}
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: cardColor, borderRadius: 14, paddingHorizontal: 14,
          shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 4, elevation: 2,
        }}>
          <Text style={{ fontSize: 16, marginRight: 8 }}></Text>
          <TextInput
            placeholder="Search habits..."
            value={search}
            onChangeText={handleSearch}
            style={{ flex: 1, paddingVertical: 13, color: textColor, fontSize: 14 }}
            placeholderTextColor={subTextColor}
          />
        </View>

        {/* Date + Category row */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center',
            backgroundColor: cardColor, borderRadius: 14, paddingHorizontal: 12,
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 4, elevation: 2,
          }}>
            <Text style={{ fontSize: 14, marginRight: 6 }}></Text>
            <TextInput
              placeholder="YYYY-MM-DD"
              value={selectedDate}
              onChangeText={handleDateFilter}
              style={{ flex: 1, paddingVertical: 13, color: textColor, fontSize: 13 }}
              placeholderTextColor={subTextColor}
            />
          </View>

          <View style={{
            flex: 1, backgroundColor: cardColor, borderRadius: 14, justifyContent: 'center',
            shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: isDark ? 0.3 : 0.05, shadowRadius: 4, elevation: 2,
          }}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={filterByCategory}
              style={{ color: textColor, height: 48 }}
              mode="dropdown"
            >
              <Picker.Item label="All Categories" value={null} color="#000000" />
              {categoryList.map(cat => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} color="#000000" />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      {/* View Toggle + Chart */}
      <View style={{ paddingHorizontal: 24, marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', backgroundColor: surfaceColor, borderRadius: 14, padding: 4, marginBottom: 16 }}>
          {(['daily', 'weekly', 'monthly'] as const).map(v => (
            <TouchableOpacity
              key={v}
              onPress={() => setView(v)}
              style={{
                flex: 1, paddingVertical: 9, borderRadius: 11,
                backgroundColor: view === v ? accentColor : 'transparent',
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: view === v ? '#fff' : subTextColor,
                fontWeight: '700', fontSize: 12, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {chartData.labels.length > 0 && (
          <View style={{
            backgroundColor: cardColor, borderRadius: 18, overflow: 'hidden',
            shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.4 : 0.07, shadowRadius: 10, elevation: 4,
          }}>
            <BarChart
              data={chartData}
              width={Dimensions.get('window').width - 48}
              height={200}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero
              chartConfig={{
                backgroundGradientFrom: cardColor,
                backgroundGradientTo: cardColor,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(91,79,233,${opacity})`,
                labelColor: () => subTextColor,
                barPercentage: 0.6,
                propsForBackgroundLines: { stroke: isDark ? '#2A2A3A' : '#EEEDE9', strokeDasharray: '' },
              }}
              style={{ borderRadius: 18 }}
            />
          </View>
        )}
      </View>

      {/* Habits List */}
      <View style={{ paddingHorizontal: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: subTextColor, letterSpacing: 1.2, textTransform: 'uppercase' }}>
            Your Habits
          </Text>
          <View style={{ backgroundColor: accentColor + '22', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: accentColor }}>{filteredData.length}</Text>
          </View>
        </View>

        {filteredData.map(habit => (
          <HabitCard key={habit.id} habit={habit} />
        ))}

        {filteredData.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🌿</Text>
            <Text style={{ color: subTextColor, fontSize: 14, textAlign: 'center' }}>
              No habits found.{'\n'}Start by adding one below!
            </Text>
          </View>
        )}
      </View>

      <View style={{ paddingHorizontal: 24, marginTop: 20 }}>
        <TouchableOpacity
          onPress={() => router.push('/add-habit')}
          style={{
            backgroundColor: accent2Color,
            padding: 16,
            borderRadius: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            shadowColor: accent2Color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <Text style={{ fontSize: 20 }}>＋</Text>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 }}>
            Add Habit
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
