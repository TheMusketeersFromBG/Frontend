import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY       = 'aisi_books';
const KEY_GOAL  = 'aisi_books_daily_goal';
const KEY_TODAY = 'aisi_books_today_';

function todayKey() { return new Date().toISOString().split('T')[0]; }

export type BookStatus = 'reading' | 'want' | 'finished';

export interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
  pagesRead: number;
  cover?: string;
  status: BookStatus;
  notes: string;
  genre: string;
  rating: number;
  dateAdded: string;
  dateFinished?: string;
}

export function useBooksData() {
  const [books, setBooks]           = useState<Book[]>([]);
  const [dailyGoal, setDailyGoal]   = useState(20);
  const [todayPages, setTodayPages] = useState(0);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEY),
      AsyncStorage.getItem(KEY_GOAL),
      AsyncStorage.getItem(KEY_TODAY + todayKey()),
    ]).then(([b, g, t]) => {
      if (b) setBooks(JSON.parse(b));
      if (g) setDailyGoal(JSON.parse(g));
      if (t) setTodayPages(JSON.parse(t));
    });
  }, []);

  const save = async (updated: Book[]) => {
    setBooks(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  };

  const addBook = (b: Omit<Book, 'id' | 'dateAdded' | 'pagesRead' | 'notes'>) => {
    save([...books, { ...b, id: Date.now().toString(), dateAdded: new Date().toISOString(), pagesRead: 0, notes: '', rating: 0 }]);
  };

  const updateBook = (id: string, changes: Partial<Book>) => {
    save(books.map(b => b.id === id ? { ...b, ...changes } : b));
  };

  const removeBook = (id: string) => save(books.filter(b => b.id !== id));

  const finishBook = (id: string) => {
    save(books.map(b => b.id === id
      ? { ...b, status: 'finished', pagesRead: b.pages, dateFinished: new Date().toISOString() }
      : b));
  };

  const byStatus = (status: BookStatus) => books.filter(b => b.status === status);
  const totalFinished = books.filter(b => b.status === 'finished').length;
  const totalPages    = books.filter(b => b.status === 'finished').reduce((s, b) => s + b.pages, 0);

  const saveDailyGoal = async (goal: number) => {
    setDailyGoal(goal);
    await AsyncStorage.setItem(KEY_GOAL, JSON.stringify(goal));
  };

  const addTodayPages = async (pages: number) => {
    const next = todayPages + pages;
    setTodayPages(next);
    await AsyncStorage.setItem(KEY_TODAY + todayKey(), JSON.stringify(next));
  };

  const thisMonthFinished = books.filter(b => {
    if (b.status !== 'finished' || !b.dateFinished) return false;
    const d = new Date(b.dateFinished);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return { books, addBook, updateBook, removeBook, finishBook, byStatus, totalFinished, totalPages, thisMonthFinished, dailyGoal, todayPages, saveDailyGoal, addTodayPages };
}
