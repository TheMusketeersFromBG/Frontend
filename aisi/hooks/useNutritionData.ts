import { useState, useEffect, useCallback } from 'react';
import { apiRequest, subscribeAuthChange } from '../api/client';

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

interface WaterResponse {
  date: string;
  glasses: number;
}

interface SupplementResponse {
  id: number;
  name: string;
  dose: string;
  time: string;
  taken_today: boolean;
}

interface NutritionGoalsResponse {
  protein: number;
  carbs: number;
  fat: number;
  water: number;
}

interface RecipeResponse {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prep_time: string;
  description: string;
}

interface MealSlotResponse {
  breakfast: string;
  lunch: string;
  dinner: string;
}

interface MealPlanResponse {
  meal_plan: Record<string, MealSlotResponse>;
}

function todayKey() {
  return new Date().toISOString().split('T')[0];
}

const DEFAULT_GOALS: NutritionGoals = { protein: 150, carbs: 250, fat: 70, water: 8 };

function fromApiSupplement(s: SupplementResponse): Supplement {
  return {
    id: String(s.id),
    name: s.name,
    dose: s.dose,
    time: s.time,
    takenToday: s.taken_today,
  };
}

function fromApiGoals(g: NutritionGoalsResponse): NutritionGoals {
  return {
    protein: g.protein,
    carbs: g.carbs,
    fat: g.fat,
    water: g.water,
  };
}

function fromApiRecipe(r: RecipeResponse): Recipe {
  return {
    id: String(r.id),
    name: r.name,
    calories: r.calories,
    protein: r.protein,
    carbs: r.carbs,
    fat: r.fat,
    prepTime: r.prep_time,
    description: r.description,
  };
}

export function useNutritionData() {
  const [waterGlasses, setWaterGlasses]   = useState(0);
  const [supplements, setSupplements]     = useState<Supplement[]>([]);
  const [goals, setGoalsState]            = useState<NutritionGoals>(DEFAULT_GOALS);
  const [recipes, setRecipes]             = useState<Recipe[]>([]);
  const [mealPlan, setMealPlanState]      = useState<Record<string, MealSlot>>({});

  const load = useCallback(async () => {
    try {
      const [w, s, g, r, m] = await Promise.all([
        apiRequest<WaterResponse>(`/api/nutrition/water/${todayKey()}`),
        apiRequest<SupplementResponse[]>('/api/nutrition/supplements'),
        apiRequest<NutritionGoalsResponse>('/api/nutrition/goals'),
        apiRequest<RecipeResponse[]>('/api/nutrition/recipes'),
        apiRequest<MealPlanResponse>('/api/nutrition/meal-plan'),
      ]);
      setWaterGlasses(w.glasses);
      setSupplements(s.map(fromApiSupplement));
      setGoalsState(fromApiGoals(g));
      setRecipes(r.map(fromApiRecipe));
      setMealPlanState(m.meal_plan);
    } catch {
      setWaterGlasses(0);
      setSupplements([]);
      setGoalsState(DEFAULT_GOALS);
      setRecipes([]);
      setMealPlanState({});
    }
  }, []);

  useEffect(() => {
    load();
    return subscribeAuthChange(load);
  }, [load]);

  const addWater = async () => {
    setWaterGlasses(prev => prev + 1);
    try {
      const res = await apiRequest<WaterResponse>(`/api/nutrition/water/${todayKey()}`, { method: 'POST' });
      setWaterGlasses(res.glasses);
    } catch {
      setWaterGlasses(prev => Math.max(0, prev - 1));
    }
  };

  const removeWater = async () => {
    setWaterGlasses(prev => Math.max(0, prev - 1));
    try {
      const res = await apiRequest<WaterResponse>(`/api/nutrition/water/${todayKey()}`, { method: 'DELETE' });
      setWaterGlasses(res.glasses);
    } catch {
      setWaterGlasses(prev => prev + 1);
    }
  };

  const toggleSupplement = async (id: string) => {
    setSupplements(prev => prev.map(s => s.id === id ? { ...s, takenToday: !s.takenToday } : s));
    try {
      const res = await apiRequest<SupplementResponse>(`/api/nutrition/supplements/${id}/toggle`, { method: 'POST' });
      setSupplements(prev => prev.map(s => s.id === id ? fromApiSupplement(res) : s));
    } catch {
      setSupplements(prev => prev.map(s => s.id === id ? { ...s, takenToday: !s.takenToday } : s));
    }
  };

  const addSupplement = async (s: Omit<Supplement, 'id' | 'takenToday'>) => {
    try {
      const res = await apiRequest<SupplementResponse>('/api/nutrition/supplements', {
        method: 'POST',
        body: { name: s.name, dose: s.dose, time: s.time },
      });
      setSupplements(prev => [...prev, fromApiSupplement(res)]);
    } catch {
      // ignore network errors; nothing to roll back since we didn't optimistically add
    }
  };

  const removeSupplement = async (id: string) => {
    setSupplements(prev => prev.filter(s => s.id !== id));
    try {
      await apiRequest<void>(`/api/nutrition/supplements/${id}`, { method: 'DELETE' });
    } catch {
      await load();
    }
  };

  const saveGoals = async (g: NutritionGoals) => {
    setGoalsState(g);
    try {
      const res = await apiRequest<NutritionGoalsResponse>('/api/nutrition/goals', {
        method: 'PUT',
        body: g,
      });
      setGoalsState(fromApiGoals(res));
    } catch {
      // optimistic update already applied; ignore network errors
    }
  };

  const addRecipe = async (r: Omit<Recipe, 'id'>) => {
    try {
      const res = await apiRequest<RecipeResponse>('/api/nutrition/recipes', {
        method: 'POST',
        body: {
          name: r.name,
          calories: r.calories,
          protein: r.protein,
          carbs: r.carbs,
          fat: r.fat,
          prep_time: r.prepTime,
          description: r.description,
        },
      });
      setRecipes(prev => [...prev, fromApiRecipe(res)]);
    } catch {
      // ignore network errors; nothing to roll back since we didn't optimistically add
    }
  };

  const removeRecipe = async (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
    try {
      await apiRequest<void>(`/api/nutrition/recipes/${id}`, { method: 'DELETE' });
    } catch {
      await load();
    }
  };

  const updateMealSlot = async (day: string, slot: keyof MealSlot, value: string) => {
    const defaultSlot: MealSlot = { breakfast: '', lunch: '', dinner: '' };
    setMealPlanState(prev => ({
      ...prev,
      [day]: { ...defaultSlot, ...(prev[day] || {}), [slot]: value },
    }));
    try {
      const res = await apiRequest<MealPlanResponse>(`/api/nutrition/meal-plan/${day}`, {
        method: 'PUT',
        body: { slot, value },
      });
      setMealPlanState(res.meal_plan);
    } catch {
      await load();
    }
  };

  return {
    waterGlasses, addWater, removeWater,
    supplements, toggleSupplement, addSupplement, removeSupplement,
    goals, saveGoals,
    recipes, addRecipe, removeRecipe,
    mealPlan, updateMealSlot,
  };
}
