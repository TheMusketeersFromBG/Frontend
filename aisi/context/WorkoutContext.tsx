import { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { apiRequest, subscribeAuthChange } from '../api/client';
import { type WorkoutExercise, type Workout, type PlanDay } from '../hooks/useWorkoutData';

interface WorkoutResponse {
  id: number;
  name: string;
  date: string;
  duration: number;
  exercises: WorkoutExercise[];
  calories_burned: number;
}

interface PlanDayResponse {
  name: string;
  exercises: string[];
}

interface PlanResponse {
  plan: Record<string, PlanDayResponse>;
}

function workoutFromApi(res: WorkoutResponse): Workout {
  return {
    id: String(res.id),
    name: res.name,
    date: res.date,
    duration: res.duration,
    exercises: res.exercises,
    caloriesBurned: res.calories_burned,
  };
}

function planFromApi(res: PlanResponse): Record<string, PlanDay> {
  const plan: Record<string, PlanDay> = {};
  for (const [day, d] of Object.entries(res.plan)) {
    plan[day] = { name: d.name, exercises: d.exercises };
  }
  return plan;
}

function planToApi(plan: Record<string, PlanDay>): { plan: Record<string, PlanDayResponse> } {
  const out: Record<string, PlanDayResponse> = {};
  for (const [day, d] of Object.entries(plan)) {
    out[day] = { name: d.name, exercises: d.exercises };
  }
  return { plan: out };
}

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

  const load = useCallback(async () => {
    try {
      const [historyRes, planRes] = await Promise.all([
        apiRequest<WorkoutResponse[]>('/api/workouts'),
        apiRequest<PlanResponse>('/api/workouts/plan'),
      ]);
      setHistory(historyRes.map(workoutFromApi));
      setPlan(planFromApi(planRes));
    } catch {
      setHistory([]);
      setPlan({});
    }
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = subscribeAuthChange(load);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      unsubscribe();
    };
  }, [load]);

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startWorkout = (defaultName?: string) => {
    setActive([]); setElapsed(0); setIsActive(true); setWorkoutName(defaultName ?? 'Workout');
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const finishWorkout = async (caloriesBurned: number) => {
    stopTimer();
    const duration = Math.round(elapsed / 60);
    const exercises = active;
    const name = workoutName;
    setIsActive(false); setActive([]); setElapsed(0);
    try {
      const res = await apiRequest<WorkoutResponse>('/api/workouts', {
        method: 'POST',
        body: {
          name,
          date: new Date().toISOString(),
          duration,
          exercises,
          calories_burned: caloriesBurned,
        },
      });
      setHistory(h => [workoutFromApi(res), ...h]);
    } catch {
      // ignore network errors
    }
  };

  const cancelWorkout = () => { stopTimer(); setIsActive(false); setActive([]); setElapsed(0); };

  const quickLog = async (name: string, duration: number, caloriesBurned: number) => {
    try {
      const res = await apiRequest<WorkoutResponse>('/api/workouts', {
        method: 'POST',
        body: {
          name,
          date: new Date().toISOString(),
          duration,
          exercises: [],
          calories_burned: caloriesBurned,
        },
      });
      setHistory(h => [workoutFromApi(res), ...h]);
    } catch {
      // ignore network errors
    }
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
    try {
      const res = await apiRequest<PlanResponse>('/api/workouts/plan', {
        method: 'PUT',
        body: planToApi(updated),
      });
      setPlan(planFromApi(res));
    } catch {
      // optimistic update already applied; ignore network errors
    }
  };

  const deleteWorkout = async (id: string) => {
    setHistory(h => h.filter(w => w.id !== id));
    try {
      await apiRequest(`/api/workouts/${id}`, { method: 'DELETE' });
    } catch {
      // optimistic update already applied; ignore network errors
    }
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
