import { useState, useEffect, useCallback } from 'react';
import { apiRequest, subscribeAuthChange } from '../api/client';

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

interface FoodEntryResponse {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  time: string;
  photo: string | null;
}

interface CaloriesDayResponse {
  date: string;
  goal: number;
  entries: FoodEntryResponse[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

const DEFAULT_GOAL = 2000;
const DEFAULT_DAY_DATA: DayData = { entries: [], goal: DEFAULT_GOAL };

export function todayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDateLabel(key: string, locale = 'bg-BG'): string {
  const date = new Date(key);
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function fromApiEntry(e: FoodEntryResponse): FoodEntry {
  return {
    id: String(e.id),
    name: e.name,
    calories: e.calories,
    protein: e.protein,
    carbs: e.carbs,
    fat: e.fat,
    time: e.time,
    photo: e.photo ?? undefined,
  };
}

function fromApiDay(res: CaloriesDayResponse): DayData {
  return {
    entries: res.entries.map(fromApiEntry),
    goal: res.goal,
  };
}

export function useCaloriesData(dateKey: string) {
  const [dayData, setDayData] = useState<DayData>(DEFAULT_DAY_DATA);

  const load = useCallback(async () => {
    try {
      const res = await apiRequest<CaloriesDayResponse>(`/api/calories/${dateKey}`);
      setDayData(fromApiDay(res));
    } catch {
      setDayData(DEFAULT_DAY_DATA);
    }
  }, [dateKey]);

  useEffect(() => {
    load();
    return subscribeAuthChange(load);
  }, [load]);

  const addEntry = async (entry: Omit<FoodEntry, 'id' | 'time'>) => {
    const tempEntry: FoodEntry = {
      ...entry,
      id: `temp-${Date.now()}`,
      time: new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' }),
    };
    setDayData(prev => ({ ...prev, entries: [...prev.entries, tempEntry] }));
    try {
      await apiRequest<FoodEntryResponse>(`/api/calories/${dateKey}/entries`, {
        method: 'POST',
        body: {
          name: entry.name,
          calories: entry.calories,
          protein: entry.protein,
          carbs: entry.carbs,
          fat: entry.fat,
          photo: entry.photo || null,
        },
      });
      await load();
    } catch {
      // optimistic update already applied; reload to resync if possible
      await load();
    }
  };

  const removeEntry = async (id: string) => {
    setDayData(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
    try {
      await apiRequest<void>(`/api/calories/entries/${id}`, { method: 'DELETE' });
    } catch {
      await load();
    }
  };

  const setGoal = async (goal: number) => {
    setDayData(prev => ({ ...prev, goal }));
    try {
      const res = await apiRequest<CaloriesDayResponse>(`/api/calories/${dateKey}/goal`, {
        method: 'PUT',
        body: { goal },
      });
      setDayData(fromApiDay(res));
    } catch {
      await load();
    }
  };

  const totalCalories = dayData.entries.reduce((sum, e) => sum + e.calories, 0);
  const totalProtein  = dayData.entries.reduce((sum, e) => sum + e.protein,  0);
  const totalCarbs    = dayData.entries.reduce((sum, e) => sum + e.carbs,    0);
  const totalFat      = dayData.entries.reduce((sum, e) => sum + e.fat,      0);

  return { dayData, totalCalories, totalProtein, totalCarbs, totalFat, addEntry, removeEntry, setGoal };
}
