import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const loadTheme = async () => {
    const saved = await AsyncStorage.getItem('theme');
    if (saved) setTheme(saved as 'light' | 'dark');
  };

  useEffect(() => {
    loadTheme();
  }, []);

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    await AsyncStorage.setItem('theme', newTheme);
  };

  return { theme, toggleTheme, loadTheme };
}