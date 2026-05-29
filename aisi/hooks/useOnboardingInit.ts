import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingData } from './useOnboarding';

// Изчислява калорийна цел по цел + активност
function calcCalorieGoal(goal: string, activity: string): number {
  let base = 2000;
  if (goal === 'lose')     base -= 300;
  if (goal === 'gain')     base += 400;
  if (activity === 'sedentary') base -= 200;
  if (activity === 'moderate')  base += 200;
  if (activity === 'very')      base += 500;
  return Math.round(base / 50) * 50; // закръгляме до 50
}

// Изчислява воден прием по активност
function calcWaterGoal(activity: string): number {
  const map: Record<string, number> = {
    sedentary: 6, light: 7, moderate: 8, very: 10,
  };
  return map[activity] ?? 8;
}

// Макроси по цел
function calcMacros(goal: string, calories: number) {
  if (goal === 'gain') return { protein: Math.round(calories * 0.30 / 4), carbs: Math.round(calories * 0.45 / 4), fat: Math.round(calories * 0.25 / 9) };
  if (goal === 'lose') return { protein: Math.round(calories * 0.35 / 4), carbs: Math.round(calories * 0.40 / 4), fat: Math.round(calories * 0.25 / 9) };
  return { protein: Math.round(calories * 0.25 / 4), carbs: Math.round(calories * 0.50 / 4), fat: Math.round(calories * 0.25 / 9) };
}

// Дневна цел за четене
function calcReadingGoal(freq: string): number {
  const map: Record<string, number> = {
    never: 5, monthly: 10, biweekly: 20, weekly: 40,
  };
  return map[freq] ?? 10;
}

export async function initFromOnboarding(data: OnboardingData) {
  const today = new Date().toISOString().split('T')[0];
  const calories = calcCalorieGoal(data.goal, data.activity);
  const water    = calcWaterGoal(data.activity);
  const macros   = calcMacros(data.goal, calories);
  const pages    = calcReadingGoal(data.readingFrequency);

  // Задаваме калорийна цел за днес (и като default)
  const calKey = `aisi_calories_${today}`;
  const existing = await AsyncStorage.getItem(calKey);
  if (!existing) {
    await AsyncStorage.setItem(calKey, JSON.stringify({ entries: [], goal: calories }));
  } else {
    const parsed = JSON.parse(existing);
    if (!parsed.goal || parsed.goal === 2000) {
      await AsyncStorage.setItem(calKey, JSON.stringify({ ...parsed, goal: calories }));
    }
  }

  // Хранителни цели
  const nutritionGoals = { protein: macros.protein, carbs: macros.carbs, fat: macros.fat, water };
  const existingGoals = await AsyncStorage.getItem('aisi_nutrition_goals');
  if (!existingGoals) {
    await AsyncStorage.setItem('aisi_nutrition_goals', JSON.stringify(nutritionGoals));
  }

  // Дневна цел за четене
  const existingReadingGoal = await AsyncStorage.getItem('aisi_books_daily_goal');
  if (!existingReadingGoal) {
    await AsyncStorage.setItem('aisi_books_daily_goal', JSON.stringify(pages));
  }
}
