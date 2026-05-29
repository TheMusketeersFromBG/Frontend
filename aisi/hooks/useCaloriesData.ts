import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  photo?: string;
}

interface DayData {
  entries: FoodEntry[];
  goal: number;
}

const STORAGE_PREFIX = 'aisi_calories_';
const DEFAULT_GOAL = 2000;

export function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDateLabel(key: string, locale = 'bg-BG'): string {
  const date = new Date(key);
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

export function useCaloriesData(dateKey: string) {
  const [dayData, setDayData] = useState<DayData>({ entries: [], goal: DEFAULT_GOAL });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_PREFIX + dateKey).then((raw) => {
      if (raw) setDayData(JSON.parse(raw));
      else setDayData({ entries: [], goal: DEFAULT_GOAL });
    });
  }, [dateKey]);

  const save = async (updated: DayData) => {
    setDayData(updated);
    await AsyncStorage.setItem(STORAGE_PREFIX + dateKey, JSON.stringify(updated));
  };

  const addEntry = (entry: Omit<FoodEntry, 'id' | 'time'>) => {
    const newEntry: FoodEntry = {
      ...entry,
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }),
    };
    save({ ...dayData, entries: [...dayData.entries, newEntry] });
  };

  const removeEntry = (id: string) => {
    save({ ...dayData, entries: dayData.entries.filter(e => e.id !== id) });
  };

  const setGoal = (goal: number) => save({ ...dayData, goal });

  const totalCalories = dayData.entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein  = dayData.entries.reduce((sum, e) => sum + e.protein,  0);
  const totalCarbs    = dayData.entries.reduce((sum, e) => sum + e.carbs,    0);
  const totalFat      = dayData.entries.reduce((sum, e) => sum + e.fat,      0);

  return { dayData, totalCalories, totalProtein, totalCarbs, totalFat, addEntry, removeEntry, setGoal };
}
