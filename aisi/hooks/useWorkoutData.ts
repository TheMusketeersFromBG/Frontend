import { useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_HISTORY = 'aisi_workouts';
const KEY_PLAN    = 'aisi_workout_plan';

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

export function useWorkoutData() {
  const [history, setHistory]       = useState<Workout[]>([]);
  const [plan, setPlan]             = useState<Record<string, PlanDay>>({});
  const [active, setActive]         = useState<WorkoutExercise[]>([]);
  const [workoutName, setWorkoutName] = useState('Тренировка');
  const [isActive, setIsActive]     = useState(false);
  const [elapsed, setElapsed]       = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(KEY_HISTORY),
      AsyncStorage.getItem(KEY_PLAN),
    ]).then(([h, p]) => {
      if (h) setHistory(JSON.parse(h));
      if (p) setPlan(JSON.parse(p));
    });
  }, []);

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
    const workout: Workout = {
      id: Date.now().toString(),
      name: workoutName,
      date: new Date().toISOString(),
      duration: Math.round(elapsed / 60),
      exercises: active,
    };
    const updated = [workout, ...history];
    setHistory(updated);
    await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(updated));
    setIsActive(false);
    setActive([]);
    setElapsed(0);
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
    await AsyncStorage.setItem(KEY_PLAN, JSON.stringify(updated));
  };

  const quickLog = async (name: string, duration: number) => {
    const workout: Workout = {
      id: Date.now().toString(),
      name,
      date: new Date().toISOString(),
      duration,
      exercises: [],
    };
    const updated = [workout, ...history];
    setHistory(updated);
    await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(updated));
  };

  const deleteWorkout = async (id: string) => {
    const updated = history.filter(w => w.id !== id);
    setHistory(updated);
    await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(updated));
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
