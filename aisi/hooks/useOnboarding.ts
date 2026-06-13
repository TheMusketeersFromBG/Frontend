import { useState, useEffect, useCallback } from 'react';
import { apiRequest, subscribeAuthChange } from '../api/client';

export interface OnboardingData {
  goal: string;
  activity: string;
  sports: string[];
  diet: string;
  allergies: string[];
  targetWeight: string;
  readingGenres: string[];
  readingFrequency: string;
  plan: 'free' | 'paid';
  createdAt: string;
}

interface OnboardingResponse {
  goal: string;
  activity: string;
  sports: string[];
  diet: string;
  allergies: string[];
  target_weight: string;
  reading_genres: string[];
  reading_frequency: string;
  plan: string;
  created_at: string;
}

const defaultData: OnboardingData = {
  goal: '', activity: '', sports: [], diet: '',
  allergies: [], targetWeight: '', readingGenres: [], readingFrequency: '',
  plan: 'free', createdAt: '',
};

function fromApi(res: OnboardingResponse): OnboardingData {
  return {
    goal: res.goal,
    activity: res.activity,
    sports: res.sports,
    diet: res.diet,
    allergies: res.allergies,
    targetWeight: res.target_weight,
    readingGenres: res.reading_genres,
    readingFrequency: res.reading_frequency,
    plan: res.plan === 'paid' ? 'paid' : 'free',
    createdAt: res.created_at,
  };
}

function toApi(data: OnboardingData) {
  return {
    goal: data.goal,
    activity: data.activity,
    sports: data.sports,
    diet: data.diet,
    allergies: data.allergies,
    target_weight: data.targetWeight,
    reading_genres: data.readingGenres,
    reading_frequency: data.readingFrequency,
    plan: data.plan,
  };
}

export function useOnboarding() {
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [completed, setCompleted] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiRequest<OnboardingResponse>('/api/onboarding');
      const parsed = fromApi(res);
      setData(parsed);
      setCompleted(Boolean(parsed.goal));
    } catch {
      setData(defaultData);
      setCompleted(false);
    }
  }, []);

  useEffect(() => {
    load();
    return subscribeAuthChange(load);
  }, [load]);

  const save = async (updated: OnboardingData) => {
    const res = await apiRequest<OnboardingResponse>('/api/onboarding', {
      method: 'PUT',
      body: toApi(updated),
    });
    const parsed = fromApi(res);
    setData(parsed);
    setCompleted(true);
  };

  return { data, completed, save };
}
