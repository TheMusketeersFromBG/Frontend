import { useState, useEffect, useCallback } from 'react';
import { apiRequest, subscribeAuthChange } from '../api/client';

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

interface DayDataResponse {
  date: string;
  label: string;
  calories: number;
  steps: number;
  workouts: number;
  pages: number;
}

interface WeightEntryResponse {
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

function fromApi(res: DayDataResponse): DayData {
  return {
    date: res.date,
    label: res.label,
    calories: res.calories,
    steps: res.steps,
    workouts: res.workouts,
    pages: res.pages,
  };
}

function weightFromApi(res: WeightEntryResponse): WeightEntry {
  return { date: res.date, weight: res.weight };
}

async function loadDays(dates: string[]): Promise<DayData[]> {
  try {
    const start = dates[0];
    const end = dates[dates.length - 1];
    const res = await apiRequest<DayDataResponse[]>(`/api/progress/days?start=${start}&end=${end}`);
    return res.map(fromApi);
  } catch {
    return dates.map(date => ({ date, label: dayLabel(date), calories: 0, steps: 0, workouts: 0, pages: 0 }));
  }
}

export function useProgressData() {
  const [weightLog, setWeightLog] = useState<WeightEntry[]>([]);
  const [streak, setStreak] = useState(0);

  // Week
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekData, setWeekData]     = useState<DayData[]>([]);

  // Month
  const [monthOffset, setMonthOffset] = useState(0);
  const [monthData, setMonthData]     = useState<DayData[]>([]);

  const loadBase = useCallback(async () => {
    try {
      const [weightRes, streakRes] = await Promise.all([
        apiRequest<WeightEntryResponse[]>('/api/progress/weight'),
        apiRequest<{ streak: number }>('/api/progress/streak'),
      ]);
      setWeightLog(weightRes.map(weightFromApi));
      setStreak(streakRes.streak);
    } catch {
      setWeightLog([]);
      setStreak(0);
    }
  }, []);

  useEffect(() => {
    loadBase();
    return subscribeAuthChange(loadBase);
  }, [loadBase]);

  const loadWeek = useCallback(async () => {
    const days = getWeekDays(weekOffset);
    const data = await loadDays(days);
    setWeekData(data);
  }, [weekOffset]);

  const loadMonth = useCallback(async () => {
    const days = getMonthDays(monthOffset);
    const data = await loadDays(days);
    setMonthData(data);
  }, [monthOffset]);

  useEffect(() => {
    loadWeek();
    return subscribeAuthChange(loadWeek);
  }, [loadWeek]);

  useEffect(() => {
    loadMonth();
    return subscribeAuthChange(loadMonth);
  }, [loadMonth]);

  const saveWeight = async (weight: number) => {
    const today = new Date().toISOString().split('T')[0];
    const optimistic = [...weightLog.filter(e => e.date !== today), { date: today, weight }]
      .sort((a, b) => a.date.localeCompare(b.date));
    setWeightLog(optimistic);
    try {
      const res = await apiRequest<WeightEntryResponse>('/api/progress/weight', {
        method: 'POST',
        body: { weight },
      });
      const entry = weightFromApi(res);
      setWeightLog(prev => [...prev.filter(e => e.date !== entry.date), entry].sort((a, b) => a.date.localeCompare(b.date)));
      // Weight may affect today's data; refresh streak too in case it changes server logic later.
      loadWeek();
      loadMonth();
    } catch {
      // optimistic update already applied; ignore network errors
    }
  };

  return {
    weekData, weekOffset, setWeekOffset,
    monthData, monthOffset, setMonthOffset,
    weightLog, saveWeight, streak,
  };
}
