import { useState, useEffect, useCallback } from 'react';
import { apiRequest, subscribeAuthChange } from '../api/client';

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

interface ProfileMetricsResponse {
  height: number | null;
  weight: number | null;
  chest: number | null;
  waist: number | null;
  hips: number | null;
  shoulders: number | null;
  bicep: number | null;
  thigh: number | null;
  birthdate: string | null;
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
  language: string;
  photo: string | null;
  notifications: boolean;
  metrics: ProfileMetricsResponse;
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

function numToStr(n: number | null | undefined): string {
  return n === null || n === undefined ? '' : String(n);
}

function strToNum(s: string): number | null {
  if (!s.trim()) return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

function fromApi(res: UserResponse): ProfileData {
  return {
    name: res.name,
    photo: res.photo ?? '',
    language: res.language,
    metrics: {
      height: numToStr(res.metrics.height),
      weight: numToStr(res.metrics.weight),
      birthdate: res.metrics.birthdate ?? '',
      chest: numToStr(res.metrics.chest),
      waist: numToStr(res.metrics.waist),
      hips: numToStr(res.metrics.hips),
      shoulders: numToStr(res.metrics.shoulders),
      bicep: numToStr(res.metrics.bicep),
      thigh: numToStr(res.metrics.thigh),
    },
    notifications: res.notifications,
  };
}

function toApi(data: ProfileData) {
  return {
    name: data.name,
    photo: data.photo || null,
    language: data.language,
    notifications: data.notifications,
    metrics: {
      height: strToNum(data.metrics.height),
      weight: strToNum(data.metrics.weight),
      chest: strToNum(data.metrics.chest),
      waist: strToNum(data.metrics.waist),
      hips: strToNum(data.metrics.hips),
      shoulders: strToNum(data.metrics.shoulders),
      bicep: strToNum(data.metrics.bicep),
      thigh: strToNum(data.metrics.thigh),
      birthdate: data.metrics.birthdate.trim() || null,
    },
  };
}

export function useProfileData() {
  const [data, setData] = useState<ProfileData>(defaultData);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiRequest<UserResponse>('/api/users/me');
      setData(fromApi(res));
    } catch {
      setData(defaultData);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
    return subscribeAuthChange(load);
  }, [load]);

  const save = async (updated: ProfileData) => {
    setData(updated);
    try {
      const res = await apiRequest<UserResponse>('/api/users/me', {
        method: 'PUT',
        body: toApi(updated),
      });
      setData(fromApi(res));
    } catch {
      // optimistic update already applied; ignore network errors
    }
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
