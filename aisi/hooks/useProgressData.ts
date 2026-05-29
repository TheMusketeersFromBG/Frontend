import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CAL_PREFIX = 'aisi_calories_';
const STEPS_HIST = 'aisi_steps_history';
const WEIGHT_KEY = 'aisi_weight_log';

export interface DayData {
  date: string;
  label: string;
  calories: number;
  steps: number;
  workouts: number;
  pages: number;
}

export interface WeightEntry {
  date: string;
  weight: number;
}

export function dayLabel(dateStr: string, locale = 'bg-BG'): string {
  return new Date(dateStr).toLocaleDateString(locale, { weekday: 'short' });
}

export function getWeekDays(weekOffset: number): string[] {
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // Пон=0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek + weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

export function getMonthDays(monthOffset: number): string[] {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthOffset);
  const year = d.getFullYear();
  const month = d.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) =>
    `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
  );
}

export function weekRangeLabel(weekOffset: number, locale = 'bg-BG'): string {
  const days = getWeekDays(weekOffset);
  const start = new Date(days[0]);
  const end   = new Date(days[6]);
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
  return `${start.toLocaleDateString(locale, opts)} – ${end.toLocaleDateString(locale, opts)}`;
}

export function monthLabel(monthOffset: number, locale = 'bg-BG'): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + monthOffset);
  return d.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

// Groups month days into weeks for chart
export function groupByWeek(days: DayData[]): DayData[] {
  const weeks: DayData[] = [];
  for (let i = 0; i < days.length; i += 7) {
    const chunk = days.slice(i, i + 7);
    const weekNum = Math.floor(i / 7) + 1;
    weeks.push({
      date: chunk[0].date,
      label: `Сед ${weekNum}`,
      calories: chunk.reduce((s, d) => s + d.calories, 0),
      steps:    chunk.reduce((s, d) => s + d.steps, 0),
      workouts: chunk.reduce((s, d) => s + d.workouts, 0),
      pages:    chunk.reduce((s, d) => s + d.pages, 0),
    });
  }
  return weeks;
}

async function loadDays(
  dates: string[],
  workoutHistory: { date: string }[],
  stepsHist: Record<string, number>
): Promise<DayData[]> {
  const [calRaws, pagesRaws] = await Promise.all([
    Promise.all(dates.map(d => AsyncStorage.getItem(CAL_PREFIX + d))),
    Promise.all(dates.map(d => AsyncStorage.getItem(`aisi_books_today_${d}`))),
  ]);

  return dates.map((date, i) => {
    const calData = calRaws[i] ? JSON.parse(calRaws[i]!) : null;
    return {
      date,
      label: dayLabel(date),
      calories: calData?.entries?.reduce((s: number, e: { calories: number }) => s + e.calories, 0) ?? 0,
      steps: stepsHist[date] ?? 0,
      workouts: workoutHistory.filter(w => w.date.startsWith(date)).length,
      pages: pagesRaws[i] ? JSON.parse(pagesRaws[i]!) : 0,
    };
  });
}

export function useProgressData(workoutHistory: { date: string }[]) {
  const [stepsHistory, setStepsHistory] = useState<Record<string, number>>({});
  const [weightLog, setWeightLog]       = useState<WeightEntry[]>([]);

  // Week
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekData, setWeekData]     = useState<DayData[]>([]);

  // Month
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthData, setMonthData]     = useState<DayData[]>([]);

  useEffect(() => {
    loadBase();
  }, [workoutHistory.length]);

  useEffect(() => { if (Object.keys(stepsHistory).length >= 0) loadWeek(); }, [weekOffset, stepsHistory, workoutHistory.length]);
  useEffect(() => { if (Object.keys(stepsHistory).length >= 0) loadMonth(); }, [monthOffset, stepsHistory, workoutHistory.length]);

  const loadBase = async () => {
    const [stepsRaw, wRaw] = await Promise.all([
      AsyncStorage.getItem(STEPS_HIST),
      AsyncStorage.getItem(WEIGHT_KEY),
    ]);
    const hist: Record<string, number> = stepsRaw ? JSON.parse(stepsRaw) : {};
    setStepsHistory(hist);
    if (wRaw) setWeightLog(JSON.parse(wRaw));
  };

  const loadWeek = async () => {
    const days = getWeekDays(weekOffset);
    const stepsRaw = await AsyncStorage.getItem(STEPS_HIST);
    const hist: Record<string, number> = stepsRaw ? JSON.parse(stepsRaw) : {};
    const data = await loadDays(days, workoutHistory, hist);
    setWeekData(data);  // labels updated in component
  };

  const loadMonth = async () => {
    const days = getMonthDays(monthOffset);
    const stepsRaw = await AsyncStorage.getItem(STEPS_HIST);
    const hist: Record<string, number> = stepsRaw ? JSON.parse(stepsRaw) : {};
    const data = await loadDays(days, workoutHistory, hist);
    setMonthData(data);
  };

  const saveWeight = async (weight: number) => {
    const entry: WeightEntry = { date: new Date().toISOString().split('T')[0], weight };
    const updated = [...weightLog.filter(e => e.date !== entry.date), entry]
      .sort((a, b) => a.date.localeCompare(b.date));
    setWeightLog(updated);
    await AsyncStorage.setItem(WEIGHT_KEY, JSON.stringify(updated));
  };

  const calcStreak = (): number => {
    let streak = 0;
    for (let i = 0; i <= 365; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const hasActivity =
        workoutHistory.some(w => w.date.startsWith(key)) ||
        (stepsHistory[key] ?? 0) > 1000;
      if (!hasActivity) break;
      streak++;
    }
    return streak;
  };

  return {
    weekData, weekOffset, setWeekOffset,
    monthData, monthOffset, setMonthOffset,
    weightLog, saveWeight, calcStreak,
  };
}
