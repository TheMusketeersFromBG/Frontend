import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'aisi_onboarding';

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

const defaultData: OnboardingData = {
  goal: '', activity: '', sports: [], diet: '',
  allergies: [], targetWeight: '', readingGenres: [], readingFrequency: '',
  plan: 'free', createdAt: '',
};

export function useOnboarding() {
  const [data, setData]         = useState<OnboardingData>(defaultData);
  const [completed, setCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) { setData(JSON.parse(raw)); setCompleted(true); }
      else setCompleted(false);
    });
  }, []);

  const save = async (updated: OnboardingData) => {
    const withDate = { ...updated, createdAt: new Date().toISOString() };
    setData(withDate);
    setCompleted(true);
    await AsyncStorage.setItem(KEY, JSON.stringify(withDate));
  };

  const reset = async () => {
    setData(defaultData);
    setCompleted(false);
    await AsyncStorage.removeItem(KEY);
  };

  return { data, completed, save, reset };
}
