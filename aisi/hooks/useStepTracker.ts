import { useState, useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_GOAL = 'aisi_steps_goal';
const KEY_HIST = 'aisi_steps_history';

function dateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

function dayStart(d: Date) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

export function useStepTracker() {
  const [steps, setSteps]         = useState(0);
  const [goal, setGoalState]      = useState(10000);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY_GOAL).then(v => { if (v) setGoalState(JSON.parse(v)); });

    Pedometer.isAvailableAsync().then(async avail => {
      setAvailable(avail);
      if (!avail) return;

      // Запазваме стъпките от вчера ако ги нямаме
      await saveYesterdaySteps();

      // Стъпки за днес
      const today = new Date();
      Pedometer.getStepCountAsync(dayStart(today), today)
        .then(res => setSteps(res.steps))
        .catch(() => {});

      const sub = Pedometer.watchStepCount(res => setSteps(res.steps));
      return () => sub.remove();
    });
  }, []);

  const saveYesterdaySteps = async () => {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const key = dateKey(yesterday);

      const histRaw = await AsyncStorage.getItem(KEY_HIST);
      const hist: Record<string, number> = histRaw ? JSON.parse(histRaw) : {};

      if (hist[key] !== undefined) return; // вече записано

      const result = await Pedometer.getStepCountAsync(dayStart(yesterday), new Date(yesterday.setHours(23, 59, 59)));
      hist[key] = result.steps;
      await AsyncStorage.setItem(KEY_HIST, JSON.stringify(hist));
    } catch {}
  };

  // Запазваме и днешните стъпки в историята (за графиките)
  useEffect(() => {
    if (steps > 0) {
      const today = dateKey(new Date());
      AsyncStorage.getItem(KEY_HIST).then(raw => {
        const hist: Record<string, number> = raw ? JSON.parse(raw) : {};
        hist[today] = steps;
        AsyncStorage.setItem(KEY_HIST, JSON.stringify(hist));
      });
    }
  }, [steps]);

  const saveGoal = async (g: number) => {
    setGoalState(g);
    await AsyncStorage.setItem(KEY_GOAL, JSON.stringify(g));
  };

  const km         = (steps * 0.0008).toFixed(1);
  const kcal       = Math.round(steps * 0.04);
  const percentage = Math.min((steps / goal) * 100, 100);

  return { steps, goal, saveGoal, available, km, kcal, percentage };
}
