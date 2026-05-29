import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_WATER       = 'aisi_water_';
const KEY_SUPPLEMENTS = 'aisi_supplements';
const KEY_GOALS       = 'aisi_nutrition_goals';
const KEY_RECIPES     = 'aisi_recipes';
const KEY_MEALPLAN    = 'aisi_mealplan';

export interface Supplement {
  id: string;
  name: string;
  dose: string;
  time: string;
  takenToday: boolean;
}

export interface NutritionGoals {
  protein: number;
  carbs: number;
  fat: number;
  water: number; // glasses
}

export interface Recipe {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  description: string;
}

export interface MealSlot {
  breakfast: string;
  lunch: string;
  dinner: string;
}

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_GOALS: NutritionGoals = { protein: 150, carbs: 250, fat: 70, water: 8 };

const SAMPLE_RECIPES: Recipe[] = [
  { id: '1', name: 'Овесена каша с плодове', calories: 320, protein: 12, carbs: 58, fat: 6, prepTime: '10 мин', description: 'Здравословна закуска богата на фибри и витамини.' },
  { id: '2', name: 'Пилешки гърди на скара', calories: 280, protein: 52, carbs: 0, fat: 6, prepTime: '20 мин', description: 'Постно месо богато на протеин.' },
  { id: '3', name: 'Гръцка салата', calories: 180, protein: 8, carbs: 12, fat: 12, prepTime: '10 мин', description: 'Свежа салата с фета и маслини.' },
  { id: '4', name: 'Лосос с зеленчуци', calories: 420, protein: 38, carbs: 15, fat: 24, prepTime: '25 мин', description: 'Богат на омега-3 мастни киселини.' },
];

export function useNutritionData() {
  const [waterGlasses, setWaterGlasses]   = useState(0);
  const [supplements, setSupplements]     = useState<Supplement[]>([]);
  const [goals, setGoalsState]            = useState<NutritionGoals>(DEFAULT_GOALS);
  const [recipes, setRecipes]             = useState<Recipe[]>(SAMPLE_RECIPES);
  const [mealPlan, setMealPlanState]      = useState<Record<string, MealSlot>>({});

  useEffect(() => {
    const load = async () => {
      const [w, s, g, r, m] = await Promise.all([
        AsyncStorage.getItem(KEY_WATER + todayKey()),
        AsyncStorage.getItem(KEY_SUPPLEMENTS),
        AsyncStorage.getItem(KEY_GOALS),
        AsyncStorage.getItem(KEY_RECIPES),
        AsyncStorage.getItem(KEY_MEALPLAN),
      ]);
      if (w) setWaterGlasses(JSON.parse(w));
      if (s) setSupplements(JSON.parse(s));
      if (g) setGoalsState(JSON.parse(g));
      if (r) setRecipes(JSON.parse(r));
      if (m) setMealPlanState(JSON.parse(m));
    };
    load();
  }, []);

  const addWater = async () => {
    const next = waterGlasses + 1;
    setWaterGlasses(next);
    await AsyncStorage.setItem(KEY_WATER + todayKey(), JSON.stringify(next));
  };
  const removeWater = async () => {
    const next = Math.max(0, waterGlasses - 1);
    setWaterGlasses(next);
    await AsyncStorage.setItem(KEY_WATER + todayKey(), JSON.stringify(next));
  };

  const toggleSupplement = async (id: string) => {
    const updated = supplements.map(s => s.id === id ? { ...s, takenToday: !s.takenToday } : s);
    setSupplements(updated);
    await AsyncStorage.setItem(KEY_SUPPLEMENTS, JSON.stringify(updated));
  };
  const addSupplement = async (s: Omit<Supplement, 'id' | 'takenToday'>) => {
    const updated = [...supplements, { ...s, id: Date.now().toString(), takenToday: false }];
    setSupplements(updated);
    await AsyncStorage.setItem(KEY_SUPPLEMENTS, JSON.stringify(updated));
  };
  const removeSupplement = async (id: string) => {
    const updated = supplements.filter(s => s.id !== id);
    setSupplements(updated);
    await AsyncStorage.setItem(KEY_SUPPLEMENTS, JSON.stringify(updated));
  };

  const saveGoals = async (g: NutritionGoals) => {
    setGoalsState(g);
    await AsyncStorage.setItem(KEY_GOALS, JSON.stringify(g));
  };

  const addRecipe = async (r: Omit<Recipe, 'id'>) => {
    const updated = [...recipes, { ...r, id: Date.now().toString() }];
    setRecipes(updated);
    await AsyncStorage.setItem(KEY_RECIPES, JSON.stringify(updated));
  };
  const removeRecipe = async (id: string) => {
    const updated = recipes.filter(r => r.id !== id);
    setRecipes(updated);
    await AsyncStorage.setItem(KEY_RECIPES, JSON.stringify(updated));
  };

  const updateMealSlot = async (day: string, slot: keyof MealSlot, value: string) => {
    const updated = { ...mealPlan, [day]: { ...(mealPlan[day] || {}), [slot]: value } };
    setMealPlanState(updated as Record<string, MealSlot>);
    await AsyncStorage.setItem(KEY_MEALPLAN, JSON.stringify(updated));
  };

  return {
    waterGlasses, addWater, removeWater,
    supplements, toggleSupplement, addSupplement, removeSupplement,
    goals, saveGoals,
    recipes, addRecipe, removeRecipe,
    mealPlan, updateMealSlot,
  };
}
