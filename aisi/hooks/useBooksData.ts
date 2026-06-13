import { useState, useEffect, useCallback } from 'react';
import { apiRequest, subscribeAuthChange } from '../api/client';

function todayKey() { return new Date().toISOString().split('T')[0]; }

export type BookStatus = 'reading' | 'want' | 'finished';

export interface Book {
  id: number;
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

interface BookResponse {
  id: number;
  title: string;
  author: string;
  pages: number;
  pages_read: number;
  cover: string | null;
  status: BookStatus;
  notes: string;
  genre: string;
  rating: number;
  date_added: string;
  date_finished: string | null;
}

interface ReadingGoalResponse {
  daily_goal: number;
}

interface ReadingProgressResponse {
  today_pages: number;
}

interface DayDataResponse {
  date: string;
  label: string;
  calories: number;
  steps: number;
  workouts: number;
  pages: number;
}

function fromApi(res: BookResponse): Book {
  return {
    id: res.id,
    title: res.title,
    author: res.author,
    pages: res.pages,
    pagesRead: res.pages_read,
    cover: res.cover ?? undefined,
    status: res.status,
    notes: res.notes,
    genre: res.genre,
    rating: res.rating,
    dateAdded: res.date_added,
    dateFinished: res.date_finished ?? undefined,
  };
}

export function useBooksData() {
  const [books, setBooks]           = useState<Book[]>([]);
  const [dailyGoal, setDailyGoal]   = useState(20);
  const [todayPages, setTodayPages] = useState(0);

  const load = useCallback(async () => {
    try {
      const [booksRes, goalRes, daysRes] = await Promise.all([
        apiRequest<BookResponse[]>('/api/books'),
        apiRequest<ReadingGoalResponse>('/api/books/reading-goal'),
        apiRequest<DayDataResponse[]>(`/api/progress/days?start=${todayKey()}&end=${todayKey()}`),
      ]);
      setBooks(booksRes.map(fromApi));
      setDailyGoal(goalRes.daily_goal);
      setTodayPages(daysRes[0]?.pages ?? 0);
    } catch {
      setBooks([]);
      setDailyGoal(20);
      setTodayPages(0);
    }
  }, []);

  useEffect(() => {
    load();
    return subscribeAuthChange(load);
  }, [load]);

  const addBook = async (b: Omit<Book, 'id' | 'dateAdded' | 'pagesRead' | 'notes'>) => {
    try {
      const res = await apiRequest<BookResponse>('/api/books', {
        method: 'POST',
        body: {
          title: b.title,
          author: b.author,
          pages: b.pages,
          cover: b.cover ?? null,
          status: b.status,
          genre: b.genre,
        },
      });
      setBooks(prev => [...prev, fromApi(res)]);
    } catch {
      // ignore network errors
    }
  };

  const updateBook = async (id: number, changes: Partial<Book>) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...changes } : b));
    try {
      // Switching status to 'finished' (e.g. from the book detail modal) needs
      // date_finished set server-side, which only the /finish endpoint does.
      if (changes.status === 'finished') {
        const res = await apiRequest<BookResponse>(`/api/books/${id}/finish`, { method: 'POST' });
        setBooks(prev => prev.map(b => b.id === id ? fromApi(res) : b));
        return;
      }

      const body: Record<string, unknown> = {};
      if (changes.title !== undefined) body.title = changes.title;
      if (changes.author !== undefined) body.author = changes.author;
      if (changes.pages !== undefined) body.pages = changes.pages;
      if (changes.pagesRead !== undefined) body.pages_read = changes.pagesRead;
      if (changes.cover !== undefined) body.cover = changes.cover ?? null;
      if (changes.status !== undefined) body.status = changes.status;
      if (changes.notes !== undefined) body.notes = changes.notes;
      if (changes.genre !== undefined) body.genre = changes.genre;
      if (changes.rating !== undefined) body.rating = changes.rating;
      const res = await apiRequest<BookResponse>(`/api/books/${id}`, {
        method: 'PUT',
        body,
      });
      setBooks(prev => prev.map(b => b.id === id ? fromApi(res) : b));
    } catch {
      // optimistic update already applied; ignore network errors
    }
  };

  const removeBook = async (id: number) => {
    setBooks(prev => prev.filter(b => b.id !== id));
    try {
      await apiRequest(`/api/books/${id}`, { method: 'DELETE' });
    } catch {
      // optimistic update already applied; ignore network errors
    }
  };

  const finishBook = async (id: number) => {
    setBooks(prev => prev.map(b => b.id === id
      ? { ...b, status: 'finished', pagesRead: b.pages, dateFinished: new Date().toISOString() }
      : b));
    try {
      const res = await apiRequest<BookResponse>(`/api/books/${id}/finish`, { method: 'POST' });
      setBooks(prev => prev.map(b => b.id === id ? fromApi(res) : b));
    } catch {
      // optimistic update already applied; ignore network errors
    }
  };

  const byStatus = (status: BookStatus) => books.filter(b => b.status === status);
  const totalFinished = books.filter(b => b.status === 'finished').length;
  const totalPages    = books.filter(b => b.status === 'finished').reduce((s, b) => s + b.pages, 0);

  const saveDailyGoal = async (goal: number) => {
    setDailyGoal(goal);
    try {
      const res = await apiRequest<ReadingGoalResponse>('/api/books/reading-goal', {
        method: 'PUT',
        body: { daily_goal: goal },
      });
      setDailyGoal(res.daily_goal);
    } catch {
      // optimistic update already applied; ignore network errors
    }
  };

  const addTodayPages = async (pages: number) => {
    setTodayPages(prev => prev + pages);
    try {
      const res = await apiRequest<ReadingProgressResponse>('/api/books/reading-progress', {
        method: 'POST',
        body: { pages },
      });
      setTodayPages(res.today_pages);
    } catch {
      // optimistic update already applied; ignore network errors
    }
  };

  const thisMonthFinished = books.filter(b => {
    if (b.status !== 'finished' || !b.dateFinished) return false;
    const d = new Date(b.dateFinished);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return { books, addBook, updateBook, removeBook, finishBook, byStatus, totalFinished, totalPages, thisMonthFinished, dailyGoal, todayPages, saveDailyGoal, addTodayPages };
}
