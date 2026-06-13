import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest, subscribeAuthChange } from '../api/client';

export interface WorkoutSet {
  reps: string;
  weight: string;
  done: boolean;
}

export interface WorkoutExercise {
  name: string;
  muscleGroup: string;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  name: string;
  date: string;
  duration: number;
  exercises: WorkoutExercise[];
  caloriesBurned: number;
}

export interface PlanDay {
  name: string;
  exercises: string[];
}

export const DAYS_BG = ['Пон', 'Вт', 'Ср', 'Чет', 'Пет', 'Съб', 'Нед'];
export const DAYS = DAYS_BG; // backward compat

export type MuscleGroupKey = 'chest' | 'back' | 'legs' | 'shoulders' | 'biceps' | 'triceps' | 'abs' | 'cardio';

export const EXERCISE_LIBRARY: { name: string; muscleGroup: MuscleGroupKey }[] = [
  { name: 'Bench Press',       muscleGroup: 'chest'     },
  { name: 'Incline Press',     muscleGroup: 'chest'     },
  { name: 'Push-ups',          muscleGroup: 'chest'     },
  { name: 'Dumbbell Fly',      muscleGroup: 'chest'     },
  { name: 'Pull-ups',          muscleGroup: 'back'      },
  { name: 'Barbell Row',       muscleGroup: 'back'      },
  { name: 'Lat Pulldown',      muscleGroup: 'back'      },
  { name: 'Deadlift',          muscleGroup: 'back'      },
  { name: 'Squat',             muscleGroup: 'legs'      },
  { name: 'Leg Press',         muscleGroup: 'legs'      },
  { name: 'Lunges',            muscleGroup: 'legs'      },
  { name: 'Romanian Deadlift', muscleGroup: 'legs'      },
  { name: 'Shoulder Press',    muscleGroup: 'shoulders' },
  { name: 'Lateral Raises',    muscleGroup: 'shoulders' },
  { name: 'Front Raises',      muscleGroup: 'shoulders' },
  { name: 'Bicep Curl',        muscleGroup: 'biceps'    },
  { name: 'Hammer Curl',       muscleGroup: 'biceps'    },
  { name: 'Tricep Dips',       muscleGroup: 'triceps'   },
  { name: 'Tricep Pushdown',   muscleGroup: 'triceps'   },
  { name: 'Plank',             muscleGroup: 'abs'       },
  { name: 'Crunches',          muscleGroup: 'abs'       },
  { name: 'Russian Twists',    muscleGroup: 'abs'       },
  { name: 'Running',           muscleGroup: 'cardio'    },
  { name: 'Jump Rope',         muscleGroup: 'cardio'    },
  { name: 'Cycling',           muscleGroup: 'cardio'    },
];

// --- API <-> app shape mapping -------------------------------------------------

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

export function useWorkoutData() {
  const [history, setHistory]       = useState<Workout[]>([]);
  const [plan, setPlan]             = useState<Record<string, PlanDay>>({});
  const [active, setActive]         = useState<WorkoutExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('Тренировка');
  const [isActive, setIsActive]     = useState(false);
  const [elapsed, setElapsed]       = useState(0);
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
    return subscribeAuthChange(load);
  }, [load]);

  const startWorkout = () => {
    setActive([]);
    setElapsed(0);
    setIsActive(true);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const finishWorkout = async () => {
    stopTimer();
    const duration = Math.round(elapsed / 60);
    const exercises = active;
    setIsActive(false);
    setActive([]);
    setElapsed(0);
    try {
      const res = await apiRequest<WorkoutResponse>('/api/workouts', {
        method: 'POST',
        body: {
          name: workoutName,
          date: new Date().toISOString(),
          duration,
          exercises,
          calories_burned: 0,
        },
      });
      setHistory(h => [workoutFromApi(res), ...h]);
    } catch {
      // ignore network errors; workout is lost like other optimistic flows on failure
    }
  };

  const cancelWorkout = () => { stopTimer(); setIsActive(false); setActive([]); setElapsed(0); };

  const addExercise = (ex: { name: string; muscleGroup: string }) => {
    setActive(a => [...a, { ...ex, sets: [{ reps: '', weight: '', done: false }] }]);
  };

  const addSet = (exIdx: number) => {
    setActive(a => a.map((ex, i) => i === exIdx
      ? { ...ex, sets: [...ex.sets, { reps: '', weight: '', done: false }] }
      : ex));
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof WorkoutSet, value: string | boolean) => {
    setActive(a => a.map((ex, i) => i === exIdx
      ? { ...ex, sets: ex.sets.map((s, j) => j === setIdx ? { ...s, [field]: value } : s) }
      : ex));
  };

  const removeExercise = (exIdx: number) => {
    setActive(a => a.filter((_, i) => i !== exIdx));
  };

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

  const quickLog = async (name: string, duration: number) => {
    try {
      const res = await apiRequest<WorkoutResponse>('/api/workouts', {
        method: 'POST',
        body: {
          name,
          date: new Date().toISOString(),
          duration,
          exercises: [],
          calories_burned: 0,
        },
      });
      setHistory(h => [workoutFromApi(res), ...h]);
    } catch {
      // ignore network errors
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

  const muscleGroups = [...new Set(EXERCISE_LIBRARY.map(e => e.muscleGroup))];

  return {
    history, plan, active, isActive, elapsed, workoutName, setWorkoutName,
    startWorkout, finishWorkout, cancelWorkout, quickLog,
    addExercise, addSet, updateSet, removeExercise,
    savePlan, deleteWorkout, formatTime, muscleGroups,
  };
}
