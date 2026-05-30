export type Lang = 'BG' | 'EN' | 'EL' | 'ZH' | 'JP' | 'KO' | 'DE' | 'RU' | 'FR' | 'ES' | 'IT' | 'PT';

export interface T {
  // Common
  back: string; save: string; cancel: string; add: string; delete: string;
  edit: string; close: string; next: string; finish: string; yes: string; no: string;
  comingSoon: string; search: string; confirm: string; ok: string;

  // Auth
  tagline: string; login: string; signup: string; email: string; password: string;
  confirmPassword: string; name: string; enterApp: string; noAccount: string;
  hasAccount: string; register: string; fillFields: string;
  invalidEmail: string; invalidPassword: string; passwordsMismatch: string;
  invalidCredentials: string; passwordHint: string;

  // Greetings
  goodMorning: string; goodDay: string; goodEvening: string;

  // Sections
  workouts: string; nutrition: string; calories: string;
  progress: string; books: string; profile: string;
  workoutsDesc: string; nutritionDesc: string; caloriesDesc: string;
  progressDesc: string; booksDesc: string; profileDesc: string;

  // Summary
  consumed: string; burned: string; steps: string; pages: string;

  // Calories
  today: string; goal: string; remaining: string; overGoal: string;
  addFood: string; foodName: string; kcal: string; protein: string;
  carbs: string; fat: string; camera: string; aiChat: string; manual: string;
  nothingAdded: string; dailyGoal: string; aiChatMsg: string;

  // Books
  reading: string; wantToRead: string; finished: string; addBook: string;
  title: string; author: string; genre: string; cover: string; notes: string;
  rating: string; startReading: string; finishReading: string;
  aiRecs: string; aiRecsMsg: string; noBooksYet: string;
  noBooksWant: string; noBooksFinished: string; totalBooks: string;
  thisMonth: string; totalPages: string; pagesDay: string;
  addedCover: string; aiComing: string; pagesAdded: string;

  // Workouts
  plan: string; tracking: string; startWorkout: string; quickAdd: string;
  exercises: string; sets: string; reps: string; weight: string;
  addExercise: string; addSet: string; finishWorkout: string;
  cancelWorkout: string; noWorkouts: string; duration: string;
  activity: string; minutes: string; chooseActivity: string; otherActivity: string;
  loadPlan: string; aiProgram: string; aiProgramMsg: string; restDay: string;

  // Nutrition
  water: string; recipes: string; supplements: string; weeklyPlan: string;
  goalsTab: string; addGlass: string; removeGlass: string; glasses: string;
  ml: string; waterInfo: string; addRecipe: string; addSupplement: string;
  dose: string; time: string; taken: string; recipeName: string;
  prepTime: string; description: string; breakfast: string; lunch: string;
  dinner: string; noSupplements: string; aiRecipes: string; aiSupps: string;
  aiMealPlan: string; aiRecipesMsg: string; SuppsMsg: string; aiMealMsg: string;

  // Progress
  streak: string; activeStreak: string; overview: string; week: string;
  month: string; body: string; weight_: string; enterWeight: string;
  kg: string; noData: string; atLeast2: string; stepsGoal: string;
  notAvailable: string; km: string;

  // Profile
  basicMeasurements: string; detailedMeasurements: string; statistics: string;
  achievements: string; settings: string; notifications: string; darkMode: string;
  language: string; logout: string; logoutConfirm: string; logoutMsg: string;
  show: string; hide: string; age: string; height: string; cm: string;
  years: string; chest: string; waist: string; hips: string; shoulders: string;
  bicep: string; thigh: string; daysStreak: string; activeDays: string;
  bmi: string; bmiNote: string; enterName: string; yourName: string;
  freePlan: string; paidPlan: string; upgradeMsg: string;

  exerciseSingular: string; planNameHint: string; todayPlanLabel: string;

  // Ski
  skiStart: string; skiEmpty: string; skiActive: string; skiRuns: string;
  skiStartRun: string; skiEndRun: string; skiEnd: string; skiSpeed: string;
  skiMaxSpeed: string; skiDistance: string;

  // Sample recipes
  r1Name: string; r1Desc: string; r2Name: string; r2Desc: string;
  r3Name: string; r3Desc: string; r4Name: string; r4Desc: string;
  minLabel: string;

  // Achievements
  ach1Title: string; ach1Desc: string; ach2Title: string; ach2Desc: string;
  ach3Title: string; ach3Desc: string; ach4Title: string; ach4Desc: string;
  ach5Title: string; ach5Desc: string; ach6Title: string; ach6Desc: string;

  // Sports
  sFitness: string; sRunning: string; sSwimming: string; sCycling: string;
  sFootball: string; sBasketball: string; sVolleyball: string; sTennis: string;
  sYoga: string; sMartial: string; sBoxing: string; sCrossfit: string;
  sHiking: string; sClimbing: string; sSkiing: string; sDancing: string;
  sGolf: string; sHandball: string;

  // Muscle groups
  mgChest: string; mgBack: string; mgLegs: string; mgShoulders: string;
  mgBiceps: string; mgTriceps: string; mgAbs: string; mgCardio: string;

  // Genres
  gFiction: string; gNonfiction: string; gSelfdev: string; gHistory: string;
  gScience: string; gNovels: string; gBiography: string; gThriller: string;
  gHorror: string; gPhilosophy: string; gPsychology: string; gBusiness: string;
  gTravel: string; gClassics: string; gManga: string;

  // Allergies
  aGluten: string; aLactose: string; aNuts: string; aEggs: string;
  aSoy: string; aSeafood: string;

  // Onboarding
  stepOf: string; goalQ: string; goalSub: string; activityQ: string;
  activitySub: string; sportsQ: string; sportsSub: string; dietQ: string;
  dietSub: string; allergiesQ: string; allergiesSub: string; targetWeightQ: string;
  targetWeightSub: string; genresQ: string; genresSub: string; freqQ: string;
  freqSub: string; planQ: string; planSub: string; planFree: string;
  planPaid: string; planFreePrice: string; planPaidPrice: string;
  recommended: string; selected: string; doneTitle: string; doneSub: string;
  letsGo: string; noAllergies: string; noSport: string;
  lose: string; gain: string; maintain: string; health: string;
  sedentary: string; light: string; moderate: string; veryActive: string;
  normal: string; vegetarian: string; vegan: string; keto: string; noPreference: string;
  never: string; monthly: string; biweekly: string; weekly: string;

  // Locked
  lockedMsg: string;
}

import bg from './bg';
import en from './en';
import el from './el';
import zh from './zh';
import jp from './jp';
import ko from './ko';
import de from './de';
import ru from './ru';
import fr from './fr';
import es from './es';
import it from './it';
import pt from './pt';

const translations: Record<Lang, T> = { BG: bg, EN: en, EL: el, ZH: zh, JP: jp, KO: ko, DE: de, RU: ru, FR: fr, ES: es, IT: it, PT: pt };

export default translations;
