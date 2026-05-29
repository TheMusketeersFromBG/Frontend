import { useState, useRef, useEffect } from 'react';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'aisi_ski_sessions';

export interface SkiRun {
  startTime: string;
  endTime: string;
  maxSpeed: number;   // km/h
  distance: number;   // km
  duration: number;   // seconds
}

export interface SkiSession {
  id: string;
  date: string;
  runs: SkiRun[];
  totalDistance: number;
  maxSpeed: number;
  totalTime: number;
}

export function useSkiTracker() {
  const [sessions, setSessions]     = useState<SkiSession[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentRun, setCurrentRun] = useState<SkiRun | null>(null);
  const [runs, setRuns]             = useState<SkiRun[]>([]);
  const [speed, setSpeed]           = useState(0);
  const [distance, setDistance]     = useState(0);
  const [maxSpeed, setMaxSpeed]     = useState(0);
  const [elapsed, setElapsed]       = useState(0);

  const locationSub = useRef<Location.LocationSubscription | null>(null);
  const lastPos     = useRef<Location.LocationObject | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const runStart    = useRef<string>('');
  const runDist     = useRef(0);
  const runMaxSpeed = useRef(0);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => { if (raw) setSessions(JSON.parse(raw)); });
    return () => stopTracking();
  }, []);

  const startTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return false;

    setIsTracking(true);
    setRuns([]);
    setDistance(0);
    setMaxSpeed(0);
    setElapsed(0);

    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

    locationSub.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.BestForNavigation, timeInterval: 1000, distanceInterval: 5 },
      pos => {
        const spd = (pos.coords.speed ?? 0) * 3.6; // m/s → km/h
        setSpeed(Math.max(0, spd));
        setMaxSpeed(m => Math.max(m, spd));

        if (lastPos.current) {
          const d = calcDistance(
            lastPos.current.coords.latitude, lastPos.current.coords.longitude,
            pos.coords.latitude, pos.coords.longitude,
          );
          setDistance(dist => dist + d);
        }
        lastPos.current = pos;
      }
    );
    return true;
  };

  const startRun = () => {
    runStart.current  = new Date().toISOString();
    runDist.current   = 0;
    runMaxSpeed.current = 0;
    setCurrentRun({ startTime: runStart.current, endTime: '', maxSpeed: 0, distance: 0, duration: 0 });
  };

  const endRun = () => {
    if (!runStart.current) return;
    const run: SkiRun = {
      startTime: runStart.current,
      endTime: new Date().toISOString(),
      maxSpeed: runMaxSpeed.current,
      distance: runDist.current,
      duration: Math.round((Date.now() - new Date(runStart.current).getTime()) / 1000),
    };
    setRuns(r => [...r, run]);
    setCurrentRun(null);
    runStart.current = '';
  };

  const stopTracking = async () => {
    locationSub.current?.remove();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsTracking(false);
    setSpeed(0);
    lastPos.current = null;
  };

  const saveSession = async () => {
    await stopTracking();
    const session: SkiSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      runs,
      totalDistance: distance,
      maxSpeed,
      totalTime: elapsed,
    };
    const updated = [session, ...sessions];
    setSessions(updated);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
    setRuns([]);
    setDistance(0);
    setElapsed(0);
    setMaxSpeed(0);
  };

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
      : `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return {
    sessions, isTracking, currentRun, runs, speed, distance, maxSpeed, elapsed,
    startTracking, startRun, endRun, stopTracking, saveSession, formatTime,
  };
}

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
