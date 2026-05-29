import { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type WorkoutExercise, type Workout, type PlanDay } from '../hooks/useWorkoutData';

const KEY_HISTORY = 'aisi_workouts';
const KEY_PLAN    = 'aisi_workout_plan';

interface WorkoutContextType {
  history: Workout[];
  plan: Record<string, PlanDay>;
  active: WorkoutExercise[];
  isActive: boolean;
  elapsed: number;
  workoutName: string;
  setWorkoutName: (name: string) => void;
  startWorkout: (defaultName?: string) => void;
  finishWorkout: (caloriesBurned: number) => Promise<void>;
  cancelWorkout: () => void;
  quickLog: (name: string, duration: number, caloriesBurned: number) => Promise<void>;
  addExercise: (ex: { name: string; muscleGroup: string }) => void;
  addSet: (exIdx: number) => void;
  updateSet: (exIdx: number, setIdx: number, field: string, value: string | boolean) => void;
  removeExercise: (exIdx: number) => void;
  savePlan: (updated: Record<string, PlanDay>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  formatTime: (s: number) => string;
}

const WorkoutContext = createContext<WorkoutContextType | null>(null);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [history, setHistory]         = useState<Workout[]>([]);
  const [plan, setPlan]               = useState<Record<string, PlanDay>>({});
  const [active, setActive]           = useState<WorkoutExercise[]>([]);
  const [isActive, setIsActive]       = useState(false);
  const [elapsed, setElapsed]         = useState(0);
  const [workoutName, setWorkoutName] = useState('Тренировка');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEY_HISTORY),
      AsyncStorage.getItem(KEY_PLAN),
    ]).then(([h, p]) => {
      if (h) setHistory(JSON.parse(h));
      if (p) setPlan(JSON.parse(p));
    });
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startWorkout = (defaultName?: string) => {
    setActive([]); setElapsed(0); setIsActive(true); setWorkoutName(defaultName ?? 'Workout');
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const finishWorkout = async (caloriesBurned: number) => {
    stopTimer();
    const workout: Workout = {
      id: Date.now().toString(), name: workoutName,
      date: new Date().toISOString(), duration: Math.round(elapsed / 60),
      exercises: active, caloriesBurned,
    };
    const updated = [workout, ...history];
    setHistory(updated);
    await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(updated));
    setIsActive(false); setActive([]); setElapsed(0);
  };

  const cancelWorkout = () => { stopTimer(); setIsActive(false); setActive([]); setElapsed(0); };

  const quickLog = async (name: string, duration: number, caloriesBurned: number) => {
    const workout: Workout = { id: Date.now().toString(), name, date: new Date().toISOString(), duration, exercises: [], caloriesBurned };
    const updated = [workout, ...history];
    setHistory(updated);
    await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(updated));
  };

  const addExercise = (ex: { name: string; muscleGroup: string }) => {
    setActive(a => [...a, { ...ex, sets: [{ reps: '', weight: '', done: false }] }]);
  };

  const addSet = (exIdx: number) => {
    setActive(a => a.map((ex, i) => i === exIdx
      ? { ...ex, sets: [...ex.sets, { reps: '', weight: '', done: false }] } : ex));
  };

  const updateSet = (exIdx: number, setIdx: number, field: string, value: string | boolean) => {
    setActive(a => a.map((ex, i) => i === exIdx
      ? { ...ex, sets: ex.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s) } : ex));
  };

  const removeExercise = (exIdx: number) => setActive(a => a.filter((_, i) => i !== exIdx));

  const savePlan = async (updated: Record<string, PlanDay>) => {
    setPlan(updated);
    await AsyncStorage.setItem(KEY_PLAN, JSON.stringify(updated));
  };

  const deleteWorkout = async (id: string) => {
    const updated = history.filter(w => w.id !== id);
    setHistory(updated); await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(updated));
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  return (
    <WorkoutContext.Provider value={{
      history, plan, active, isActive, elapsed, workoutName, setWorkoutName,
      startWorkout, finishWorkout, cancelWorkout, quickLog,
      addExercise, addSet, updateSet, removeExercise,
      savePlan, deleteWorkout, formatTime,
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkoutContext() {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error('useWorkoutContext must be used within WorkoutProvider');
  return ctx;
}
