import { useState, useEffect, useCallback, useRef } from 'react';
import { Pedometer } from 'expo-sensors';
import { apiRequest, subscribeAuthChange } from '../api/client';

const DEFAULT_GOAL = 10000;

interface StepsGoalResponse {
  goal: number;
}

function dateKey(d: Date) {
  return d.toISOString().split('T')[0];
}

function dayStart(d: Date) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  return s;
}

async function logSteps(steps: number, day?: string) {
  try {
    const query = day ? `?day=${day}` : '';
    await apiRequest(`/api/progress/steps${query}`, {
      method: 'POST',
      body: { steps },
    });
  } catch {
    // best-effort sync; ignore network errors
  }
}

export function useStepTracker() {
  const [steps, setSteps]         = useState(0);
  const [goal, setGoalState]      = useState(DEFAULT_GOAL);
  const [available, setAvailable] = useState(false);
  const yesterdaySaved = useRef(false);

  const loadGoal = useCallback(async () => {
    try {
      const res = await apiRequest<StepsGoalResponse>('/api/progress/steps-goal');
      setGoalState(res.goal);
    } catch {
      setGoalState(DEFAULT_GOAL);
    }
  }, []);

  useEffect(() => {
    loadGoal();
    return subscribeAuthChange(loadGoal);
  }, [loadGoal]);

  useEffect(() => {
    Pedometer.isAvailableAsync().then(async avail => {
      setAvailable(avail);
      if (!avail) return;

      // Запазваме стъпките от вчера на сървъра (ако вече не са записани, upsert е безопасен)
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
    if (yesterdaySaved.current) return;
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const key = dateKey(yesterday);

      const result = await Pedometer.getStepCountAsync(dayStart(yesterday), new Date(yesterday.setHours(23, 59, 59)));
      await logSteps(result.steps, key);
      yesterdaySaved.current = true;
    } catch {}
  };

  // Запазваме и днешните стъпки на сървъра (за графиките)
  useEffect(() => {
    if (steps > 0) {
      logSteps(steps);
    }
  }, [steps]);

  const saveGoal = async (g: number) => {
    setGoalState(g);
    try {
      const res = await apiRequest<StepsGoalResponse>('/api/progress/steps-goal', {
        method: 'PUT',
        body: { goal: g },
      });
      setGoalState(res.goal);
    } catch {
      // optimistic update already applied; ignore network errors
    }
  };

  const km         = (steps * 0.0008).toFixed(1);
  const kcal       = Math.round(steps * 0.04);
  const percentage = Math.min((steps / goal) * 100, 100);

  return { steps, goal, saveGoal, available, km, kcal, percentage };
}
