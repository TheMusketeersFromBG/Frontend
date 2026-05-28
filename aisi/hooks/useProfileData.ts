import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'aisi_profile';

export interface ProfileData {
  name: string;
  photo: string;
  language: string;
  metrics: {
    height: string;
    weight: string;
    birthdate: string;
    chest: string;
    waist: string;
    hips: string;
    shoulders: string;
    bicep: string;
    thigh: string;
  };
  notifications: boolean;
}

const defaultData: ProfileData = {
  name: '',
  photo: '',
  language: 'BG',
  metrics: {
    height: '', weight: '', birthdate: '',
    chest: '', waist: '', hips: '',
    shoulders: '', bicep: '', thigh: '',
  },
  notifications: true,
};

export function useProfileData() {
  const [data, setData] = useState<ProfileData>(defaultData);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setData(JSON.parse(raw));
      setLoaded(true);
    });
  }, []);

  const save = async (updated: ProfileData) => {
    setData(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateMetric = (key: keyof ProfileData['metrics'], value: string) => {
    const updated = { ...data, metrics: { ...data.metrics, [key]: value } };
    save(updated);
  };

  const updateName = (name: string) => save({ ...data, name });
  const updatePhoto = (photo: string) => save({ ...data, photo });
  const updateLanguage = (language: string) => save({ ...data, language });

  const updateNotifications = (value: boolean) => save({ ...data, notifications: value });

  return { data, loaded, updateMetric, updateName, updatePhoto, updateNotifications, updateLanguage };
}
